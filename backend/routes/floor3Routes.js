const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// In-memory AI state for Floor 3
let floor3AI = { active: false, peopleCount: 0, lastUpdate: null };
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
    '--conf', '0.60',
    '--min-area', '0.010',
    '--face-verify', '1',
    '--ar-thresh', '1.2'
  ];
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
    const { peopleCount, cameraId = null, modelVersion = null, extra = null } = req.body || {};
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
    floor3AI.peopleCount = peopleCount;
    floor3AI.lastUpdate = detectedAt;
    if (floor3AI.active) sseBroadcast('ai.people', { peopleCount, detectedAt });
    res.json({ id: rows[0].id, detectedAt });
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

module.exports = router;
