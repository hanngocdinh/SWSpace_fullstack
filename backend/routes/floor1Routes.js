const express = require('express');
const router = express.Router();
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const multer = require('multer');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const floorActivityFeed = require('../services/floorActivityFeed');

const HOT_DESK_CAPACITY = 110;
const FLOOR1_TIMEZONE = process.env.FLOOR1_TIMEZONE || 'Asia/Ho_Chi_Minh';

function formatLocalTimestamp(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const pick = (type) => parts.find((p) => p.type === type)?.value || '00';
  return `${pick('year')}-${pick('month')}-${pick('day')} ${pick('hour')}:${pick('minute')}:${pick('second')}`;
}

// ============== In-memory AI state for Floor 1 (demo/stub) ==============
let floor1AI = {
  active: false,
  peopleCount: 0,
  lastUpdate: null
};
let floor1Activities = []; // {message, at}
const sseClients = new Set();
let workerProc = null; // spawned YOLOv8 sender process
const videoPersistPath = path.resolve(__dirname, '..', 'ai', 'yolov8', 'floor1_video_source.txt');
let floor1VideoSource = null; // absolute path of uploaded video (fixed desk)
floor1VideoSource = loadPersistedVideoSource();

// Separate state for Hot Desk
let floor1HD = {
  active: false,
  peopleCount: 0,
  lastUpdate: null
};
let floor1HDActivities = []; // {message, at}
const sseClientsHD = new Set();
let workerProcHD = null;

function getYoloPaths() {
  const yoloDir = path.resolve(__dirname, '..', 'ai', 'yolov8');
  const venvPy = path.join(yoloDir, '.venv', 'Scripts', 'python.exe');
  const sender = path.join(yoloDir, 'sender.py');
  return { yoloDir, venvPy, sender };
}

function loadPersistedVideoSource() {
  try {
    if (!fs.existsSync(videoPersistPath)) return null;
    const raw = fs.readFileSync(videoPersistPath, 'utf8').trim();
    if (!raw) return null;
    return fs.existsSync(raw) ? raw : null;
  } catch {
    return null;
  }
}

function persistVideoSource(filePath) {
  try {
    if (!filePath) {
      if (fs.existsSync(videoPersistPath)) fs.unlinkSync(videoPersistPath);
    } else {
      fs.writeFileSync(videoPersistPath, filePath, 'utf8');
    }
  } catch {
    /* ignore */
  }
}

function resolveCurrentVideoSource() {
  if (floor1VideoSource && fs.existsSync(floor1VideoSource)) return floor1VideoSource;
  const persisted = loadPersistedVideoSource();
  if (persisted) {
    floor1VideoSource = persisted;
    return floor1VideoSource;
  }
  floor1VideoSource = null;
  return null;
}

