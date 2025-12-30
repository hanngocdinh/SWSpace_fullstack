const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

function toCamelUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    phone: row.phone,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
    totalBookings: Number(row.total_bookings || 0),
    totalPayments: Number(row.total_payments || 0),
  };
}

async function generateUniqueUsername(seed, email) {
  const baseSource = seed || (email ? email.split('@')[0] : '') || 'member';
  const normalized = baseSource.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member';
  let attempt = normalized.slice(0, 30);
  let suffix = 1;

  while (true) {
    const { rows } = await pool.query('SELECT 1 FROM users WHERE username = $1 LIMIT 1', [attempt]);
    if (rows.length === 0) return attempt;
    const nextSuffix = `${suffix++}`;
    const base = normalized.slice(0, 30 - nextSuffix.length) || 'member';
    attempt = `${base}${nextSuffix}`;
  }
}

async function ensureEmailAvailable(email, ignoreId = null) {
  const params = [email.toLowerCase()];
  let clause = 'email = $1';
  if (ignoreId) {
    params.push(ignoreId);
    clause += ' AND id <> $2';
  }
  const { rowCount } = await pool.query(`SELECT 1 FROM users WHERE ${clause} LIMIT 1`, params);
  if (rowCount) {
    const error = new Error('Email already exists');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }
}

async function listUsers({ role, status, search, page = 1, pageSize = 10 }) {
  const normalizedRole = !role || role === 'all' ? null : role;
  const normalizedStatus = !status || status === 'all' ? null : status;
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 10, 1), 50);

  const summaryParams = [];
  let summaryWhere = '';
  if (normalizedRole) {
    summaryParams.push(normalizedRole);
    summaryWhere = 'WHERE role = $1';
  }
  const summarySql = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active,
      COUNT(*) FILTER (WHERE status = 'inactive')::int AS inactive
    FROM users
    ${summaryWhere}
  `;
  const summary = (await pool.query(summarySql, summaryParams)).rows[0] || { total: 0, active: 0, inactive: 0 };

  const filters = [];
  const filterParams = [];
  let idx = 1;
  if (normalizedRole) {
    filters.push(`u.role = $${idx++}`);
    filterParams.push(normalizedRole);
  }
  if (normalizedStatus) {
    filters.push(`u.status = $${idx++}`);
    filterParams.push(normalizedStatus);
  }
  if (search) {
    filters.push(`(
      LOWER(u.full_name) LIKE $${idx}
      OR LOWER(u.email) LIKE $${idx}
      OR LOWER(u.username) LIKE $${idx}
      OR CAST(u.id AS TEXT) LIKE $${idx}
    )`);
    filterParams.push(`%${search.toLowerCase()}%`);
    idx += 1;
  }
  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS count FROM users u ${whereClause}`;
  const filteredCount = (await pool.query(countSql, filterParams)).rows[0]?.count || 0;

  const listSql = `
    SELECT
      u.id,
      u.email,
      u.username,
      u.phone,
      u.full_name,
      u.role,
      u.status,
      u.avatar_url,
      u.created_at,
      u.updated_at,
      u.last_login,
      COALESCE(bs.total_bookings, 0)::int AS total_bookings,
      COALESCE(ps.total_payments, 0)::numeric AS total_payments
    FROM users u
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS total_bookings
      FROM bookings b
      WHERE b.user_id = u.id
    ) bs ON TRUE
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(p.amount), 0)::numeric AS total_payments
      FROM payments p
      JOIN bookings pb ON pb.id = p.booking_id
      WHERE pb.user_id = u.id AND p.status = 'success'
    ) ps ON TRUE
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const listParams = [...filterParams, safePageSize, (safePage - 1) * safePageSize];
  const rows = (await pool.query(listSql, listParams)).rows.map(toCamelUser);

  return {
    items: rows,
    summary: {
      total: Number(summary.total || 0),
      active: Number(summary.active || 0),
      inactive: Number(summary.inactive || 0)
    },
    meta: {
      page: safePage,
      pageSize: safePageSize,
      filteredTotal: filteredCount,
      totalPages: Math.max(Math.ceil(filteredCount / safePageSize), 1)
    }
  };
}

async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.username, u.phone, u.full_name, u.role, u.status, u.avatar_url,
            u.created_at, u.updated_at, u.last_login,
            COALESCE(bs.total_bookings, 0)::int AS total_bookings,
            COALESCE(ps.total_payments, 0)::numeric AS total_payments
     FROM users u
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS total_bookings
       FROM bookings b
       WHERE b.user_id = u.id
     ) bs ON TRUE
     LEFT JOIN LATERAL (
       SELECT COALESCE(SUM(p.amount), 0)::numeric AS total_payments
       FROM payments p
       JOIN bookings pb ON pb.id = p.booking_id
       WHERE pb.user_id = u.id AND p.status = 'success'
     ) ps ON TRUE
     WHERE u.id = $1
     LIMIT 1`,
    [id]
  );
  return toCamelUser(rows[0]);
}

