const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const floorActivityFeed = require('../services/floorActivityFeed');

// In-memory AI state for Floor 3
let floor3AI = { active: false, peopleCount: 0, lastUpdate: null };
let floor3Activities = []; // {message, at}
const sseClients = new Set();
let workerProc = null; // spawned YOLOv8 sender process for Floor 3

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
  const sourceArg = process.env.SWSPACE_F3_SOURCE || '0';
  const args = [
    sender,
    '--backend', backendUrl,
    '--floor', 'floor3',
    '--namespace', 'ai',
    '--source', sourceArg,
    '--classes', '0',
    '--conf', '0.55',
    '--min-area', '0.004',
    '--face-verify', '1',
    '--ar-thresh', '0.8',
    '--draw-boxes', '1',
    '--max-dim', '640',
    '--jpeg-quality', '50'     // giảm độ trễ
  ];
  if (process.env.SWSPACE_STRICT_HUMAN !== '0') {
    args.push('--min-area', '0.004');
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

function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch {}
  }
}

function pushActivity(message, at) {
  if (!message) return;
  const occurredAt = at ? (at instanceof Date ? at : new Date(at)) : new Date();
  floor3Activities.unshift({ message, at: occurredAt });
  if (floor3Activities.length > 50) floor3Activities.pop();
  sseBroadcast('ai.activity', { message, at: occurredAt });
  floorActivityFeed.recordFloorEvent({ floor: 'floor3', source: 'ai', message, occurredAt });
}

// -------- Status mapping (same as seats) --------
const toUI = (dbStatus) => {
  switch (dbStatus) {
    case 'available': return 'Available';
    case 'occupied': return 'Occupied';
    case 'reserved': return 'Reserved';
    case 'disabled': return 'Maintenance';
    default: return 'Available';
  }
};
const toDB = (uiStatus) => {
  switch (uiStatus) {
    case 'Available': return 'available';
    case 'Occupied': return 'occupied';
    case 'Reserved': return 'reserved';
    case 'Maintenance': return 'disabled';
    default: return 'available';
  }
};

async function getFloor3ZoneIds() {
  const sql = `SELECT z.id AS zone_id, z.name AS zone_name, s.code AS service_code
               FROM zones z
               JOIN floors f ON f.id = z.floor_id
               JOIN services s ON s.id = z.service_id
               WHERE f.code = 'F3'`;
  const { rows } = await db.query(sql);
  return rows;
}

// -------- List spaces/rooms for Floor 3 --------
router.get('/rooms', async (req, res, next) => {
  try {
    const zones = await getFloor3ZoneIds();
    if (!zones.length) return res.json([]);
    const zoneIds = zones.map(z => z.zone_id);
    const { rows } = await db.query(
      `SELECT r.room_code, r.status, r.capacity, r.pos_x, r.pos_y, z.name AS zone
       FROM rooms r
       JOIN zones z ON z.id = r.zone_id
       WHERE r.zone_id = ANY($1::bigint[])
       ORDER BY r.room_code`,
      [zoneIds]
    );
    res.json(rows.map(r => ({
      roomCode: r.room_code,
      zone: r.zone,
      status: toUI(r.status),
      capacity: r.capacity,
      posX: r.pos_x,
      posY: r.pos_y
    })));
  } catch (e) { next(e); }
});

// Create space/room
router.post('/rooms', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode, capacity, zoneId } = req.body || {};
    if (!roomCode) return res.status(400).json({ error: 'roomCode is required' });
    const cap = parseInt(capacity, 10);
    if (Number.isNaN(cap) || cap <= 0) return res.status(400).json({ error: 'capacity must be positive integer' });
    const dup = await db.query('SELECT 1 FROM rooms WHERE room_code = $1 LIMIT 1', [roomCode]);
    if (dup.rowCount) return res.status(409).json({ error: 'Room code already exists' });
    const zones = await getFloor3ZoneIds();
    if (!zones.length) return res.status(400).json({ error: 'No zones found for Floor 3' });
    let targetZoneId = zoneId ? parseInt(zoneId, 10) : undefined;
    if (!targetZoneId) {
      const net = zones.find(z => z.service_code === 'networking');
      targetZoneId = net?.zone_id || zones[0].zone_id;
    }
    if (!zones.some(z => z.zone_id === targetZoneId)) return res.status(400).json({ error: 'Invalid zoneId for Floor 3' });
    await db.query('INSERT INTO rooms (zone_id, room_code, status, capacity) VALUES ($1, $2, $3, $4)', [targetZoneId, roomCode, 'available', cap]);
    res.status(201).json({ roomCode, capacity: cap, zoneId: targetZoneId, status: 'Available' });
  } catch (e) { next(e); }
});