function startWorkerIfNeeded() {
  if (workerProc) return { started: false, pid: workerProc.pid };
  const { yoloDir, venvPy, sender } = getYoloPaths();
  const pythonExe = fs.existsSync(venvPy) ? venvPy : 'python';
  if (!fs.existsSync(sender)) return { started: false, error: 'sender.py not found' };
  const backendUrl = process.env.SWSPACE_BACKEND_URL || 'http://localhost:5000';
  const userVideo = resolveCurrentVideoSource();
  if (!userVideo) {
    return { started: false, error: 'upload-required' };
  }
  const sourceArg = userVideo;
  const seatZones = path.join(yoloDir, 'seat_zones_floor1.json');
  const args = [
    sender,
    '--backend', backendUrl,
    '--namespace', 'ai',
    '--source', sourceArg,
    '--classes', '0',
    '--conf', '0.40',
    '--min-area', '0.003',
    '--face-verify', '1',
    '--ar-thresh', '0.8',
    '--draw-boxes', '0',
    '--max-dim', '960',
    '--jpeg-quality', '60',
    '--imgsz', '960',
    '--iou', '0.55',
    '--post-interval', '0.6',
    '--stream-max-dim', '720'
  ];
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
      '--classes', '0',
      '--conf', '0.55',
      '--min-area', '0.004',
      '--face-verify', '1',
      '--ar-thresh', '0.8',
      '--draw-boxes', '1',
      '--max-dim', '640',
      '--jpeg-quality', '45'       // hot desk cần nhanh hơn -> 45
    ];
    if (process.env.SWSPACE_STRICT_HUMAN !== '0') {
      args.push('--min-area', '0.004');
    }
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
function pushActivity(arr, message, at, broadcastFn, meta = {}) {
  if (!message) return;
  const occurredAt = at ? (at instanceof Date ? at : new Date(at)) : new Date();
  arr.unshift({ message, at: occurredAt });
  if (arr.length > 50) arr.pop();
  broadcastFn('ai.activity', { message, at: occurredAt });
  floorActivityFeed.recordFloorEvent({
    floor: meta.floor || 'floor1',
    source: meta.source || null,
    message,
    occurredAt,
    metadata: meta.metadata || null
  });
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

const BLOCKING_BOOKING_STATUSES = new Set(['paid', 'checked_in', 'checked_out']);
const PAYMENT_SUCCESS_STATES = new Set(['success']);

function mapPaymentStatusToUI(status) {
  switch (status) {
    case 'success': return 'Paid';
    case 'failed':
    case 'expired': return 'Overdue';
    case 'processing':
    case 'created':
    default: return status ? 'Pending' : null;
  }
}

function classifyBookingPhase(start, now = new Date()) {
  if (!start) return 'upcoming';
  return new Date(start) <= now ? 'current' : 'upcoming';
}

function selectPreferredOccupancy(current, candidate) {
  if (!current) return candidate;
  if (!candidate) return current;
  if (current.phase === 'current' && candidate.phase !== 'current') return current;
  if (candidate.phase === 'current' && current.phase !== 'current') return candidate;
  const currentStart = new Date(current.startDate);
  const candidateStart = new Date(candidate.startDate);
  return candidateStart < currentStart ? candidate : current;
}

function parseDateTimeInput(value, timeValue, { fallbackEndOfDay = false } = {}) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  const stringVal = typeof value === 'string' ? value : '';
  const hasTimeComponent = /T\d{2}:\d{2}/.test(stringVal) || /(\s|^)\d{1,2}:\d{2}/.test(stringVal);
  if (!hasTimeComponent) {
    if (typeof timeValue === 'string' && timeValue.trim()) {
      const [h = '0', m = '0'] = timeValue.split(':');
      const hour = Number.parseInt(h, 10);
      const minute = Number.parseInt(m, 10);
      dt.setHours(Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0, 0, 0);
    } else if (fallbackEndOfDay) {
      dt.setHours(23, 59, 59, 999);
    } else {
      dt.setHours(0, 0, 0, 0);
    }
  }
  return dt;
}

function extractDateRangeFromQuery(query = {}) {
  const startDateInput = query.startDate || query.date || null;
  const endDateInput = query.endDate || query.date || query.startDate || null;
  const startTimeInput = query.startTime || query.time || null;
  const endTimeInput = query.endTime || query.time || null;
  const rangeStart = parseDateTimeInput(startDateInput, startTimeInput, { fallbackEndOfDay: false });
  let rangeEnd = parseDateTimeInput(endDateInput, endTimeInput, { fallbackEndOfDay: true });
  if (rangeStart && !rangeEnd) {
    rangeEnd = new Date(rangeStart);
    rangeEnd.setHours(23, 59, 59, 999);
  }
  if (rangeStart && rangeEnd && rangeEnd <= rangeStart) {
    rangeEnd = new Date(rangeStart.getTime() + 60 * 1000);
  }
  return { rangeStart, rangeEnd };
}


