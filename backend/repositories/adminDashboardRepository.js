const { getPgPool } = require('../config/pg');
const pool = getPgPool();
const activityLogRepo = require('./activityLogRepository');
const floorActivityFeed = require('../services/floorActivityFeed');

const DASHBOARD_TIMEZONE_OFFSET_MINUTES = Number(process.env.DASHBOARD_TIMEZONE_OFFSET_MINUTES ?? 420);
const OFFSET_MS = DASHBOARD_TIMEZONE_OFFSET_MINUTES * 60 * 1000;

function toLocalISOString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + OFFSET_MS).toISOString();
}

function toUtcISOString(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const SERVICE_USAGE = [
  { code: 'hot_desk', dbCode: 'hot-desk', label: 'Hot Desk' },
  { code: 'fixed_desk', dbCode: 'fixed-desk', label: 'Fixed Desk' },
  { code: 'meeting_room', dbCode: 'meeting_room', label: 'Meeting Room' },
  { code: 'networking', dbCode: 'networking', label: 'Networking Space' },
  { code: 'private_office', dbCode: 'private_office', label: 'Private Office' }
];

const SERVICE_LOOKUP = SERVICE_USAGE.reduce((acc, item) => {
  acc[item.code] = item;
  acc[item.dbCode] = item;
  return acc;
}, {});

function normalizeServiceCode(raw) {
  if (!raw) return null;
  return SERVICE_LOOKUP[raw]?.code || raw;
}

function normalizeNumber(value) {
  return Number(value || 0);
}

function inferSeverity(text) {
  const value = (text || '').toLowerCase();
  if (!value) return 'info';
  if (value.includes('offline') || value.includes('alert') || value.includes('error')) return 'alert';
  if (value.includes('empty') || value.includes('available') || value.includes('ready')) return 'success';
  return 'info';
}

function toServiceLabel(code) {
  const normalized = normalizeServiceCode(code);
  const found = SERVICE_USAGE.find(item => item.code === normalized);
  return found ? found.label : 'Other';
}

const FREELANCE_CODES = new Set(['hot_desk', 'fixed_desk']);
const MAX_NOTIFICATIONS = 15;
const MAX_NOTIFICATION_BUFFER = MAX_NOTIFICATIONS * 4;
const MAX_FLOOR_DUPLICATES = 1;

const FLOOR_LABELS = {
  floor1: 'Floor 1',
  floor2: 'Floor 2',
  floor3: 'Floor 3'
};

const FLOOR_PAGE_MAP = {
  floor1: 'floor-1',
  floor2: 'floor-2',
  floor3: 'floor-3'
};

function titleCase(value) {
  if (!value) return '';
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeDurationLabel(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  const segment = trimmed.split(/[-–·]/).pop()?.trim() || trimmed;
  const normalized = segment.toLowerCase();
  const hourMatch = normalized.match(/(\d+)\s*(hour|hours|hr|hrs|h)/);
  if (hourMatch) {
    const amount = hourMatch[1];
    const plural = amount === '1' ? '' : 's';
    return `${amount} Hour${plural}`;
  }
  if (normalized.includes('daily') || normalized === 'day') return 'Day';
  if (normalized.includes('weekly') || normalized === 'week') return 'Week';
  if (normalized.includes('monthly') || normalized === 'month') return 'Month';
  if (normalized.includes('year')) return 'Year';
  if (normalized.includes('hour')) return 'Hours';
  return titleCase(segment.replace(/_/g, ' '));
}

function buildPackageLabel({ serviceType, packageName, packageDuration, metadata, seatName, seatCode, action }) {
  const normalizedService = normalizeServiceCode(serviceType);
  const serviceLabel = toServiceLabel(serviceType);
  if ((action === 'payment' || action === 'payment_success') && (seatName || seatCode)) {
    return `${serviceLabel} - ${seatName || seatCode}`;
  }
  const durationSource = metadata?.packageDuration || packageDuration || packageName;
  if (normalizedService && FREELANCE_CODES.has(normalizedService)) {
    const durationLabel = normalizeDurationLabel(durationSource);
    return durationLabel ? `${serviceLabel} - ${durationLabel}` : serviceLabel;
  }
  if (packageName && packageName.trim()) return packageName;
  if (metadata?.packageName) return metadata.packageName;
  if (metadata?.seatName) return metadata.seatName;
  return serviceLabel;
}

async function fetchSummaryStats() {
  const sql = `
    WITH packages AS (
      SELECT COUNT(*)::int AS total_packages
      FROM service_packages sp
      JOIN services s ON s.id = sp.service_id
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE sc.code IN ('freelance', 'team')
        AND COALESCE(sp.is_custom, false) = false
    ),
    reserved AS (
      SELECT COALESCE(SUM(quantity), 0)::int AS reserved_seats
      FROM bookings
      WHERE status = 'paid'
        AND cancelled_at IS NULL
        AND end_time >= NOW()
    ),
    users AS (
      SELECT COUNT(*)::int AS total_users
      FROM users
      WHERE role = 'user'
    ),
    monthly AS (
      SELECT COALESCE(SUM(price_total), 0)::numeric AS revenue
      FROM bookings
      WHERE status = 'paid'
        AND date_trunc('month', start_time) = date_trunc('month', NOW())
    )
    SELECT packages.total_packages, reserved.reserved_seats, users.total_users, monthly.revenue
    FROM packages, reserved, users, monthly;
  `;
  const { rows } = await pool.query(sql);
  const [row] = rows;
  return {
    totalServicePackages: row ? Number(row.total_packages || 0) : 0,
    reservedSeats: row ? Number(row.reserved_seats || 0) : 0,
    totalUsers: row ? Number(row.total_users || 0) : 0,
    monthlyRevenue: row ? normalizeNumber(row.revenue) : 0
  };
}

async function fetchRevenueByMonth(monthSpan = 12) {
  const months = Math.max(1, Math.min(Number(monthSpan) || 12, 12));
  const sql = `
    WITH month_series AS (
      SELECT date_trunc('month', NOW()) - ($1::int - s.idx - 1) * INTERVAL '1 month' AS month_start
      FROM generate_series(0, $1::int - 1) AS s(idx)
    ),
    revenue AS (
      SELECT date_trunc('month', start_time) AS month_start,
             COALESCE(SUM(price_total), 0)::numeric AS total
      FROM bookings
      WHERE status = 'paid'
      GROUP BY 1
    )
    SELECT ms.month_start,
           EXTRACT(MONTH FROM ms.month_start)::int AS month_number,
           EXTRACT(YEAR FROM ms.month_start)::int AS year_number,
           COALESCE(r.total, 0)::numeric AS total
    FROM month_series ms
    LEFT JOIN revenue r ON r.month_start = ms.month_start
    ORDER BY ms.month_start;
  `;
  const { rows } = await pool.query(sql, [months]);
  return rows.map(row => ({
    month: row.month_number,
    year: row.year_number,
    label: String(row.month_number),
    total: normalizeNumber(row.total),
    monthStart: row.month_start ? row.month_start.toISOString() : null
  }));
}

async function fetchServiceUsage() {
  const sql = `
    SELECT service_type, COUNT(*)::int AS total
    FROM bookings
    WHERE status = 'paid'
      AND service_type = ANY($1::text[])
    GROUP BY service_type;
  `;
  const dbCodes = SERVICE_USAGE.map(item => item.dbCode);
  const { rows } = await pool.query(sql, [dbCodes]);
  const totals = rows.reduce((acc, row) => {
    const normalized = normalizeServiceCode(row.service_type);
    acc[normalized] = normalizeNumber(row.total);
    return acc;
  }, {});
  const overall = Object.values(totals).reduce((sum, value) => sum + value, 0);
  return SERVICE_USAGE.map(item => {
    const count = totals[item.code] || 0;
    const percentage = overall > 0 ? Number(((count / overall) * 100).toFixed(1)) : 0;
    return {
      code: item.code,
      label: item.label,
      bookings: count,
      percentage
    };
  });
}

async function fetchRecentActivity(limit = 8) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 8, 25));
  const bookingLimit = Math.min(safeLimit * 3, 60);
  const logLimit = Math.min(safeLimit * 2, 40);

  const bookingSql = `
    SELECT
      b.id,
      b.status,
      b.created_at,
      b.updated_at,
      b.cancelled_at,
      b.service_type,
      b.package_id,
      b.package_duration,
      b.booking_reference,
      b.price_total,
      b.quantity,
      b.seat_name,
      u.full_name,
      u.email,
      sp.name AS package_name
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    LEFT JOIN service_packages sp ON sp.id = COALESCE(
      b.package_id,
      CASE WHEN b.package_duration ~ '^[0-9]+$' THEN b.package_duration::bigint ELSE NULL END
    )
    WHERE b.status::text = ANY($2::text[])
    ORDER BY b.created_at DESC
    LIMIT $1;
  `;

  const bookingStatuses = ['pending', 'awaiting_payment', 'paid', 'canceled', 'cancelled'];

  const [bookingRows, activityLogs] = await Promise.all([
    pool.query(bookingSql, [bookingLimit, bookingStatuses]).then(res => res.rows),
    activityLogRepo.fetchRecentEvents({ actions: ['deleted'], limit: logLimit })
  ]);

  const bookingEvents = bookingRows.map(row => {
    const isCancellation = row.status === 'canceled' || row.status === 'cancelled';
    const isPayment = !isCancellation && row.status === 'paid';
    const occurredAt = isCancellation
      ? row.cancelled_at || row.updated_at || row.created_at
      : (isPayment ? (row.updated_at || row.created_at) : row.created_at);

    let actionLabel = 'Pending Booking';
    if (isCancellation) actionLabel = 'Booking Cancelled';
    else if (isPayment) actionLabel = 'Payment Successful';

    return {
      id: row.id,
      bookingReference: row.booking_reference,
      status: row.status,
      serviceType: row.service_type,
      serviceLabel: toServiceLabel(row.service_type),
      packageName: buildPackageLabel({
        serviceType: row.service_type,
        packageName: row.package_name,
        packageDuration: row.package_duration,
        seatName: row.seat_name,
        seatCode: row.seat_code,
        action: isPayment ? 'payment' : undefined
      }),
      userName: row.full_name || row.email,
      userEmail: row.email,
      quantity: Number(row.quantity || 0),
      totalAmount: normalizeNumber(row.price_total),
      action: isCancellation ? 'canceled' : (isPayment ? 'payment' : 'booking'),
      actionLabel,
      occurredAt: toLocalISOString(occurredAt)
    };
  });

  const logEvents = activityLogs.map(log => {
    const metadata = (() => {
      if (!log.metadata) return {};
      if (typeof log.metadata === 'object') return log.metadata;
      try {
        return JSON.parse(log.metadata);
      } catch (err) {
        console.warn('adminDashboardRepository.logMetadata.parse', err);
        return {};
      }
    })();
    const action = (log.action || 'deleted').toLowerCase();
    const isPending = action === 'pending';
    const packageLabel = buildPackageLabel({
      serviceType: log.service_type,
      packageName: log.package_name,
      packageDuration: metadata.packageDuration,
      metadata,
      seatName: metadata.seatName,
      seatCode: metadata.seatCode,
      action: action
    });
    return {
      id: `${action}-${log.id}`,
      bookingReference: log.booking_reference,
      status: isPending ? 'pending' : 'deleted',
      serviceType: log.service_type,
      serviceLabel: toServiceLabel(log.service_type),
      packageName: packageLabel,
      userName: log.user_name || log.user_email,
      userEmail: log.user_email,
      quantity: Number(log.quantity || 0),
      totalAmount: normalizeNumber(log.total_amount),
      action: isPending ? 'booking' : 'deleted',
      actionLabel: isPending ? 'Pending Booking' : 'Booking Deleted',
      occurredAt: toLocalISOString(log.occurred_at)
    };
  });

  const toEpoch = (entry) => (entry?.occurredAt ? new Date(entry.occurredAt).getTime() : 0);
  const statusRank = (event) => {
    const normalized = (event.status || '').toLowerCase();
    if (normalized === 'pending' || normalized === 'awaiting_payment') return 0;
    if (event.action === 'payment') return 1;
    if (normalized === 'canceled' || normalized === 'cancelled') return 2;
    return 3;
  };

  const sortedBookings = [...bookingEvents].sort((a, b) => {
    const rankDiff = statusRank(a) - statusRank(b);
    if (rankDiff !== 0) return rankDiff;
    return toEpoch(b) - toEpoch(a);
  });

  const results = sortedBookings.slice(0, safeLimit);

  if (results.length < safeLimit && logEvents.length) {
    const sortedDeletions = [...logEvents].sort((a, b) => toEpoch(b) - toEpoch(a));
    const remaining = safeLimit - results.length;
    results.push(...sortedDeletions.slice(0, remaining));
  }

  return results.slice(0, safeLimit);
}

