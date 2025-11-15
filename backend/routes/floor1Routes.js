const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// ============== In-memory AI state for Floor 1 (demo/stub) ==============
let floor1AI = {
  active: false,
  peopleCount: 0,
  lastUpdate: null
};
const sseClients = new Set();
let workerProc = null; // spawned YOLOv8 sender process

// Separate state for Hot Desk
let floor1HD = {
  active: false,
  peopleCount: 0,
  lastUpdate: null
};
const sseClientsHD = new Set();
let workerProcHD = null;

function getYoloPaths() {
  const yoloDir = path.resolve(__dirname, '..', 'ai', 'yolov8');
  const venvPy = path.join(yoloDir, '.venv', 'Scripts', 'python.exe');
  const sender = path.join(yoloDir, 'sender.py');
  return { yoloDir, venvPy, sender };
}

function startWorkerIfNeeded() {
  if (workerProc) return { started: false, pid: workerProc.pid };
  const { yoloDir, venvPy, sender } = getYoloPaths();
  const pythonExe = fs.existsSync(venvPy) ? venvPy : 'python';
  if (!fs.existsSync(sender)) return { started: false, error: 'sender.py not found' };
  const backendUrl = process.env.SWSPACE_BACKEND_URL || 'http://localhost:5000';
  // Prefer provided source; fallback to demo video if exists; else webcam 0
  const demoVideo = path.resolve(__dirname, '..', 'video_demo.mp4');
  const sourceArg = process.env.SWSPACE_F1_SOURCE || (fs.existsSync(demoVideo) ? demoVideo : '0');
  const seatZones = path.join(yoloDir, 'seat_zones_floor1.json');
  const args = [sender, '--backend', backendUrl, '--namespace', 'ai', '--source', sourceArg];
  if (fs.existsSync(seatZones)) {
    args.push('--seat-zones', seatZones);
  }
  try {
    const child = spawn(pythonExe, args, { cwd: yoloDir, stdio: ['ignore', 'ignore', 'ignore'] });
    workerProc = child;
    child.on('exit', () => { workerProc = null; });
    return { started: true, pid: child.pid };
  } catch (e) {
    return { started: false, error: e.message };
  }
}

function startWorkerHDIfNeeded() {
  if (workerProcHD) return { started: false, pid: workerProcHD.pid };
  const { yoloDir, venvPy, sender } = getYoloPaths();
  const pythonExe = fs.existsSync(venvPy) ? venvPy : 'python';
  if (!fs.existsSync(sender)) return { started: false, error: 'sender.py not found' };
  const backendUrl = process.env.SWSPACE_BACKEND_URL || 'http://localhost:5000';
  // Hot Desk default is laptop webcam (0); allow override via SWSPACE_F1_HD_SOURCE
  const demoVideo = path.resolve(__dirname, '..', 'video_demo.mp4');
  const sourceArg = process.env.SWSPACE_F1_HD_SOURCE || '0';
    const args = [
      sender,
      '--backend', backendUrl,
      '--namespace', 'ai-hd',
      '--source', sourceArg,
      '--classes', '0',        // person only
      '--conf', '0.60',        // higher confidence
      '--min-area', '0.010',   // ignore tiny objects (<1% frame)
      '--face-verify', '1',    // enable face/shape heuristics
      '--ar-thresh', '1.2'     // prefer tall human-like boxes
    ];
  // No seat zones for HD by default
  try {
    const child = spawn(pythonExe, args, { cwd: yoloDir, stdio: ['ignore', 'ignore', 'ignore'] });
    workerProcHD = child;
    child.on('exit', () => { workerProcHD = null; });
    return { started: true, pid: child.pid };
  } catch (e) {
    return { started: false, error: e.message };
  }
}

function stopWorkerIfRunning() {
  if (!workerProc) return { stopped: false };
  const pid = workerProc.pid;
  try {
    if (process.platform === 'win32') {
      exec(`taskkill /PID ${pid} /T /F`, () => {});
    } else {
      workerProc.kill('SIGTERM');
    }
  } catch {}
  workerProc = null;
  return { stopped: true, pid };
}

function stopWorkerHDIfRunning() {
  if (!workerProcHD) return { stopped: false };
  const pid = workerProcHD.pid;
  try {
    if (process.platform === 'win32') {
      exec(`taskkill /PID ${pid} /T /F`, () => {});
    } else {
      workerProcHD.kill('SIGTERM');
    }
  } catch {}
  workerProcHD = null;
  return { stopped: true, pid };
}

function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch { /* ignore broken pipe */ }
  }
}

function sseBroadcastHD(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClientsHD) {
    try { res.write(payload); } catch {}
  }
}

