// Booking repository (PostgreSQL only)
// Vietnamese summary: Repository đặt lớp trung gian giữa route và DB cho đặt chỗ (booking)
// Maintains existing response contract used by routes/bookings.js
const activityLogRepo = require('../../repositories/activityLogRepository');

function createPgRepo() {
  const { getPgPool } = require('../../config/pg');
  const pool = getPgPool();

  // Helper: build timestamp from date string (or Date) + time HH:MM
  function combineDateTime(dateLike, timeStr){
    const d = new Date(dateLike);
    if (timeStr){ const [h,m] = timeStr.split(':'); d.setHours(parseInt(h), parseInt(m),0,0); }
    return d;
  }
  function normalizeServiceCode(name){
    if (!name) return null;
    const map = {
      'private office': 'private_office',
      'meeting room': 'meeting_room',
      'networking space': 'networking',
      'hot desk': 'hot_desk',
      'fixed desk': 'fixed_desk',
    };
    const key = String(name).toLowerCase().trim();
    const canonical = key.replace(/[\s_-]+/g, ' ').trim();
    if (map[key]) return map[key];
    if (map[canonical]) return map[canonical];
    return canonical.replace(/\s+/g,'_');
  }
  async function getServiceMeta(serviceType){
    const code = normalizeServiceCode(serviceType);
    const { rows } = await pool.query(
      `SELECT s.id AS service_id, s.category_id
       FROM services s
       WHERE lower(s.code) = lower($1) OR lower(s.name) = lower($1)
       LIMIT 1`,
      [code]
    );
    return rows[0] || null;
  }
  async function hasConflict({ seatCode, startTs, endTs }) {
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings
       WHERE seat_code = $1
         AND status NOT IN ('canceled','refunded')
         AND start_time <= $3 AND end_time >= $2
       LIMIT 1`,
      [seatCode, startTs, endTs]
    );
    return rows.length > 0;
  }

  return {
    async create(data){
      // Expect data fields similar to bookingData in route
      const startTs = combineDateTime(data.startDate, data.startTime);
      let endTs = combineDateTime(data.endDate ?? data.startDate, data.endTime ?? data.startTime);
      if (!(endTs instanceof Date) || Number.isNaN(endTs.getTime()) || endTs <= startTs) {
        endTs = new Date(startTs.getTime() + 60 * 60 * 1000); // fallback 1 hour window
      }
      const normalizedService = normalizeServiceCode(data.serviceType);
      if (['hot_desk', 'fixed_desk'].includes(normalizedService) && endTs > startTs) {
        endTs = new Date(endTs.getTime() - 60 * 1000); // leave one minute buffer for next booking
        if (endTs <= startTs) {
          endTs = new Date(startTs.getTime() + 60 * 1000);
        }
      }
      const conflict = await hasConflict({ seatCode: data.seatId, startTs, endTs });
      if (conflict) return { conflict: true };
      const svc = await getServiceMeta(data.serviceType);
      // If not found, we still proceed but set nullable fields; however schema requires NOT NULL so attempt fallback
      const categoryId = svc?.category_id || 2; // default to 'team' category id (from 02-data.sql)
      const serviceId = svc?.service_id || 4;   // default to 'Meeting Room' id if available
      // Generate booking reference
      const ts = Date.now().toString(36);
      const rnd = Math.random().toString(36).substring(2,7).toUpperCase();
      const bookingRef = `SWS-${ts}-${rnd}`.toUpperCase();
      // Insert (using added columns via migration Part B)
      const { rows } = await pool.query(
        `INSERT INTO bookings (
          user_id, category_id, service_id,
          service_type, package_duration, start_time, end_time,
          seat_code, seat_name, floor_no, base_price, discount_pct, final_price,
          status, booking_reference, notes, price_total, package_id
        ) VALUES (
          $1,$2,$3,
          $4,$5,$6,$7,
          $8,$9,$10,$11,$12,$13,
          'pending',$14,$15,$16,$17
        ) RETURNING id, user_id, service_type, package_duration, start_time, end_time,
          seat_code, seat_name, floor_no, base_price, discount_pct, final_price, status, booking_reference`,
        [data.userId, categoryId, serviceId,
         data.serviceType, data.packageDuration, startTs, endTs,
         data.seatId, data.seatName, data.floor || 1, data.basePrice, data.discountPercentage ?? 0,
         data.finalPrice, bookingRef, data.specialRequests || null, data.finalPrice, data.packageId || null]
      );
      const booking = rows[0];
      try {
        await activityLogRepo.recordBookingEvent({
          action: 'pending',
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
          userId: data.userId,
          userName: data.userFullName || data.userEmail,
          userEmail: data.userEmail,
          serviceType: booking.service_type,
          packageName: data.packageName || data.seatName || booking.service_type,
          quantity: typeof data.quantity === 'number' ? data.quantity : 1,
          totalAmount: data.finalPrice,
          metadata: {
            seatName: data.seatName || null,
            seatCode: data.seatId || null,
            packageId: data.packageId || null,
            packageDuration: data.packageDuration || null
          }
        });
      } catch (logErr) {
        console.error('bookingRepository.create.logFailed', logErr);
      }
      return { conflict: false, booking };
    },
    async findByIdForUser(id, userId){
      const { rows } = await pool.query(
        `SELECT id, booking_reference, service_type, package_duration, start_time, end_time,
          seat_name, seat_code, floor_no, base_price, discount_pct, final_price, status, payment_status
         FROM bookings WHERE id=$1 AND user_id=$2 LIMIT 1`, [id, userId]
      );
      return rows[0] || null;
    },
    async listForUser(userId, { status, skip, limit }){
      const params = [userId];
      let where = 'user_id=$1';
      if (status){ params.push(status); where += ` AND status=$${params.length}`; }
      params.push(limit); params.push(skip);
      const { rows } = await pool.query(
        `SELECT id, booking_reference, service_type, package_duration, start_time, end_time,
          seat_name, seat_code, floor_no, base_price, discount_pct, final_price, status, payment_status
         FROM bookings WHERE ${where}
         ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      );
      const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS total FROM bookings WHERE ${where.replace(/ORDER BY.*$/,'')}`, params.slice(0, status ? 2 : 1));
      return { bookings: rows, total: countRows[0].total };
    },
    async updateSpecialRequests(id, userId, specialRequests){
      // store in notes column
      const { rows } = await pool.query(`UPDATE bookings SET notes=$3 WHERE id=$1 AND user_id=$2 AND status='pending' RETURNING *`, [id, userId, specialRequests]);
      if (!rows[0]) return null;
      return rows[0];
    },
    async cancel(id, userId){
      const { rows: sel } = await pool.query(`SELECT status FROM bookings WHERE id=$1 AND user_id=$2`, [id, userId]);
      if (!sel[0]) return null;
      const current = sel[0].status;
      if (current === 'canceled' || current === 'cancelled') return { alreadyCancelled: true };
      if (current === 'checked_out' || current === 'checked_in') return { invalidStatus: true };
      const { rows } = await pool.query(`UPDATE bookings SET status='canceled' WHERE id=$1 AND user_id=$2 RETURNING *`, [id, userId]);
      return rows[0];
    },
    async deletePermanent(id, userId){
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows: sel } = await client.query(
          `SELECT b.id, b.status, b.booking_reference, b.service_type, b.package_id,
                  b.price_total, b.quantity, b.seat_name, b.seat_code,
              b.package_duration,
                  u.full_name AS user_name, u.email AS user_email,
                  (
                    SELECT sp.name
                    FROM service_packages sp
                    WHERE sp.id = b.package_id
                    LIMIT 1
                  ) AS package_name
           FROM bookings b
           JOIN users u ON u.id = b.user_id
           WHERE b.id=$1 AND b.user_id=$2
           FOR UPDATE`,
          [id, userId]
        );
        if (!sel[0]) {
          await client.query('ROLLBACK');
          return null;
        }
        const normalizedStatus = String(sel[0].status || '').toLowerCase();
        const deletableStatuses = new Set(['pending','awaiting_payment','canceled','cancelled']);
        if (!deletableStatuses.has(normalizedStatus)) {
          await client.query('ROLLBACK');
          return { invalidStatus: true };
        }
        const details = sel[0];
        try {
          await activityLogRepo.recordBookingEvent({
            bookingId: details.id,
            bookingReference: details.booking_reference,
            userId,
            userName: details.user_name || details.user_email,
            userEmail: details.user_email,
            serviceType: details.service_type,
            packageName: details.package_name || details.seat_name || details.service_type,
            quantity: typeof details.quantity === 'number' ? details.quantity : null,
            totalAmount: details.price_total || null,
            action: 'deleted',
            metadata: {
              seatName: details.seat_name || null,
              seatCode: details.seat_code || null,
              packageDuration: details.package_duration || null
            }
          });
        } catch (logErr) {
          console.error('bookingRepository.deletePermanent.logFailed', logErr);
        }
        // Remove dependent rows so FK constraints never block the delete
        const cleanupQueries = [
          'DELETE FROM payments WHERE booking_id = $1',
          'DELETE FROM checkins WHERE booking_id = $1',
          'DELETE FROM notifications WHERE booking_id = $1',
          'DELETE FROM qr_checkins WHERE booking_id = $1',
          'DELETE FROM qrcodes WHERE booking_id = $1'
        ];
        for (const sql of cleanupQueries) {
          await client.query(sql, [id]);
        }
        await client.query(`DELETE FROM bookings WHERE id=$1 AND user_id=$2`, [id, userId]);
        await client.query('COMMIT');
        return { booking_reference: details.booking_reference };
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch (_) {
          /* swallow rollback errors */
        }
        throw error;
      } finally {
        client.release();
      }
    },
    async confirmPayment(id, userId, { paymentMethod, transactionId }){
      // For simplicity update payment_status and status
      const { rows: sel } = await pool.query(`SELECT status FROM bookings WHERE id=$1 AND user_id=$2`, [id, userId]);
      if (!sel[0]) return null;
      if (sel[0].status !== 'pending') return { invalidStatus: true };
      // Map paymentMethod code -> payment_methods.id
      let methodId = null;
      if (paymentMethod) {
        const { rows: pm } = await pool.query('SELECT id FROM payment_methods WHERE code=$1 LIMIT 1', [paymentMethod]);
        methodId = pm[0]?.id || null;
      }
      // Create payment row (if method resolved)
      if (methodId) {
        await pool.query(
          `INSERT INTO payments (booking_id, method_id, amount, currency, status, provider_txn_id)
           VALUES ($1,$2,(SELECT final_price FROM bookings WHERE id=$1), 'VND', 'success', $3)
           ON CONFLICT (booking_id, method_id) DO UPDATE SET status='success', provider_txn_id=EXCLUDED.provider_txn_id, updated_at=NOW()`,
          [id, methodId, transactionId || null]
        );
      }
      const { rows } = await pool.query(`UPDATE bookings SET payment_status='success', status='paid' WHERE id=$1 AND user_id=$2 RETURNING *`, [id, userId]);
      return { ...rows[0], payment_created: !!methodId };
    },
    async findAvailableSeats(startDate, endDate, serviceType){
      function generateSeats(){
        const seats=[];
        if (serviceType==='hot-desk' || serviceType==='fixed-desk'){
          for (const row of ['A','B']) for (let n=1;n<=8;n++) seats.push({ id:`${row}${n}`, name:`${row}${n}`, floor:1 });
          for (const row of ['C','D']) for (let n=1;n<=8;n++) seats.push({ id:`${row}${n}`, name:`${row}${n}`, floor:2 });
        }
        return seats;
      }
      const startTs = new Date(startDate); const endTs = new Date(endDate);
  const { rows: bookedRows } = await pool.query(`SELECT DISTINCT seat_code FROM bookings WHERE service_type=$1 AND status NOT IN ('canceled','refunded') AND start_time <= $3 AND end_time >= $2`, [serviceType, startTs, endTs]);
      const busy = new Set(bookedRows.map(r=>r.seat_code));
      return generateSeats().filter(s => !busy.has(s.id));
    },
    async findOccupiedSeats({ serviceType, startDateTime, endDateTime }){
      // Half-open interval so adjacent bookings do not overlap (e.g. 10:00-11:00 and 11:00-12:00)
      const { rows } = await pool.query(
        `SELECT
           seat_code AS seatId,
           seat_name AS seatName,
           floor_no AS floor,
           booking_reference AS "bookingReference",
           start_time AS startDate,
           end_time AS endDate
         FROM bookings
         WHERE service_type = $1
           AND status IN ('paid','checked_in','checked_out')
           AND start_time < $3
           AND end_time > $2`,
        [serviceType, startDateTime, endDateTime]
      );
      return rows;
    },
    toResponse(b){
      return {
        id: b.id,
        bookingReference: b.booking_reference,
        serviceType: b.service_type,
        packageDuration: b.package_duration,
        startDate: b.start_time,
        endDate: b.end_time,
        startTime: b.start_time, // FE expects startTime string; can format later
        endTime: b.end_time,
        seatName: b.seat_name,
        floor: b.floor_no,
        basePrice: b.base_price,
        discountPercentage: b.discount_pct,
        finalPrice: b.final_price,
        status: b.status,
        paymentStatus: b.payment_status
      };
    }
  };
}

function getBookingRepository(){
  return createPgRepo();
}

module.exports = { getBookingRepository };