function mapBookingRowToNotification(row) {
  const packageLabel = buildPackageLabel({
    serviceType: row.service_type,
    packageName: row.package_name,
    packageDuration: row.package_duration,
    seatName: row.seat_name,
    seatCode: row.seat_code
  });
  const serviceLabel = toServiceLabel(row.service_type);
  const userName = row.full_name || row.email;
  const segments = [`${serviceLabel} · ${packageLabel}`];
  if (row.seat_name) segments.push(`Seat ${row.seat_name}`);
  if (userName) segments.push(`by ${userName}`);
  const message = `New pending booking: ${segments.join(' · ')}.`;
  const eventAt = row.created_at || row.updated_at;
  return {
    id: `booking-${row.id}`,
    title: 'Pending Booking',
    message,
    category: 'booking',
    severity: 'info',
    createdAt: toLocalISOString(eventAt),
    targetPage: 'payments',
    metadata: {
      bookingReference: row.booking_reference,
      serviceType: row.service_type,
      userEmail: row.email
    }
  };
}

function mapFloorEventToNotification(event) {
  if (!event) return null;
  const floorKey = event.floor && FLOOR_LABELS[event.floor] ? event.floor : 'floor1';
  const label = FLOOR_LABELS[floorKey] || 'Floor';
  const prefix = label.replace(/\s+/g, '');
  const message = `${prefix}: ${event.message}`;
  return {
    id: `floor-${event.id}`,
    title: `${label} Activity`,
    message,
    category: 'floor',
    severity: 'alert',
    createdAt: toLocalISOString(event.occurredAt),
    targetPage: FLOOR_PAGE_MAP[floorKey] || 'floor-1',
    metadata: {
      floor: floorKey,
      source: event.source || null
    }
  };
}