// Map DB enum -> UI
const toUI = (dbStatus) => {
  switch (dbStatus) {
    case 'available': return 'Available';
    case 'occupied': return 'Occupied';
    case 'reserved': return 'Reserved';
    case 'disabled': return 'Maintenance';
    default: return 'Available';
  }
};

// Map UI -> DB enum
const toDB = (uiStatus) => {
  switch (uiStatus) {
    case 'Available': return 'available';
    case 'Occupied': return 'occupied';
    case 'Reserved': return 'reserved';
    case 'Maintenance': return 'disabled';
    default: return 'available';
  }
};

async function getFloor1FixedDeskZoneIds() {
  const sql = `
    SELECT z.id AS zone_id, z.name AS zone_name
    FROM zones z
    JOIN floors f ON z.floor_id = f.id
    JOIN services s ON z.service_id = s.id
    WHERE f.code = 'F1' AND s.code = 'fixed_desk'
  `;
  const { rows } = await db.query(sql);
  return rows;
}

async function getFloor1HotDeskZoneIds() {
  const sql = `
    SELECT z.id AS zone_id, z.name AS zone_name
    FROM zones z
    JOIN floors f ON z.floor_id = f.id
    JOIN services s ON z.service_id = s.id
    WHERE f.code = 'F1' AND s.code = 'hot_desk'
  `;
  const { rows } = await db.query(sql);
  return rows;
}

// GET fixed desks
router.get('/fixed-desks', async (req, res, next) => {
  try {
    const zones = await getFloor1FixedDeskZoneIds();
    if (!zones.length) return res.json([]);
    const zoneIds = zones.map(z => z.zone_id);
    const { rows } = await db.query(
      `SELECT s.seat_code, s.status, s.pos_x, s.pos_y, z.name AS zone
       FROM seats s
       JOIN zones z ON s.zone_id = z.id
       WHERE s.zone_id = ANY($1::bigint[]) 
       ORDER BY s.seat_code`,
      [zoneIds]
    );
    const data = rows.map(r => ({
      seatCode: r.seat_code,
      zone: r.zone,
      status: toUI(r.status),
      posX: r.pos_x,
      posY: r.pos_y
    }));
    res.json(data);
  } catch (e) { next(e); }
});

// Update seat status
router.post('/fixed-desks/:seatCode/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    const { status } = req.body || {};
    if (!seatCode || !status) return res.status(400).json({ error: 'seatCode and status are required' });
    const dbStatus = toDB(status);
    const { rowCount } = await db.query(
      'UPDATE seats SET status = $1 WHERE seat_code = $2',
      [dbStatus, seatCode]
    );
    if (!rowCount) return res.status(404).json({ error: 'Seat not found' });
    res.json({ seatCode, status });
  } catch (e) { next(e); }
});

// AI status endpoints
router.get('/ai/status', async (req, res, next) => {
  try {
    const { rows: floors } = await db.query('SELECT id FROM floors WHERE code = $1 LIMIT 1', ['F1']);
    if (!floors.length) return res.json({ peopleCount: 0, lastUpdate: null });
    const floorId = floors[0].id;
    const { rows } = await db.query(
      `SELECT people_count, detected_at 
       FROM occupancy_events 
       WHERE floor_id = $1 
       ORDER BY detected_at DESC 
       LIMIT 1`,
      [floorId]
    );
    if (!rows.length) return res.json({ peopleCount: floor1AI.peopleCount || 0, lastUpdate: floor1AI.lastUpdate });
    return res.json({ peopleCount: rows[0].people_count, lastUpdate: rows[0].detected_at });
  } catch (e) { next(e); }
});

router.post('/ai/status', async (req, res, next) => {
  try {
    const { peopleCount, cameraId = null, modelVersion = null, extra = null } = req.body || {};
    if (typeof peopleCount !== 'number') return res.status(400).json({ error: 'peopleCount (number) is required' });
    const { rows: floors } = await db.query('SELECT id FROM floors WHERE code = $1 LIMIT 1', ['F1']);
    if (!floors.length) return res.status(400).json({ error: 'Floor F1 not found' });
    const floorId = floors[0].id;
    const { rows } = await db.query(
      `INSERT INTO occupancy_events (camera_id, floor_id, zone_id, people_count, model_version, extra)
       VALUES ($1, $2, NULL, $3, $4, $5)
       RETURNING id, detected_at`,
      [cameraId, floorId, peopleCount, modelVersion, extra]
    );
    const detectedAt = rows[0].detected_at;
    // update in-memory and broadcast if active
    floor1AI.peopleCount = peopleCount;
    floor1AI.lastUpdate = detectedAt;
    if (floor1AI.active) sseBroadcast('ai.people', { peopleCount, detectedAt });
    res.json({ id: rows[0].id, detectedAt });
  } catch (e) { next(e); }
});