async function getSeatOccupancyMap(seatCodes, options = {}) {
  if (!Array.isArray(seatCodes) || !seatCodes.length) return new Map();
  const { rangeStart = null, rangeEnd = null } = options;
  const params = [seatCodes, Array.from(BLOCKING_BOOKING_STATUSES), Array.from(PAYMENT_SUCCESS_STATES)];
  const whereClauses = [
    'b.seat_code = ANY($1::text[])',
    'b.end_time > NOW()',
    'b.status::text = ANY($2::text[])',
    `(b.payment_status::text = ANY($3::text[]) OR b.status IN ('checked_in','checked_out'))`
  ];
  let paramIndex = params.length + 1;
  if (rangeStart && rangeEnd) {
    params.push(rangeStart, rangeEnd);
    whereClauses.push(`b.start_time <= $${paramIndex + 1} AND b.end_time >= $${paramIndex}`);
    paramIndex += 2;
  }
  const { rows } = await db.query(
    `SELECT b.id, b.seat_code, b.seat_name, b.start_time, b.end_time, b.status,
            b.payment_status, b.booking_reference, b.service_type, sp.name AS package_name,
            u.id AS user_id, u.full_name, u.email, u.phone
     FROM bookings b
     LEFT JOIN service_packages sp ON sp.id = b.package_id
     LEFT JOIN users u ON u.id = b.user_id
     WHERE ${whereClauses.join('\n       AND ')}
     ORDER BY b.start_time ASC`,
    params
  );
  const now = new Date();
  const occupancy = new Map();
  for (const row of rows) {
    if (!row || !row.seat_code) continue;
    if (!row.end_time || new Date(row.end_time) <= now) continue;
    const phase = classifyBookingPhase(row.start_time, now);
    const bookingInfo = {
      bookingId: row.id,
      seatCode: row.seat_code,
      seatName: row.seat_name,
      bookingReference: row.booking_reference,
      startDate: row.start_time,
      endDate: row.end_time,
      status: row.status,
      paymentStatus: row.payment_status,
      paymentStatusUI: mapPaymentStatusToUI(row.payment_status),
      packageName: row.package_name || row.service_type || null,
      phase,
      user: row.user_id ? {
        id: row.user_id,
        name: row.full_name,
        email: row.email,
        phone: row.phone
      } : null
    };
    const prev = occupancy.get(row.seat_code);
    occupancy.set(row.seat_code, selectPreferredOccupancy(prev, bookingInfo));
  }
  return occupancy;
}





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
// List all Fixed Desk seats (admin + user)
router.get('/fixed-desks', async (req, res, next) => {
  try {
    const zones = await getFloor1FixedDeskZoneIds();
    if (!zones.length) return res.json([]);
    const zoneIds = zones.map(z => z.zone_id);
    const { rows } = await db.query(
      `SELECT s.seat_code, s.status, s.pos_x, s.pos_y, s.capacity, z.name AS zone
       FROM seats s
       JOIN zones z ON s.zone_id = z.id
       WHERE s.zone_id = ANY($1::bigint[]) 
       ORDER BY s.seat_code`,
      [zoneIds]
    );
    const seatCodes = rows.map(r => r.seat_code);
    const range = extractDateRangeFromQuery(req.query);
    const occupancyMap = seatCodes.length ? await getSeatOccupancyMap(seatCodes, range) : new Map();
    const data = rows.map(r => {
      const booking = occupancyMap.get(r.seat_code) || null;
      const status = booking ? (booking.phase === 'current' ? 'Occupied' : 'Reserved') : toUI(r.status);
      return {
        seatCode: r.seat_code,
        zone: r.zone,
        status,
        posX: r.pos_x,
        posY: r.pos_y,
        capacity: r.capacity,
        activeBooking: booking ? {
          bookingReference: booking.bookingReference,
          startDate: booking.startDate,
          endDate: booking.endDate,
          paymentStatus: booking.paymentStatusUI,
          phase: booking.phase
        } : null
      };
    });
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
    const { peopleCount, cameraId = null, modelVersion = null, extra = null, boxes = null, frame = null } = req.body || {};
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
    const prev = floor1AI.peopleCount;
    floor1AI.peopleCount = peopleCount;
    floor1AI.lastUpdate = detectedAt;
    if (floor1AI.active) sseBroadcast('ai.people', { peopleCount, detectedAt, boxes, frame });
    if (peopleCount > 0) {
      pushActivity(floor1Activities, `People detected: ${peopleCount}`, detectedAt, sseBroadcast, { floor: 'floor1', source: 'fixed-desk' });
    } else if (prev > 0 && peopleCount === 0) {
      pushActivity(floor1Activities, 'Floor 1 is now empty', detectedAt, sseBroadcast, { floor: 'floor1', source: 'fixed-desk' });
    }
    res.json({ id: rows[0].id, detectedAt, boxes, frame });
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
  const { peopleCount, boxes = null, frame = null } = req.body || {};
  if (typeof peopleCount !== 'number') return res.status(400).json({ error: 'peopleCount (number) is required' });
  const detectedAt = new Date().toISOString();
  const prev = floor1HD.peopleCount;
  floor1HD.peopleCount = peopleCount;
  floor1HD.lastUpdate = detectedAt;
  if (floor1HD.active) sseBroadcastHD('ai.people', { peopleCount, detectedAt, boxes, frame });
  if (peopleCount > 0) {
    pushActivity(floor1HDActivities, `People detected: ${peopleCount}`, detectedAt, sseBroadcastHD, { floor: 'floor1', source: 'hot-desk' });
  } else if (prev > 0 && peopleCount === 0) {
    pushActivity(floor1HDActivities, 'Hot Desk Floor 1 is now empty', detectedAt, sseBroadcastHD, { floor: 'floor1', source: 'hot-desk' });
  }
  res.json({ ok: true, detectedAt, boxes, frame });
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

// Activities endpoints (recent AI events)
router.get('/ai/activities', (req, res) => {
  res.json({ items: floor1Activities });
});
router.get('/ai-hd/activities', (req, res) => {
  res.json({ items: floor1HDActivities });
});

// ---------- Hot Desk occupancy by datetime ----------
router.get('/hot-desk/occupancy', async (req, res, next) => {
  try {
    const atParam = req.query.at;
    const at = atParam ? new Date(atParam) : new Date();
    if (Number.isNaN(at.getTime())) {
      return res.status(400).json({ error: 'invalid at datetime' });
    }

    const atLocal = formatLocalTimestamp(at, FLOOR1_TIMEZONE);

    const { rows } = await db.query(
      `WITH base AS (
         SELECT
           b.id,
           b.start_time,
           b.end_time,
           CASE
             WHEN LOWER(tu.code) IN ('day','daily') THEN 'day'
             WHEN LOWER(tu.code) IN ('week','weekly') THEN 'week'
             WHEN LOWER(tu.code) IN ('month','monthly') THEN 'month'
             WHEN LOWER(tu.code) IN ('year','yearly','annual') THEN 'year'
             WHEN tu.days_equivalent = 1 THEN 'day'
             WHEN tu.days_equivalent BETWEEN 2 AND 8 THEN 'week'
             WHEN tu.days_equivalent BETWEEN 9 AND 45 THEN 'month'
             WHEN tu.days_equivalent >= 46 THEN 'year'
             WHEN LOWER(sp.name) LIKE '%day%' OR sp.access_days = 1 THEN 'day'
             WHEN LOWER(sp.name) LIKE '%week%' OR sp.access_days BETWEEN 2 AND 8 THEN 'week'
             WHEN LOWER(sp.name) LIKE '%month%' OR sp.access_days BETWEEN 9 AND 45 THEN 'month'
             WHEN LOWER(sp.name) LIKE '%year%' OR sp.access_days >= 46 THEN 'year'
             WHEN b.package_duration !~ '^[0-9]+$' THEN (
               CASE
                 WHEN LOWER(b.package_duration) IN ('day','daily','1 day','one day') THEN 'day'
                 WHEN LOWER(b.package_duration) IN ('week','weekly','1 week','seven days','7 days','7-day') THEN 'week'
                 WHEN LOWER(b.package_duration) IN ('month','monthly','30 days','30-day','thirty days') THEN 'month'
                 WHEN LOWER(b.package_duration) IN ('year','yearly','annual','365 days','365-day') THEN 'year'
                 ELSE NULL
               END
             )
             ELSE NULL
           END AS duration_guess
         FROM bookings b
         LEFT JOIN service_packages sp ON sp.id = COALESCE(
           b.package_id,
           CASE WHEN b.package_duration ~ '^[0-9]+$' THEN b.package_duration::bigint ELSE NULL END
         )
         LEFT JOIN time_units tu ON tu.id = sp.unit_id
         WHERE b.service_type = 'hot-desk'
           AND b.status = 'paid'
       ),
       normalized AS (
         SELECT
           id,
           start_time,
           COALESCE(
             end_time,
             start_time + COALESCE(
               CASE duration_guess
                 WHEN 'day' THEN INTERVAL '1 day'
                 WHEN 'week' THEN INTERVAL '7 days'
                 WHEN 'month' THEN INTERVAL '30 days'
                 WHEN 'year' THEN INTERVAL '365 days'
                 ELSE NULL
               END,
               INTERVAL '1 hour'
             )
           ) AS effective_end,
           COALESCE(
             duration_guess,
             CASE
               WHEN end_time IS NULL THEN NULL
               WHEN end_time - start_time >= INTERVAL '330 days' THEN 'year'
               WHEN end_time - start_time >= INTERVAL '27 days' THEN 'month'
               WHEN end_time - start_time >= INTERVAL '6 days' THEN 'week'
               WHEN end_time - start_time >= INTERVAL '8 hours' THEN 'day'
               ELSE NULL
             END
           ) AS duration_code
         FROM base
       )
       SELECT
         COUNT(*) FILTER (WHERE duration_code = 'day' AND start_time <= $1::timestamp AND effective_end >= $1::timestamp)::int AS day_active,
         COUNT(*) FILTER (WHERE duration_code = 'week' AND start_time <= $1::timestamp AND effective_end >= $1::timestamp)::int AS week_active,
         COUNT(*) FILTER (WHERE duration_code = 'month' AND start_time <= $1::timestamp AND effective_end >= $1::timestamp)::int AS month_active,
         COUNT(*) FILTER (WHERE duration_code = 'year' AND start_time <= $1::timestamp AND effective_end >= $1::timestamp)::int AS year_active,
         COUNT(*) FILTER (WHERE start_time <= $1::timestamp AND effective_end >= $1::timestamp)::int AS total_active
       FROM normalized`,
      [atLocal]
    );

    const stats = rows[0] || { day_active: 0, week_active: 0, month_active: 0, year_active: 0, total_active: 0 };
    const day = stats.day_active | 0;
    const week = stats.week_active | 0;
    const month = stats.month_active | 0;
    const year = stats.year_active | 0;
    const booked = stats.total_active | 0;
    const available = Math.max(0, HOT_DESK_CAPACITY - booked);
    const occupancyRate = HOT_DESK_CAPACITY
      ? Number(((booked / HOT_DESK_CAPACITY) * 100).toFixed(1))
      : 0;

    res.json({
      at: at.toISOString(),
      atLocal,
      breakdown: { day, week, month, year },
      totals: {
        totalSeats: HOT_DESK_CAPACITY,
        booked,
        available,
        occupancyRate
      }
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
    const result = startWorkerIfNeeded();
    if (result && result.error) {
      const status = result.error === 'upload-required' ? 400 : 500;
      const message = result.error === 'upload-required' ? 'Upload a video before activating AI detection.' : result.error;
      return res.status(status).json({ error: message });
    }
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
// Seat detail for admin panel
router.get('/fixed-desks/:seatCode/detail', async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    if (!seatCode) return res.status(400).json({ error: 'seatCode is required' });
    const { rows } = await db.query(
      `SELECT s.seat_code, s.status AS seat_status, s.pos_x, s.pos_y, s.capacity, z.name AS zone
       FROM seats s
       JOIN zones z ON z.id = s.zone_id
       WHERE s.seat_code = $1
       LIMIT 1`,
      [seatCode]
    );
    if (!rows.length) return res.status(404).json({ error: 'Seat not found' });
    const seat = rows[0];
    const range = extractDateRangeFromQuery(req.query);
    const occupancyMap = await getSeatOccupancyMap([seatCode], range);
    const booking = occupancyMap.get(seatCode) || null;
    const seatStatus = booking ? (booking.phase === 'current' ? 'Occupied' : 'Reserved') : toUI(seat.seat_status);
    const data = {
      seatCode: seat.seat_code,
      zone: seat.zone,
      status: seatStatus,
      posX: seat.pos_x,
      posY: seat.pos_y,
      capacity: seat.capacity,
      user: booking?.user || null,
      booking: booking ? {
        id: booking.bookingId,
        package: booking.packageName,
        startDate: booking.startDate,
        endDate: booking.endDate,
        paymentStatus: booking.paymentStatusUI,
        phase: booking.phase,
        bookingReference: booking.bookingReference
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
    const range = extractDateRangeFromQuery(req.query);
    const occupancyMap = await getSeatOccupancyMap([seatCode], range);
    const booking = occupancyMap.get(seatCode) || null;
    if (booking) {
      const reason = booking.phase === 'current' ? 'occupied' : 'reserved';
      return res.json({
        seatCode,
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
    if (s.status === 'occupied' || s.status === 'reserved') return res.json({ seatCode, available: false, reason: 'occupied' });
    return res.json({ seatCode, available: true });
  } catch (e) { next(e); }
});

// Cancel the active booking for a seat (admin action)
router.post('/fixed-desks/:seatCode/cancel-booking', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    const { bookingId, reason } = req.body || {};
    if (!seatCode || !bookingId) {
      return res.status(400).json({ error: 'seatCode and bookingId are required' });
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
      [bookingId, seatCode, cancelReason]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Active booking not found for seat' });
    }
    await db.query(
      `UPDATE seats SET status = 'available'
       WHERE seat_code = $1 AND status IN ('occupied','reserved')`,
      [seatCode]
    );
    res.json({ success: true, booking: rows[0] });
  } catch (e) { next(e); }
});

// ----------------- CRUD: Create a new seat -----------------
router.post('/fixed-desks', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { seatCode, capacity, zoneId } = req.body || {};
    if (!seatCode) return res.status(400).json({ error: 'seatCode is required' });
    const cap = parseInt(capacity, 10);
    if (Number.isNaN(cap) || cap <= 0) return res.status(400).json({ error: 'capacity must be a positive integer' });
    // Ensure unique seat code
    const exists = await db.query('SELECT 1 FROM seats WHERE seat_code = $1 LIMIT 1', [seatCode]);
    if (exists.rowCount) return res.status(409).json({ error: 'Seat code already exists' });
    // Determine zone
    const zones = await getFloor1FixedDeskZoneIds();
    if (!zones.length) return res.status(400).json({ error: 'No Fixed Desk zones configured for Floor 1' });
    let targetZoneId = zoneId ? parseInt(zoneId, 10) : zones[0].zone_id;
    if (!zones.some(z => z.zone_id === targetZoneId)) return res.status(400).json({ error: 'Invalid zoneId for Floor 1 Fixed Desk' });
    await db.query(
      'INSERT INTO seats (zone_id, seat_code, status, capacity) VALUES ($1, $2, $3, $4)',
      [targetZoneId, seatCode, 'available', cap]
    );
    res.status(201).json({ seatCode, capacity: cap, zoneId: targetZoneId, status: 'Available' });
  } catch (e) { next(e); }
});

// ----------------- CRUD: Update seat (rename / capacity) -----------------
router.put('/fixed-desks/:seatCode', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    const { newSeatCode, capacity } = req.body || {};
    if (!seatCode) return res.status(400).json({ error: 'seatCode param required' });
    const cap = capacity !== undefined ? parseInt(capacity, 10) : undefined;
    if (cap !== undefined && (Number.isNaN(cap) || cap <= 0)) return res.status(400).json({ error: 'capacity must be positive integer' });
    // Check existing seat
    const seatRes = await db.query('SELECT id FROM seats WHERE seat_code = $1 LIMIT 1', [seatCode]);
    if (!seatRes.rowCount) return res.status(404).json({ error: 'Seat not found' });
    const updates = [];
    const params = [];
    let idx = 1;
    if (newSeatCode && newSeatCode !== seatCode) {
      const dup = await db.query('SELECT 1 FROM seats WHERE seat_code = $1 LIMIT 1', [newSeatCode]);
      if (dup.rowCount) return res.status(409).json({ error: 'newSeatCode already exists' });
      updates.push(`seat_code = $${idx++}`);
      params.push(newSeatCode);
    }
    if (cap !== undefined) {
      updates.push(`capacity = $${idx++}`);
      params.push(cap);
    }
    if (!updates.length) return res.json({ seatCode, capacity: cap });
    params.push(seatCode);
    await db.query(`UPDATE seats SET ${updates.join(', ')} WHERE seat_code = $${idx}`, params);
    res.json({ seatCode: newSeatCode || seatCode, capacity: cap });
  } catch (e) { next(e); }
});

// ----------------- CRUD: Delete seat -----------------
router.delete('/fixed-desks/:seatCode', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { seatCode } = req.params;
    if (!seatCode) return res.status(400).json({ error: 'seatCode param required' });
    // Active bookings check
    const active = await db.query(
      `SELECT COUNT(*)::int AS cnt
       FROM bookings b
       JOIN seats s ON s.id = b.seat_id
       WHERE s.seat_code = $1 AND b.end_time > NOW()`,
      [seatCode]
    );
    if (active.rows[0].cnt > 0) return res.status(409).json({ error: 'Seat has active bookings; cannot delete' });
    const del = await db.query('DELETE FROM seats WHERE seat_code = $1', [seatCode]);
    if (!del.rowCount) return res.status(404).json({ error: 'Seat not found' });
    res.json({ deleted: true, seatCode });
  } catch (e) { next(e); }
});

module.exports = router;

// ================== Upload video & Seat Zones (Fixed Desk calibration) ==================
// Cấu hình lưu file upload
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

// Upload MP4 video to be used as the YOLO source for the fixed desk camera
router.post('/ai/upload-video', verifyToken, requireAdmin, upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
  // Only accept .mp4 for now
  if (!/\.mp4$/i.test(req.file.originalname)) {
    return res.status(400).json({ error: 'Only .mp4 supported at the moment' });
  }
  // Persist absolute path so the worker (running in another cwd) can open it
  floor1VideoSource = path.resolve(req.file.path);
  persistVideoSource(floor1VideoSource);
  // If AI is currently active, stop the worker and signal clients to press Active again
  if (floor1AI.active) {
    try { stopWorkerIfRunning(); } catch {}
    floor1AI.active = false;
    floor1AI.peopleCount = 0;
    floor1AI.lastUpdate = null;
    sseBroadcast('ai.control', { active: false });
    sseBroadcast('ai.people', { peopleCount: 0, detectedAt: new Date().toISOString(), boxes: [], frame: null });
  }
  res.json({ ok: true, filename: path.basename(req.file.path), url: `/uploads/${path.basename(req.file.path)}` });
});

// Đọc seat zones từ file JSON
router.get('/ai/seat-zones', (req, res) => {
  try {
    const { yoloDir } = getYoloPaths();
    const filePath = path.join(yoloDir, 'seat_zones_floor1.json');
    if (!fs.existsSync(filePath)) return res.json({ items: [] });
    const raw = fs.readFileSync(filePath, 'utf8');
    const items = JSON.parse(raw);
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read seat zones', detail: e.message });
  }
});

// Lưu / cập nhật một seat zone polygon (mảng [ [x,y], ... ]) giá trị đã được chuẩn hoá 0..1
router.post('/ai/seat-zones', verifyToken, requireAdmin, (req, res) => {
  const { seatCode, polygon } = req.body || {};
  if (!seatCode || !Array.isArray(polygon)) {
    return res.status(400).json({ error: 'seatCode và polygon (mảng) là bắt buộc' });
  }
  if (polygon.length > 0 && polygon.length < 3) {
    return res.status(400).json({ error: 'Polygon cần tối thiểu 3 điểm hoặc rỗng để xoá zone' });
  }
  try {
    const { yoloDir } = getYoloPaths();
    const filePath = path.join(yoloDir, 'seat_zones_floor1.json');
    let items = [];
    if (fs.existsSync(filePath)) {
      items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    // loại bỏ seatCode cũ nếu tồn tại
    items = items.filter(z => z.seatCode !== seatCode);
    if (polygon.length >= 3) {
      items.push({ seatCode, polygon });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ ok: true, seatCode, polygon, removed: polygon.length === 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save seat zone', detail: e.message });
  }
});