function toEpochMs(value) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortNotificationsDesc(items = []) {
  return [...items].sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
}

function dedupeFloorNotifications(items = []) {
  if (!items.length) return [];
  const seen = new Map();
  const results = [];
  for (const item of sortNotificationsDesc(items)) {
    const floorKey = item?.metadata?.floor || 'floor1';
    const signature = `${floorKey}:${item.message || ''}`;
    const count = seen.get(signature) || 0;
    if (count >= MAX_FLOOR_DUPLICATES) continue;
    seen.set(signature, count + 1);
    results.push(item);
  }
  return results;
}

function blendNotificationStreams({ floorNotifications, bookingNotifications, limit }) {
  const safeLimit = Math.max(1, limit || 1);
  const results = [];
  const seen = new Set();

  const floorTargetBase = Math.max(1, Math.floor(safeLimit / 3));
  const floorTarget = Math.min(floorNotifications.length, floorTargetBase);
  const bookingTarget = Math.min(bookingNotifications.length, safeLimit - floorTarget);

  const prioritizedFloors = sortNotificationsDesc(floorNotifications).slice(0, floorTarget);
  const prioritizedBookings = sortNotificationsDesc(bookingNotifications).slice(0, bookingTarget);

  const push = (entry) => {
    if (!entry || seen.has(entry.id) || results.length >= safeLimit) return;
    seen.add(entry.id);
    results.push(entry);
  };

  prioritizedFloors.forEach(push);
  prioritizedBookings.forEach(push);

  if (results.length < safeLimit) {
    const leftovers = sortNotificationsDesc([
      ...floorNotifications,
      ...bookingNotifications
    ]).filter(item => !seen.has(item.id));
    for (const item of leftovers) {
      if (results.length >= safeLimit) break;
      push(item);
    }
  }

  return sortNotificationsDesc(results).slice(0, safeLimit);
}