// Receive per-seat occupancy events from YOLO worker and broadcast to SSE
router.post('/ai/seat', (req, res) => {
  const { seatCode, occupied, detectedAt = new Date().toISOString() } = req.body || {};
  if (!seatCode || typeof occupied !== 'boolean') return res.status(400).json({ error: 'seatCode (string) and occupied (boolean) are required' });
  if (floor1AI.active) sseBroadcast('ai.seat', { seatCode, occupied, detectedAt });
  res.json({ ok: true });
});

// ---------- Hot Desk AI (separate namespace ai-hd) ----------
router.get('/ai-hd/status', (req, res) => {
  res.json({ peopleCount: floor1HD.peopleCount || 0, lastUpdate: floor1HD.lastUpdate });
});

router.post('/ai-hd/status', (req, res) => {
  const { peopleCount } = req.body || {};
  if (typeof peopleCount !== 'number') return res.status(400).json({ error: 'peopleCount (number) is required' });
  floor1HD.peopleCount = peopleCount;
  floor1HD.lastUpdate = new Date().toISOString();
  if (floor1HD.active) sseBroadcastHD('ai.people', { peopleCount, detectedAt: floor1HD.lastUpdate });
  res.json({ ok: true, detectedAt: floor1HD.lastUpdate });
});

router.get('/ai-hd/control', (req, res) => {
  res.json({ active: floor1HD.active });
});

router.post('/ai-hd/control', verifyToken, requireAdmin, (req, res) => {
  const { active } = req.body || {};
  const next = !!active;
  if (next && !floor1HD.active) {
    startWorkerHDIfNeeded();
  } else if (!next && floor1HD.active) {
    stopWorkerHDIfRunning();
    floor1HD.peopleCount = 0;
    floor1HD.lastUpdate = null;
  }
  floor1HD.active = next;
  sseBroadcastHD('ai.control', { active: floor1HD.active });
  res.json({ active: floor1HD.active });
});

router.get('/ai-hd/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write(`event: ai.hello\ndata: {"ok":true}\n\n`);
  sseClientsHD.add(res);
  req.on('close', () => {
    sseClientsHD.delete(res);
  });
});

