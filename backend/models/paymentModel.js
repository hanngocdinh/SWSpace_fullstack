const db = require('../config/database');

const STATUS_WITH_PROCESSING = ['created', 'processing'];

function parseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

class Payment {
  constructor(data) {
    const meta = parseJson(data.provider_meta);
    this.id = data.id;
    this.bookingId = data.booking_id;
    this.bookingReference = data.booking_reference;
    this.serviceType = data.service_type;
    this.seatName = data.seat_name;
    this.floor = data.floor_no;
    this.startTime = data.start_time;
    this.endTime = data.end_time;
    this.methodId = data.method_id;
    this.amount = Number(data.amount) || 0;
    this.currency = data.currency || 'VND';
    this.status = data.status;
    this.transactionId = data.provider_txn_id;
    this.paymentMethod = data.payment_method || meta?.paymentMethod || null;
    this.description = data.description || meta?.description || null;
    this.qrUrl = data.qr_url;
    this.qrPayload = data.qr_payload;
    this.providerMeta = meta;
    this.userId = data.user_id || data.booking_user_id || meta?.userId || null;
    this.userEmail = data.user_email || meta?.userEmail || null;
    this.userFullName = data.user_full_name || meta?.userFullName || null;
    this.username = data.username || meta?.username || null;
    this.bookingStatus = data.booking_status || null;
    this.bookingPaymentStatus = data.booking_payment_status || null;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async resolveMethodId(explicitMethodId, paymentMethod) {
    if (explicitMethodId) return explicitMethodId;
    if (!paymentMethod) return 1;
    const code = paymentMethod.toLowerCase();
    const { rows } = await db.query('SELECT id FROM payment_methods WHERE LOWER(code) = LOWER($1) LIMIT 1', [code]);
    return rows[0]?.id || 1;
  }

  static async create(paymentData) {
    const {
      bookingId,
      amount,
      currency = 'VND',
      paymentMethod = 'offline',
      description = 'Pending payment',
      userId,
      userEmail,
      userFullName,
      username,
      status = 'created',
      methodId,
      transactionId,
      providerMeta = {},
    } = paymentData;

    if (!bookingId || !amount) {
      throw new Error('Missing required fields: bookingId, amount');
    }

    const resolvedMethodId = await this.resolveMethodId(methodId, paymentMethod);
    const generatedTxnId = transactionId || `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const metaPayload = {
      userId,
      userEmail,
      userFullName,
      username,
      paymentMethod,
      description,
      ...providerMeta,
    };

    const query = `
      INSERT INTO payments (
        booking_id, method_id, amount, currency,
        provider_txn_id, status, qr_url, qr_payload, provider_meta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      bookingId,
      resolvedMethodId,
      amount,
      currency,
      generatedTxnId,
      status,
      paymentData.qrUrl || null,
      paymentData.qrPayload || null,
      JSON.stringify(metaPayload),
    ];

    const result = await db.query(query, values);
    return new Payment(result.rows[0]);
  }

  static async findById(id) {
    const query = `
            SELECT p.*, b.booking_reference, b.service_type, b.seat_name, b.floor_no,
              b.start_time, b.end_time,
             b.status AS booking_status, b.payment_status AS booking_payment_status,
             b.user_id AS booking_user_id, u.full_name AS user_full_name,
             u.email AS user_email, u.username
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE p.id = $1
      LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows.length ? new Payment(result.rows[0]) : null;
  }

  static async findLatestByBooking(bookingId) {
    const query = `
            SELECT p.*, b.booking_reference, b.service_type, b.seat_name, b.floor_no,
              b.start_time, b.end_time,
             b.status AS booking_status, b.payment_status AS booking_payment_status,
             b.user_id AS booking_user_id, u.full_name AS user_full_name,
             u.email AS user_email, u.username
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE p.booking_id = $1
      ORDER BY p.created_at DESC
      LIMIT 1
    `;
    const result = await db.query(query, [bookingId]);
    return result.rows.length ? new Payment(result.rows[0]) : null;
  }

  static async findAll(options = {}) {
    const { limit = 100, offset = 0, status, search, bookingStatus } = options;

    const clauses = [];
    const values = [];

    if (status && status !== 'all') {
      clauses.push(`p.status = $${values.length + 1}`);
      values.push(status);
    }

    if (bookingStatus && bookingStatus !== 'all') {
      if (bookingStatus === 'cancelled' || bookingStatus === 'canceled') {
        clauses.push(`b.status IN ('canceled', 'refunded', 'failed')`);
      } else if (bookingStatus === 'paid_or_awaiting') {
        clauses.push(`b.status IN ('paid', 'awaiting_payment', 'checked_in', 'checked_out')`);
      } else {
        clauses.push(`b.status = $${values.length + 1}`);
        values.push(bookingStatus);
      }
    }

    if (search) {
      clauses.push(`(p.provider_txn_id ILIKE $${values.length + 1} OR b.booking_reference ILIKE $${values.length + 1} OR u.email ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const query = `
      SELECT p.*, b.booking_reference, b.service_type, b.seat_name, b.floor_no,
        b.start_time, b.end_time,
            b.status AS booking_status, b.payment_status AS booking_payment_status,
            b.user_id AS booking_user_id, u.full_name AS user_full_name,
            u.email AS user_email, u.username
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const result = await db.query(query, values);
    return result.rows.map((row) => new Payment(row));
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE payments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows.length ? new Payment(result.rows[0]) : null;
  }

  static async getStats() {
    const paymentsQuery = `
      SELECT
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'created' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) as total_revenue
      FROM payments
    `;

    const bookingsQuery = `
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'awaiting_payment' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_bookings,
        COUNT(CASE WHEN status IN ('canceled', 'failed', 'refunded') THEN 1 END) as cancelled_bookings
      FROM bookings
    `;

    const [paymentResult, bookingResult] = await Promise.all([
      db.query(paymentsQuery),
      db.query(bookingsQuery)
    ]);

    const stats = paymentResult.rows[0];
    const bookingStats = bookingResult.rows[0] || {};

    const totals = {
      totalPayments: Number(stats.total_payments) || 0,
      completedPayments: Number(stats.completed_payments) || 0,
      pendingPayments: Number(stats.pending_payments) || 0,
      failedPayments: Number(stats.failed_payments) || 0,
      totalRevenue: Number(stats.total_revenue) || 0,
    };

    const bookingTotals = {
      totalBookings: Number(bookingStats.total_bookings) || 0,
      pendingBookings: Number(bookingStats.pending_bookings) || 0,
      confirmedBookings: Number(bookingStats.confirmed_bookings) || 0,
      paidBookings: Number(bookingStats.paid_bookings) || 0,
      cancelledBookings: Number(bookingStats.cancelled_bookings) || 0,
    };

    const successRate = totals.totalPayments > 0
      ? ((totals.completedPayments / totals.totalPayments) * 100).toFixed(1)
      : '0.0';

    return {
      ...totals,
      ...bookingTotals,
      successRate,
      total_payments: totals.totalPayments,
      completed_payments: totals.completedPayments,
      pending_payments: totals.pendingPayments,
      failed_payments: totals.failedPayments,
      total_revenue: totals.totalRevenue,
    };
  }

  isActionable() {
    return STATUS_WITH_PROCESSING.includes(this.status);
  }
}

module.exports = Payment;