async function createUser({ fullName, email, phone, password, role }) {
  if (!email || !password || !role) {
    const error = new Error('Missing required fields');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  if (!['admin', 'user'].includes(role)) {
    const error = new Error('Invalid role');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  await ensureEmailAvailable(email);
  const username = await generateUniqueUsername(fullName, email);
  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, username, password_hash, full_name, phone, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING id, email, username, phone, full_name, role, status, avatar_url, created_at, updated_at, last_login,
               0::int AS total_bookings, 0::numeric AS total_payments`,
    [email.toLowerCase(), username, passwordHash, fullName || null, phone || null, role]
  );
  return toCamelUser(rows[0]);
}

async function updateUser(id, updates) {
  if (!updates || Object.keys(updates).length === 0) {
    return getUserById(id);
  }
  const fields = [];
  const values = [];
  let idx = 1;
  if (updates.fullName !== undefined) {
    fields.push(`full_name = $${idx++}`);
    values.push(updates.fullName);
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(updates.phone);
  }
  if (updates.email !== undefined) {
    await ensureEmailAvailable(updates.email, id);
    fields.push(`email = $${idx++}`);
    values.push(updates.email.toLowerCase());
  }
  if (updates.role && ['admin', 'user'].includes(updates.role)) {
    fields.push(`role = $${idx++}`);
    values.push(updates.role);
  }
  if (updates.password) {
    const hash = await bcrypt.hash(updates.password, 10);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
  }
  if (!fields.length) return getUserById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, values);
  return getUserById(id);
}

async function updateStatus(id, status) {
  if (!['active', 'inactive'].includes(status)) {
    const error = new Error('Invalid status');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  await pool.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  return getUserById(id);
}

async function deleteUser(id) {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) {
      const error = new Error('User not found');
      error.code = 'NOT_FOUND';
      throw error;
    }
    return true;
  } catch (err) {
    if (err.code === '23503') {
      const friendly = new Error('User has related records and cannot be deleted. Deactivate instead.');
      friendly.code = 'RELATION_CONSTRAINT';
      throw friendly;
    }
    throw err;
  }
}

async function getRecentBookings(userId, options = {}) {
  const safePage = Math.max(Number(options.page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(options.pageSize) || 5, 1), 20);
  const offset = (safePage - 1) * safePageSize;

  const dataQuery = await pool.query(
    `SELECT
        b.id,
        b.booking_reference,
        b.seat_name,
        b.seat_code,
        b.service_type,
        b.floor_no,
        b.start_time,
        b.end_time,
        b.status,
        b.final_price,
        b.package_duration
     FROM bookings b
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, safePageSize, offset]
  );

  const totalQuery = await pool.query('SELECT COUNT(*)::int AS total FROM bookings WHERE user_id = $1', [userId]);
  const total = Number(totalQuery.rows[0]?.total || 0);

  const items = dataQuery.rows.map((row) => ({
    id: row.id,
    bookingCode: row.booking_reference || `SWS-${String(row.id).padStart(6, '0')}`,
    seatName: row.seat_name,
    seatCode: row.seat_code,
    serviceType: row.service_type,
    floor: row.floor_no,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    totalAmount: Number(row.final_price || 0),
    duration: row.package_duration || null
  }));

  return {
    items,
    meta: {
      page: safePage,
      pageSize: safePageSize,
      filteredTotal: total,
      totalPages: Math.max(Math.ceil(total / safePageSize), 1)
    }
  };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateStatus,
  deleteUser,
  getRecentBookings
};
