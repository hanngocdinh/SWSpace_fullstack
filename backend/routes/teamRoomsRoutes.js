const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  extractDateRangeFromQuery,
  getOccupancyMap
} = require('../utils/teamRoomOccupancy');

function toUI(dbStatus) {
  switch (dbStatus) {
    case 'available': return 'Available';
    case 'occupied': return 'Occupied';
    case 'reserved': return 'Occupied';
    case 'disabled': return 'Maintenance';
    default: return 'Available';
  }
}

function toDB(uiStatus) {
  switch (uiStatus) {
    case 'Available': return 'available';
    case 'Occupied': return 'occupied';
    case 'Maintenance': return 'disabled';
    default: return 'available';
  }
}

async function getServiceByCode(code) {
  const { rows } = await db.query(`SELECT id FROM services WHERE code = $1 LIMIT 1`, [code]);
  return rows[0]?.id || null;
}


// List room statuses by service type (meeting_room | private_office | networking)
router.get('/status', async (req, res, next) => {
  try {
    const { serviceType } = req.query;
    if (!serviceType) return res.status(400).json({ error: 'serviceType is required' });
    const serviceId = await getServiceByCode(String(serviceType).toLowerCase());
    if (!serviceId) return res.status(404).json({ error: 'Service not found' });
    const { rows } = await db.query(
      `SELECT r.room_code, r.capacity, r.status, z.floor_id, z.name AS zone_name
       FROM rooms r
       JOIN zones z ON z.id = r.zone_id
       WHERE z.service_id = $1
       ORDER BY r.room_code`,
      [serviceId]
    );
    const roomCodes = rows.map(r => r.room_code);
    const range = extractDateRangeFromQuery(req.query || {});
    const occupancyMap = roomCodes.length
      ? await getOccupancyMap(roomCodes, range, db.query)
      : new Map();
    const data = rows.map(r => {
      const booking = occupancyMap.get(r.room_code) || null;
      const status = booking ? 'Occupied' : toUI(r.status);
      return {
        roomCode: r.room_code,
        status,
        capacity: r.capacity,
        floor: r.floor_id,
        zone: r.zone_name,
        activeBooking: booking ? {
          bookingReference: booking.bookingReference,
          startDate: booking.startDate,
          endDate: booking.endDate,
          paymentStatus: booking.paymentStatusUI,
          phase: booking.phase
        } : null
      };
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/:roomCode/detail', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' });
    const { rows } = await db.query(
      `SELECT r.room_code, r.capacity, r.status, z.name AS zone_name, z.floor_id
       FROM rooms r
       JOIN zones z ON z.id = r.zone_id
       WHERE r.room_code = $1
       LIMIT 1`,
      [roomCode]
    );
    if (!rows.length) return res.status(404).json({ error: 'Room not found' });
    const room = rows[0];
    const range = extractDateRangeFromQuery(req.query || {});
    const occupancyMap = await getOccupancyMap([roomCode], range, db.query);
    const booking = occupancyMap.get(roomCode) || null;
    const status = booking ? 'Occupied' : toUI(room.status);
    res.json({
      roomCode: room.room_code,
      zone: room.zone_name,
      floor: room.floor_id,
      status,
      capacity: room.capacity,
      user: booking?.user || null,
      booking: booking ? {
        id: booking.bookingId,
        package: booking.packageName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        paymentStatus: booking.paymentStatusUI,
        bookingReference: booking.bookingReference,
        phase: booking.phase
      } : null
    });
  } catch (e) { next(e); }
});

router.get('/:roomCode/availability', async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' });
    const { rows } = await db.query('SELECT status FROM rooms WHERE room_code = $1 LIMIT 1', [roomCode]);
    if (!rows.length) return res.status(404).json({ error: 'Room not found' });
    const room = rows[0];
    if (room.status === 'disabled') {
      return res.json({ roomCode, available: false, reason: 'maintenance' });
    }
    const range = extractDateRangeFromQuery(req.query || {});
    const occupancyMap = await getOccupancyMap([roomCode], range, db.query);
    const booking = occupancyMap.get(roomCode) || null;
    if (booking) {
      const reason = 'occupied';
      return res.json({
        roomCode,
        available: false,
        reason,
        booking: {
          bookingReference: booking.bookingReference,
          startDate: booking.startDate,
          endDate: booking.endDate,
          phase: booking.phase
        }
      });
    }
    if (room.status === 'occupied' || room.status === 'reserved') {
      return res.json({ roomCode, available: false, reason: 'occupied' });
    }
    return res.json({ roomCode, available: true });
  } catch (e) { next(e); }
});