// Update room
router.put('/rooms/:roomCode', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { newRoomCode, capacity } = req.body || {};
    const cap = capacity !== undefined ? parseInt(capacity, 10) : undefined;
    if (cap !== undefined && (Number.isNaN(cap) || cap <= 0)) return res.status(400).json({ error: 'capacity must be positive integer' });
    const current = await db.query('SELECT id FROM rooms WHERE room_code = $1 LIMIT 1', [roomCode]);
    if (!current.rowCount) return res.status(404).json({ error: 'Room not found' });
    const updates = [];
    const params = [];
    let idx = 1;
    if (newRoomCode && newRoomCode !== roomCode) {
      const dup = await db.query('SELECT 1 FROM rooms WHERE room_code = $1 LIMIT 1', [newRoomCode]);
      if (dup.rowCount) return res.status(409).json({ error: 'newRoomCode already exists' });
      updates.push(`room_code = $${idx++}`);
      params.push(newRoomCode);
    }
    if (cap !== undefined) {
      updates.push(`capacity = $${idx++}`);
      params.push(cap);
    }
    if (!updates.length) return res.json({ roomCode, capacity: cap });
    params.push(roomCode);
    await db.query(`UPDATE rooms SET ${updates.join(', ')} WHERE room_code = $${idx}`, params);
    res.json({ roomCode: newRoomCode || roomCode, capacity: cap });
  } catch (e) { next(e); }
});

// Delete room
router.delete('/rooms/:roomCode', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    if (!roomCode) return res.status(400).json({ error: 'roomCode param required' });
    const del = await db.query('DELETE FROM rooms WHERE room_code = $1', [roomCode]);
    if (!del.rowCount) return res.status(404).json({ error: 'Room not found' });
    res.json({ deleted: true, roomCode });
  } catch (e) { next(e); }
});

// Update room status
router.post('/rooms/:roomCode/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { status } = req.body || {};
    if (!roomCode || !status) return res.status(400).json({ error: 'roomCode and status are required' });
    const dbStatus = toDB(status);
    const upd = await db.query('UPDATE rooms SET status = $1 WHERE room_code = $2', [dbStatus, roomCode]);
    if (!upd.rowCount) return res.status(404).json({ error: 'Room not found' });
    res.json({ roomCode, status });
  } catch (e) { next(e); }
});

router.get('/ai/status', async (req, res, next) => {
  try {
    const { rows: floors } = await db.query('SELECT id FROM floors WHERE code = $1 LIMIT 1', ['F3']);
    if (!floors.length) return res.json({ peopleCount: 0, lastUpdate: null });
    const floorId = floors[0].id;
    const { rows } = await db.query(
      `SELECT people_count, detected_at FROM occupancy_events WHERE floor_id = $1 ORDER BY detected_at DESC LIMIT 1`,
      [floorId]
    );
    if (!rows.length) return res.json({ peopleCount: floor3AI.peopleCount || 0, lastUpdate: floor3AI.lastUpdate });
    return res.json({ peopleCount: rows[0].people_count, lastUpdate: rows[0].detected_at });
  } catch (e) { next(e); }
});

router.post('/ai/status', async (req, res, next) => {
  try {
    const { peopleCount, cameraId = null, modelVersion = null, extra = null, boxes = null, frame = null } = req.body || {};
    if (typeof peopleCount !== 'number') return res.status(400).json({ error: 'peopleCount (number) is required' });
    const { rows: floors } = await db.query('SELECT id FROM floors WHERE code = $1 LIMIT 1', ['F3']);
    if (!floors.length) return res.status(400).json({ error: 'Floor F3 not found' });
    const floorId = floors[0].id;
    const { rows } = await db.query(
      `INSERT INTO occupancy_events (camera_id, floor_id, zone_id, people_count, model_version, extra)
       VALUES ($1, $2, NULL, $3, $4, $5)
       RETURNING id, detected_at`,
      [cameraId, floorId, peopleCount, modelVersion, extra]
    );
    const detectedAt = rows[0].detected_at;
    const prev = floor3AI.peopleCount;
    floor3AI.peopleCount = peopleCount;
    floor3AI.lastUpdate = detectedAt;
    if (floor3AI.active) sseBroadcast('ai.people', { peopleCount, detectedAt, boxes, frame });
    if (peopleCount > 0) {
      pushActivity(`People detected: ${peopleCount}`, detectedAt);
    } else if (prev > 0 && peopleCount === 0) {
      pushActivity('Floor 3 is now empty', detectedAt);
    }
    res.json({ id: rows[0].id, detectedAt, boxes, frame });
  } catch (e) { next(e); }
});

router.get('/ai/control', (req, res) => {
  res.json({ active: floor3AI.active });
});

router.post('/ai/control', verifyToken, requireAdmin, (req, res) => {
  const { active } = req.body || {};
  const next = !!active;
  if (next && !floor3AI.active) {
    startWorkerIfNeeded();
  } else if (!next && floor3AI.active) {
    stopWorkerIfRunning();
    floor3AI.peopleCount = 0;
    floor3AI.lastUpdate = null;
  }
  floor3AI.active = next;
  sseBroadcast('ai.control', { active: floor3AI.active });
  res.json({ active: floor3AI.active });
});

router.get('/ai/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write(`event: ai.hello\ndata: {"ok":true}\n\n`);
  sseClients.add(res);
  req.on('close', () => { sseClients.delete(res); });
});

router.get('/ai/activities', (req, res) => {
  res.json({ items: floor3Activities });
});

module.exports = router;