// ---------- Hot Desk occupancy by datetime ----------
router.get('/hot-desk/occupancy', async (req, res, next) => {
  try {
    const atParam = req.query.at;
    const at = atParam ? new Date(atParam) : new Date();
    if (isNaN(at.getTime())) return res.status(400).json({ error: 'invalid at datetime' });

    const zones = await getFloor1HotDeskZoneIds();
    if (!zones.length) {
      // Fallback: if no zones, return zeros with total seats default 110 (project config)
      const totalSeats = 110;
      return res.json({
        at: at.toISOString(),
        breakdown: { day: 0, week: 0, month: 0, year: 0 },
        totals: { totalSeats, booked: 0, available: totalSeats, occupancyRate: 0 }
      });
    }
    const zoneIds = zones.map(z => z.zone_id);

    // Total seats
    const { rows: seatRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM seats WHERE zone_id = ANY($1::bigint[])`,
      [zoneIds]
    );
    const totalSeats = seatRows.length ? seatRows[0].total : 110;

    // Active bookings per package at time 'at'
    const { rows } = await db.query(
      `WITH hot_seats AS (
         SELECT id FROM seats WHERE zone_id = ANY($1::bigint[])
       )
       SELECT 
         COUNT(*) FILTER (
           WHERE sp.code = 'day' 
             AND b.start_time <= $2 
             AND b.start_time + INTERVAL '24 hours' > $2
         )::int AS day_active,
         COUNT(*) FILTER (
           WHERE sp.code = 'week'
             AND b.start_time <= $2 
             AND b.start_time + INTERVAL '7 days' > $2
         )::int AS week_active,
         COUNT(*) FILTER (
           WHERE sp.code = 'month'
             AND b.start_time <= $2 
             AND b.start_time + INTERVAL '30 days' > $2
         )::int AS month_active,
         COUNT(*) FILTER (
           WHERE sp.code = 'year'
             AND b.start_time <= $2 
             AND b.start_time + INTERVAL '365 days' > $2
         )::int AS year_active
       FROM bookings b
       JOIN hot_seats s ON s.id = b.seat_id
       JOIN service_packages sp ON sp.id = b.package_id`,
      [zoneIds, at.toISOString()]
    );
    const r = rows[0] || { day_active: 0, week_active: 0, month_active: 0, year_active: 0 };
    const day = r.day_active|0, week = r.week_active|0, month = r.month_active|0, year = r.year_active|0;
    const booked = day + week + month + year;
    const available = Math.max(0, totalSeats - booked);
    const occupancyRate = totalSeats ? Math.round((booked / totalSeats) * 100) : 0;

    res.json({
      at: at.toISOString(),
      breakdown: { day, week, month, year },
      totals: { totalSeats, booked, available, occupancyRate }
    });
  } catch (e) { next(e); }
});

// Control AI active/pause for Floor 1
router.get('/ai/control', (req, res) => {
  res.json({ active: floor1AI.active });
});

router.post('/ai/control', verifyToken, requireAdmin, (req, res) => {
  const { active } = req.body || {};
  const next = !!active;
  // start/stop local YOLO worker automatically (scoped to Floor 1 only)
  if (next && !floor1AI.active) {
    startWorkerIfNeeded();
  } else if (!next && floor1AI.active) {
    stopWorkerIfRunning();
    // also reset last known numbers so UI shows clean state
    floor1AI.peopleCount = 0;
    floor1AI.lastUpdate = null;
  }
  floor1AI.active = next;
  // notify clients about control change
  sseBroadcast('ai.control', { active: floor1AI.active });
  res.json({ active: floor1AI.active });
});

// SSE stream for real-time AI updates
router.get('/ai/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write(`event: ai.hello\ndata: {"ok":true}\n\n`);
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Seat details (for admin panel): include current/nearest booking and user info
router.get('/fixed-desks/:seatCode/detail', async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    if (!seatCode) return res.status(400).json({ error: 'seatCode is required' });
    const { rows } = await db.query(
      `WITH seat_row AS (
         SELECT s.id, s.seat_code, s.status, s.pos_x, s.pos_y, z.name AS zone
         FROM seats s
         JOIN zones z ON z.id = s.zone_id
         WHERE s.seat_code = $1
       ), latest_booking AS (
         SELECT b.*
         FROM bookings b
         JOIN seat_row sr ON sr.id = b.seat_id
         WHERE b.end_time >= NOW() -- còn hiệu lực hoặc tương lai gần
         ORDER BY b.updated_at DESC NULLS LAST
         LIMIT 1
       ), pay AS (
         SELECT p.*
         FROM payments p
         JOIN latest_booking b ON b.id = p.booking_id
         ORDER BY p.updated_at DESC NULLS LAST
         LIMIT 1
       )
       SELECT sr.seat_code, sr.zone, sr.status AS seat_status, sr.pos_x, sr.pos_y,
              b.id AS booking_id, b.start_time, b.end_time, b.status AS booking_status,
              u.id AS user_id, u.full_name, u.email, u.phone,
              sp.name AS package_name,
              pay.status AS payment_status
       FROM seat_row sr
       LEFT JOIN latest_booking b ON TRUE
       LEFT JOIN users u ON u.id = b.user_id
       LEFT JOIN service_packages sp ON sp.id = b.package_id
       LEFT JOIN pay ON TRUE`,
      [seatCode]
    );

    if (!rows.length) return res.status(404).json({ error: 'Seat not found' });
    const r = rows[0];
    const paymentUI = (() => {
      switch (r.payment_status) {
        case 'success': return 'Paid';
        case 'failed':
        case 'expired': return 'Overdue';
        case 'processing':
        case 'created':
        default: return r.booking_id ? 'Pending' : null;
      }
    })();
    const data = {
      seatCode: r.seat_code,
      zone: r.zone,
      status: toUI(r.seat_status),
      posX: r.pos_x,
      posY: r.pos_y,
      user: r.user_id ? {
        id: r.user_id,
        name: r.full_name,
        email: r.email,
        phone: r.phone
      } : null,
      booking: r.booking_id ? {
        id: r.booking_id,
        package: r.package_name,
        startDate: r.start_time,
        endDate: r.end_time,
        paymentStatus: paymentUI
      } : null
    };
    res.json(data);
  } catch (e) { next(e); }
});

// Availability for user frontend: block Maintenance and Occupied
router.get('/fixed-desks/:seatCode/availability', async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    const { rows } = await db.query(
      `SELECT s.id, s.status FROM seats s WHERE s.seat_code = $1 LIMIT 1`,
      [seatCode]
    );
    if (!rows.length) return res.status(404).json({ error: 'Seat not found' });
    const s = rows[0];
    if (s.status === 'disabled') return res.json({ seatCode, available: false, reason: 'maintenance' });
    if (s.status === 'occupied' || s.status === 'reserved') return res.json({ seatCode, available: false, reason: 'occupied' });
    return res.json({ seatCode, available: true });
  } catch (e) { next(e); }
});

module.exports = router;