router.post('/:roomCode/cancel-booking', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { bookingId, reason } = req.body || {};
    if (!roomCode || !bookingId) {
      return res.status(400).json({ error: 'roomCode and bookingId are required' });
    }
    const cancelReason = (typeof reason === 'string' && reason.trim()) ? reason.trim() : 'Cancelled via admin panel';
    const { rows } = await db.query(
      `UPDATE bookings
         SET status = 'canceled',
             cancellation_reason = $3,
             cancelled_at = NOW(),
             payment_status = CASE WHEN payment_status = 'success' THEN 'refunded' ELSE payment_status END,
             updated_at = NOW()
       WHERE id = $1
         AND seat_code = $2
         AND status::text NOT IN ('canceled','cancelled')
       RETURNING id, seat_code, status, payment_status`,
      [bookingId, roomCode, cancelReason]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Active booking not found for room' });
    }
    await db.query(
      `UPDATE rooms SET status = 'available'
       WHERE room_code = $1 AND status IN ('occupied','reserved')`,
      [roomCode]
    );
    res.json({ success: true, booking: rows[0] });
  } catch (e) { next(e); }
});

// Update a room status by code (admin)
router.post('/:roomCode/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { status } = req.body || {};
    if (!roomCode || !status) return res.status(400).json({ error: 'roomCode and status are required' });
    const dbStatus = toDB(status);
    const { rowCount } = await db.query(`UPDATE rooms SET status = $1 WHERE room_code = $2`, [dbStatus, roomCode]);
    if (!rowCount) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true, roomCode, status });
  } catch (e) { next(e); }
});

// Seed/setup Floor 2 rooms M1..M4 (meeting_room) and P1 (private_office). Idempotent.
router.post('/setup/floor2', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const meetingId = await getServiceByCode('meeting_room');
    const privateId = await getServiceByCode('private_office');
    if (!meetingId || !privateId) return res.status(400).json({ error: 'Required services not found' });
    const { rows: zones } = await db.query(`SELECT id, service_id FROM zones WHERE floor_id = (SELECT id FROM floors WHERE code='F2')`);
    const mrZone = zones.find(z => z.service_id === meetingId)?.id;
    const poZone = zones.find(z => z.service_id === privateId)?.id;
    if (!mrZone || !poZone) return res.status(400).json({ error: 'Zones for Floor 2 not found' });

    // Capacities updated per UI requirement
    const upserts = [
      { zone: mrZone, code: 'M1', capacity: 14 },
      { zone: mrZone, code: 'M2', capacity: 13 },
      { zone: mrZone, code: 'M3', capacity: 11 },
      { zone: mrZone, code: 'M4', capacity: 13 },
      { zone: poZone, code: 'P1', capacity: 43 }
    ];
    const results = [];
    for (const r of upserts) {
      const { rows } = await db.query(
        `INSERT INTO rooms (zone_id, room_code, capacity, status)
         VALUES ($1,$2,$3,'available')
         ON CONFLICT (zone_id, room_code) DO UPDATE SET capacity = EXCLUDED.capacity
         RETURNING id, room_code`,
        [r.zone, r.code, r.capacity]
      );
      results.push(rows[0]);
    }
    res.json({ success: true, createdOrUpdated: results.map(r => r.room_code) });
  } catch (e) { next(e); }
});

// Seed/setup Floor 3 spaces N1..N3 (networking). Idempotent.
router.post('/setup/floor3', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const networkingId = await getServiceByCode('networking');
    if (!networkingId) return res.status(400).json({ error: 'Networking service not found' });
    const { rows: zones } = await db.query(`SELECT id, service_id FROM zones WHERE floor_id = (SELECT id FROM floors WHERE code='F3')`);
    const netZone = zones.find(z => z.service_id === networkingId)?.id;
    if (!netZone) return res.status(400).json({ error: 'Networking zone for Floor 3 not found' });

    // Capacities updated per UI requirement
    const upserts = [
      { zone: netZone, code: 'N1', capacity: 28 },
      { zone: netZone, code: 'N2', capacity: 32 },
      { zone: netZone, code: 'N3', capacity: 60 } // display will show "60-70"
    ];
    const results = [];
    for (const r of upserts) {
      const { rows } = await db.query(
        `INSERT INTO rooms (zone_id, room_code, capacity, status)
         VALUES ($1,$2,$3,'available')
         ON CONFLICT (zone_id, room_code) DO UPDATE SET capacity = EXCLUDED.capacity
         RETURNING id, room_code`,
        [r.zone, r.code, r.capacity]
      );
      results.push(rows[0]);
    }
    res.json({ success: true, createdOrUpdated: results.map(r => r.room_code) });
  } catch (e) { next(e); }
});

module.exports = router;
