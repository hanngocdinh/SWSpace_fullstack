const { getPgPool } = require('../config/pg');
const pool = getPgPool();

let ensurePromise = null;

async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS booking_activity_log (
          id BIGSERIAL PRIMARY KEY,
          booking_id BIGINT,
          booking_reference TEXT,
          user_id BIGINT,
          user_name TEXT,
          user_email TEXT,
          service_type TEXT,
          package_name TEXT,
          quantity INT,
          total_amount NUMERIC,
          action TEXT NOT NULL,
          metadata JSONB,
          occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_booking_activity_action_time
          ON booking_activity_log (action, occurred_at DESC)
      `);
    })().catch((err) => {
      console.error('activityLogRepository.ensureTable', err);
      throw err;
    });
  }
  return ensurePromise;
}

function coerceMetadata(metadata) {
  if (!metadata) return null;
  try {
    return typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
  } catch (err) {
    console.warn('activityLogRepository.metadata.serialize', err);
    return null;
  }
}

async function recordBookingEvent(event) {
  await ensureTable();
  const sql = `
    INSERT INTO booking_activity_log (
      booking_id,
      booking_reference,
      user_id,
      user_name,
      user_email,
      service_type,
      package_name,
      quantity,
      total_amount,
      action,
      metadata
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    )
  `;
  const params = [
    event.bookingId || null,
    event.bookingReference || null,
    event.userId || null,
    event.userName || null,
    event.userEmail || null,
    event.serviceType || null,
    event.packageName || null,
    typeof event.quantity === 'number' ? event.quantity : null,
    event.totalAmount || null,
    event.action || 'deleted',
    coerceMetadata(event.metadata)
  ];
  await pool.query(sql, params);
}

async function fetchRecentEvents({ actions = ['deleted'], limit = 10 } = {}) {
  await ensureTable();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
  const actionList = Array.isArray(actions) && actions.length ? actions : ['deleted'];
  const { rows } = await pool.query(
    `SELECT id, booking_id, booking_reference, user_id, user_name, user_email,
            service_type, package_name, quantity, total_amount, action, metadata, occurred_at
       FROM booking_activity_log
       WHERE action = ANY($2::text[])
       ORDER BY occurred_at DESC
       LIMIT $1`,
    [safeLimit, actionList]
  );
  return rows;
}

module.exports = {
  ensureTable,
  recordBookingEvent,
  fetchRecentEvents
};