async function fetchPendingBookingNotifications(limit = MAX_NOTIFICATIONS) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || MAX_NOTIFICATIONS, MAX_NOTIFICATION_BUFFER));
  const sql = `
    SELECT
      b.id,
      b.booking_reference,
      b.service_type,
      b.package_duration,
      b.seat_name,
      b.seat_code,
      b.created_at,
      b.updated_at,
      u.full_name,
      u.email,
      sp.name AS package_name
    FROM bookings b
    JOIN users u ON u.id = b.user_id
    LEFT JOIN service_packages sp ON sp.id = COALESCE(
      b.package_id,
      CASE WHEN b.package_duration ~ '^[0-9]+$' THEN b.package_duration::bigint ELSE NULL END
    )
    WHERE b.status::text = ANY($2::text[])
    ORDER BY b.created_at DESC
    LIMIT $1;
  `;
  const statuses = ['pending', 'awaiting_payment'];
  const { rows } = await pool.query(sql, [safeLimit, statuses]);
  return rows.map(mapBookingRowToNotification);
}

async function fetchNotifications(options = {}) {
  const safeLimit = Math.max(1, Math.min(Number(options.limit) || MAX_NOTIFICATIONS, MAX_NOTIFICATIONS));
  const floorFetchLimit = safeLimit * 4;
  const bookingFetchLimit = safeLimit * 4;

  const [floorEvents, bookingNotifications] = await Promise.all([
    Promise.resolve(floorActivityFeed.getFloorEvents({ limit: floorFetchLimit }) || []),
    fetchPendingBookingNotifications(bookingFetchLimit)
  ]);

  const floorNotifications = dedupeFloorNotifications(
    floorEvents
      .map(mapFloorEventToNotification)
      .filter(Boolean)
  );

  return blendNotificationStreams({
    floorNotifications,
    bookingNotifications,
    limit: safeLimit
  });
}

async function getDashboardOverview(options = {}) {
  const [stats, revenueByMonth, serviceUsage, recentActivity] = await Promise.all([
    fetchSummaryStats(),
    fetchRevenueByMonth(options.months),
    fetchServiceUsage(),
    fetchRecentActivity(options.recentLimit)
  ]);
  return {
    stats,
    revenueByMonth,
    serviceUsage,
    recentActivity
  };
}

module.exports = {
  getDashboardOverview,
  fetchNotifications
};
