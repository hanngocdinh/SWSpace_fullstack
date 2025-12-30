const { getPgPool } = require('../config/pg');

const BLOCKING_BOOKING_STATUSES = ['paid', 'checked_in', 'checked_out'];
const PAYMENT_SUCCESS_STATES = ['success'];
const pool = getPgPool();

function mapPaymentStatusToUI(status) {
  switch (status) {
    case 'success':
      return 'Paid';
    case 'failed':
    case 'expired':
      return 'Overdue';
    default:
      return status ? 'Pending' : null;
  }
}

function classifyBookingPhase(start, end, now = new Date()) {
  if (!start) return 'upcoming';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  if (startDate <= now && (!endDate || endDate >= now)) return 'current';
  return startDate > now ? 'upcoming' : 'past';
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
  const startDateInput = query.startDateTime || query.startDate || query.date || null;
  const endDateInput = query.endDateTime || query.endDate || query.date || query.startDate || null;
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

async function runQuery(text, params, queryExecutor) {
  if (typeof queryExecutor === 'function') {
    return queryExecutor(text, params);
  }
  return pool.query(text, params);
}

async function getOccupancyMap(codes, options = {}, queryExecutor) {
  if (!Array.isArray(codes) || !codes.length) return new Map();
  const { rangeStart = null, rangeEnd = null, serviceType = null } = options;
  const params = [codes, BLOCKING_BOOKING_STATUSES, PAYMENT_SUCCESS_STATES];
  const whereClauses = [
    'b.seat_code = ANY($1::text[])',
    'b.end_time > NOW()',
    "(b.status::text = ANY($2::text[]) OR b.payment_status::text = ANY($3::text[]))"
  ];
  let paramIndex = params.length + 1;
  if (serviceType) {
    params.push(serviceType);
    whereClauses.push(`b.service_type = $${paramIndex}`);
    paramIndex += 1;
  }
  if (rangeStart && rangeEnd) {
    params.push(rangeStart, rangeEnd);
    whereClauses.push(`b.start_time <= $${paramIndex + 1} AND b.end_time >= $${paramIndex}`);
    paramIndex += 2;
  }
  const { rows } = await runQuery(
    `SELECT b.id, b.seat_code, b.seat_name, b.start_time, b.end_time, b.status,
            b.payment_status, b.booking_reference, b.service_type, sp.name AS package_name,
            u.id AS user_id, u.full_name, u.email, u.phone
     FROM bookings b
     LEFT JOIN service_packages sp ON sp.id = b.package_id
     LEFT JOIN users u ON u.id = b.user_id
     WHERE ${whereClauses.join('\n       AND ')}
     ORDER BY b.start_time ASC`,
    params,
    queryExecutor
  );
  const now = new Date();
  const occupancy = new Map();
  for (const row of rows) {
    if (!row || !row.seat_code) continue;
    if (!row.end_time || new Date(row.end_time) <= now) continue;
    const phase = classifyBookingPhase(row.start_time, row.end_time, now);
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
      user: row.user_id
        ? {
            id: row.user_id,
            name: row.full_name,
            email: row.email,
            phone: row.phone
          }
        : null
    };
    const prev = occupancy.get(row.seat_code);
    if (!prev) {
      occupancy.set(row.seat_code, bookingInfo);
      continue;
    }
    if (prev.phase !== 'current' && phase === 'current') {
      occupancy.set(row.seat_code, bookingInfo);
      continue;
    }
    if (prev.phase === phase) {
      const prevStart = new Date(prev.startDate);
      const nextStart = new Date(row.start_time);
      if (nextStart < prevStart) {
        occupancy.set(row.seat_code, bookingInfo);
      }
    }
  }
  return occupancy;
}

module.exports = {
  BLOCKING_BOOKING_STATUSES,
  PAYMENT_SUCCESS_STATES,
  mapPaymentStatusToUI,
  classifyBookingPhase,
  parseDateTimeInput,
  extractDateRangeFromQuery,
  getOccupancyMap
};
