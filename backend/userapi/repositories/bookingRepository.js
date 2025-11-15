// Booking repository (PostgreSQL only)
// Vietnamese summary: Repository đặt lớp trung gian giữa route và DB cho đặt chỗ (booking)
// Maintains existing response contract used by routes/bookings.js

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
    return map[key] || key.replace(/\s+/g,'_');
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
      const endTs = combineDateTime(data.endDate, data.endTime);
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
          status, booking_reference, notes, price_total
        ) VALUES (
          $1,$2,$3,
          $4,$5,$6,$7,
          $8,$9,$10,$11,$12,$13,
          'pending',$14,$15,$16
        ) RETURNING id, user_id, service_type, package_duration, start_time, end_time,
          seat_code, seat_name, floor_no, final_price, status, booking_reference`,
        [data.userId, categoryId, serviceId,
         data.serviceType, data.packageDuration, startTs, endTs,
         data.seatId, data.seatName, data.floor || 1, data.basePrice, data.discountPercentage ?? 0,
         data.finalPrice, bookingRef, data.specialRequests || null, data.finalPrice]
      );
      return { conflict: false, booking: rows[0] };
    },
    async findByIdForUser(id, userId){
      const { rows } = await pool.query(
        `SELECT id, booking_reference, service_type, package_duration, start_time, end_time,
                seat_name, seat_code, floor_no, final_price, status, payment_status
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
                seat_name, seat_code, floor_no, final_price, status, payment_status
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
      const { rows: sel } = await pool.query(`SELECT status, booking_reference FROM bookings WHERE id=$1 AND user_id=$2`, [id, userId]);
      if (!sel[0]) return null;
      if (!['pending','canceled','cancelled'].includes(sel[0].status)) return { invalidStatus: true };
      await pool.query(`DELETE FROM bookings WHERE id=$1 AND user_id=$2`, [id, userId]);
      return { booking_reference: sel[0].booking_reference };
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
      const { rows } = await pool.query(`SELECT seat_code AS seatId, seat_name AS seatName, floor_no AS floor, booking_reference, start_time AS startDate, end_time AS endDate FROM bookings WHERE service_type=$1 AND status IN ('paid','checked_in','checked_out') AND ((start_time BETWEEN $2 AND $3) OR (end_time BETWEEN $2 AND $3) OR (start_time <= $2 AND end_time >= $3))`, [serviceType, startDateTime, endDateTime]);
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
