// Migrated QR & Check-in service to PostgreSQL.
// Replaces Mongo models QRCodeModel, CheckIn, Booking with direct SQL queries.
// bookingRepository already handles bookings; here we only read minimal fields.
const { getPgPool } = require('../../config/pg');
const { getBookingRepository } = require('../repositories/bookingRepository');
const qrImageService = require('./qrImageService');
const emailService = require('./emailService');
const crypto = require('crypto');

const pool = getPgPool();

class QRService {
  async generateQRCode(bookingId, userId) {
    // Fetch booking from PG
    const { rows: bRows } = await pool.query(
      `SELECT id, user_id, booking_reference, seat_name, service_type, start_time, end_time, status
       FROM bookings WHERE id=$1 AND user_id=$2 LIMIT 1`, [bookingId, userId]
    );
    const booking = bRows[0];
    if (!booking) throw new Error('Booking not found or access denied');

    // Try find an active valid QR
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM qrcodes
       WHERE booking_id=$1 AND is_active=TRUE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`, [bookingId]
    );
    const existingQR = existingRows[0];
    if (existingQR) {
      return this.formatQRResponse(existingQR, booking);
    }

    // Invalidate any previous active (mark inactive)
    await pool.query(`UPDATE qrcodes SET is_active=FALSE WHERE booking_id=$1 AND is_active=TRUE`, [bookingId]);

    const bookingEndTime = new Date(booking.end_time);
    const expiresAt = new Date(bookingEndTime.getTime() + 60 * 60 * 1000);
    const qrData = {
      bookingId: String(bookingId),
      userId: String(userId),
      seatName: booking.seat_name,
      serviceType: booking.service_type,
      startDate: booking.start_time,
      endDate: booking.end_time,
      bookingReference: booking.booking_reference
    };
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const qrString = `SWS-${timestamp}-${randomBytes}`;
    const secretKey = crypto.randomBytes(32).toString('hex');

    const { rows: created } = await pool.query(
      `INSERT INTO qrcodes (booking_id, qr_string, secret_key, qr_data, expires_at, max_usage)
       VALUES ($1,$2,$3,$4,$5,20)
       RETURNING *`,
      [bookingId, qrString, secretKey, JSON.stringify(qrData), expiresAt]
    );
    return this.formatQRResponse(created[0], booking);
  }

  async verifyQRCode(qrString, userId = null) {
    const { rows: qrRows } = await pool.query(
      `SELECT * FROM qrcodes WHERE qr_string=$1 AND is_active=TRUE LIMIT 1`, [qrString]
    );
    const qrRecord = qrRows[0];
    if (!qrRecord) return { valid: false, message: 'Invalid or expired QR code' };
    if (new Date(qrRecord.expires_at) < new Date()) return { valid: false, message: 'QR code expired' };

    const qrData = typeof qrRecord.qr_data === 'string' ? JSON.parse(qrRecord.qr_data) : qrRecord.qr_data;
    const { rows: bRows } = await pool.query(
      `SELECT id, booking_reference, seat_name, service_type, start_time, end_time, status, user_id
       FROM bookings WHERE id=$1 LIMIT 1`, [qrRecord.booking_id]
    );
    const booking = bRows[0];
    if (!booking) return { valid: false, message: 'Booking missing' };
    if (userId && String(booking.user_id) !== String(userId)) {
      return { valid: false, message: 'This QR code belongs to another account' };
    }

    const now = new Date();
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    if (now > bookingEnd) return { valid: false, message: 'Booking has expired' };

    const { rows: activeRows } = await pool.query(
      `SELECT id, status, check_in_at FROM qr_checkins WHERE booking_id=$1 AND status='checked-in' LIMIT 1`,
      [booking.id]
    );
    const activeCheckIn = activeRows[0] || null;
    return { valid: true, qrRecord, booking, qrData, alreadyCheckedIn: !!activeCheckIn, activeCheckIn };
  }

  async processCheckIn(qrString, deviceInfo = {}, location = {}, userContext = {}) {
    const actorContext = {
      userId: null,
      role: null,
      bypassOwnership: false,
      ...userContext
    };
    const { userId, bypassOwnership } = actorContext;

    if (!userId) {
      return { success: false, message: 'Authentication required for check-in' };
    }

    const verification = await this.verifyQRCode(qrString, bypassOwnership ? null : userId);
    if (!verification.valid) return { success: false, message: verification.message };
    const { qrRecord, booking, alreadyCheckedIn, activeCheckIn } = verification;
    if (!bypassOwnership && String(booking.user_id) !== String(userId)) {
      return { success: false, message: 'This QR code belongs to another account' };
    }

    const bookingStart = booking?.start_time ? new Date(booking.start_time) : null;
    if (bookingStart && !Number.isNaN(bookingStart.getTime())) {
      const minutesUntilStart = (bookingStart.getTime() - Date.now()) / 60000;
      if (minutesUntilStart > 30) {
        return {
          success: false,
          message: 'Upload check-in failed: Check-in not yet available (30 mins before start)',
          booking
        };
      }
    }

    if (alreadyCheckedIn) {
      await pool.query(`UPDATE qrcodes SET usage_count = usage_count + 1 WHERE id=$1`, [qrRecord.id]);
      return { success: true, message: 'Check-in already recorded', checkIn: activeCheckIn, booking, repeatedScan: true };
    }

    await pool.query(`UPDATE qrcodes SET usage_count = usage_count + 1 WHERE id=$1`, [qrRecord.id]);

    const { rows: cRows } = await pool.query(
      `INSERT INTO qr_checkins (booking_id, user_id, qr_code_id, device_info, location, actual_seat)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [booking.id, booking.user_id, qrRecord.id, JSON.stringify(deviceInfo), JSON.stringify(location), booking.seat_name]
    );
    const checkIn = cRows[0];
    return { success: true, message: 'Check-in successful', checkIn, booking, repeatedScan: false };
  }

  async processCheckOut(bookingId, userId, notes = '', rating = null) {
    const { rows: activeRows } = await pool.query(
      `SELECT id FROM qr_checkins WHERE booking_id=$1 AND user_id=$2 AND status='checked-in' LIMIT 1`,
      [bookingId, userId]
    );
    const active = activeRows[0];
    if (!active) return { success: false, message: 'No active check-in found' };
    const { rows: updated } = await pool.query(
      `UPDATE qr_checkins SET status='checked-out', check_out_at=NOW(), notes=$3, rating=$4 WHERE id=$1 RETURNING *`,
      [active.id, null, notes || null, rating || null]
    );
    return { success: true, message: 'Check-out successful', checkIn: updated[0] };
  }

  async getCheckInStatus(bookingId, userId) {
    const { rows } = await pool.query(
      `SELECT * FROM qr_checkins WHERE booking_id=$1 AND user_id=$2 ORDER BY created_at DESC LIMIT 1`,
      [bookingId, userId]
    );
    const checkIn = rows[0];
    if (!checkIn) return { hasCheckIn: false, message: 'No check-in record found' };
    return { hasCheckIn: true, checkIn, isActive: checkIn.status === 'checked-in' };
  }

  async getAttendanceHistory(userId, limit = 10, skip = 0) {
    const { rows } = await pool.query(
      `SELECT qc.*, b.booking_reference, b.service_type, b.seat_name, b.start_time, b.end_time
       FROM qr_checkins qc
       LEFT JOIN bookings b ON qc.booking_id = b.id
       WHERE qc.user_id = $1
       ORDER BY qc.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, skip]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS total FROM qr_checkins WHERE user_id = $1',
      [userId]
    );

    const total = countResult.rows[0]?.total || 0;

    const history = rows.map((row) => {
      const deviceInfo = row.device_info ? JSON.parse(row.device_info) : null;
      const location = row.location ? JSON.parse(row.location) : null;
      const bookingInfo = {
        id: row.booking_id,
        reference: row.booking_reference,
        spaceType: row.service_type,
        seatName: row.seat_name,
        startTime: row.start_time,
        endTime: row.end_time
      };

      const checkInTime = row.check_in_at;
      const checkOutTime = row.check_out_at;
      let durationMinutes = null;
      if (checkInTime && checkOutTime) {
        durationMinutes = Math.max(0, Math.round((new Date(checkOutTime) - new Date(checkInTime)) / 60000));
      }

      return {
        _id: row.id,
        id: row.id,
        bookingId: bookingInfo, // backward compatibility with old FE schema
        booking: bookingInfo,
        bookingReference: row.booking_reference,
        status: row.status,
        checkInTime,
        checkOutTime,
        durationMinutes,
        deviceInfo,
        location,
        notes: row.notes,
        rating: row.rating,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        uploadInfo: row.actual_seat ? { seat: row.actual_seat } : null
      };
    });

    return {
      checkIns: history,
      total,
      limit,
      skip,
      hasMore: skip + history.length < total
    };
  }

  formatQRResponse(qrRecord, booking) {
    const qrData = typeof qrRecord.qr_data === 'string' ? JSON.parse(qrRecord.qr_data) : qrRecord.qr_data;
    return {
      qrCode: { qrString: qrRecord.qr_string },
      qrData,
      expiresAt: qrRecord.expires_at,
      booking: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        seatName: booking.seat_name,
        serviceType: booking.service_type,
        startDate: booking.start_time,
        endDate: booking.end_time,
        status: booking.status
      },
      isValid: new Date(qrRecord.expires_at) > new Date(),
      usageCount: qrRecord.usage_count,
      maxUsage: qrRecord.max_usage
    };
  }

  async generateAndEmailQR(bookingId, userId, userEmail, userData) {
    try {
      const qrResult = await this.generateQRCode(bookingId, userId);
      const imageResult = await qrImageService.generateQRImage(qrResult.qrCode.qrString, { ...qrResult.booking, customerName: userData.fullName || userData.name });
      if (!imageResult.success) return { success: true, qrCode: qrResult.qrCode, booking: qrResult.booking, emailSent: false, message: 'QR code generated but email failed' };
      const imageBuffer = await qrImageService.getImageBuffer(imageResult.filepath);
      if (!imageBuffer) return { success: true, qrCode: qrResult.qrCode, booking: qrResult.booking, emailSent: false, message: 'QR code generated but email attachment failed' };

      // Build email booking data (simplified)
      const bookingData = {
        bookingReference: qrResult.booking.bookingReference,
        serviceType: qrResult.booking.serviceType,
        startDate: qrResult.booking.startDate,
        endDate: qrResult.booking.endDate,
        seatName: qrResult.booking.seatName,
        totalAmount: qrResult.booking.totalAmount || qrResult.booking.finalPrice || null,
        manualCode: qrResult.qrCode.qrString
      };
      const emailResult = await emailService.sendBookingWithQR(userEmail, bookingData, userData, imageBuffer, imageResult.filename);
      setTimeout(async () => { try { await qrImageService.cleanupTempFiles(0); } catch (e) {} }, 5000);
      return { success: true, qrCode: qrResult.qrCode, booking: qrResult.booking, emailSent: emailResult.success, emailInfo: emailResult, image: { filename: imageResult.filename, size: imageResult.size } };
    } catch (error) {
      console.error('Generate and email QR error:', error);
      return { success: false, message: error.message || 'Failed to generate QR and send email' };
    }
  }
}

module.exports = new QRService();
