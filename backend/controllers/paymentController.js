const { getPaymentRepository } = require('../repositories/paymentRepository');
const { getPgPool } = require('../config/pg');
const qrService = require('../userapi/services/qrService');

const pool = getPgPool();

const PAYMENT_STATUS_TO_BOOKING_STATUS = {
  success: 'paid',
  failed: 'canceled',
  expired: 'canceled',
  processing: 'awaiting_payment',
  created: 'pending'
};

const normalizeBookingStatusFilter = (value) => {
  if (!value || value === 'all') return value;
  switch (value) {
    case 'confirmed':
      return 'awaiting_payment';
    case 'cancelled':
      return 'canceled';
    case 'paid_or_awaiting':
      return 'paid_or_awaiting';
    default:
      return value;
  }
};

async function getBookingWithUser(bookingId) {
  if (!bookingId) return null;
  try {
    const query = `
      SELECT b.id AS booking_id, b.booking_reference, b.service_type, b.start_time, b.end_time,
             b.seat_name, b.final_price, b.user_id, u.full_name, u.email
      FROM bookings b
      LEFT JOIN users u ON b.user_id::bigint = u.id
      WHERE b.id = $1
      LIMIT 1`;
    const result = await pool.query(query, [bookingId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to fetch booking for payment notification:', error);
    return null;
  }
}

async function sendPaymentSuccessEmail(payment) {
  try {
    const booking = await getBookingWithUser(payment.bookingId || payment.booking_id);
    if (!booking) {
      console.warn('⚠️ Payment success email skipped: booking not found', payment.id);
      return;
    }

    const userId = booking.user_id;
    const userEmail = booking.email || payment.userEmail;
    const userData = {
      fullName: booking.full_name || payment.userFullName || 'Valued Customer',
      email: userEmail
    };

    if (!userId || !userEmail) {
      console.warn('⚠️ Missing user info for payment success email', payment.id);
      return;
    }

    const bookingId = booking.booking_id;
    const emailResult = await qrService.generateAndEmailQR(
      bookingId,
      userId,
      userEmail,
      userData
    );

    if (emailResult?.success) {
      console.log('📧 Payment success email sent with QR for booking', booking.booking_reference);
    } else {
      console.error('❌ Failed to send payment success email', emailResult?.message);
    }
  } catch (error) {
    console.error('❌ Error sending payment success email:', error);
  }
}

const paymentController = {
  async createPayment(req, res) {
    try {
      const { bookingId, amount, paymentMethod, description } = req.body;
      const userId = req.user.id;

      console.log('📝 Creating payment for user:', userId, 'booking:', bookingId);

      const paymentData = {
        bookingId,
        userId,
        amount,
        userEmail: req.user.email,
        userFullName: req.user.fullName,
        username: req.user.username,
        paymentMethod: paymentMethod || 'vnpay',
        description: description || 'Payment for booking'
      };

      const paymentRepository = getPaymentRepository();
      const payment = await paymentRepository.createPayment(paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });

    } catch (error) {
      console.error('❌ Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment',
        error: error.message
      });
    }
  },

  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 10, status, search, bookingStatus } = req.query;
      const offset = (page - 1) * limit;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        search,
        bookingStatus: normalizeBookingStatusFilter(bookingStatus)
      };

      const paymentRepository = getPaymentRepository();
      const payments = await paymentRepository.getAllPayments(options);

      res.json({
        success: true,
        data: payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: payments.length
        }
      });

    } catch (error) {
      console.error('❌ Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments',
        error: error.message
      });
    }
  },

  // Get user's own payments
  async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const paymentRepository = getPaymentRepository();
      const payments = await paymentRepository.getAllPayments({
        userId: userId,
        limit: limit,
        offset: offset
      });

      res.json({
        success: true,
        payments: payments,
        pagination: {
          page: page,
          limit: limit,
          total: payments.length
        }
      });

    } catch (error) {
      console.error('❌ Get user payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user payments',
        error: error.message
      });
    }
  },

  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const paymentRepository = getPaymentRepository();
      const payment = await paymentRepository.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error('❌ Get payment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment',
        error: error.message
      });
    }
  },

  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const paymentRepository = getPaymentRepository();
      const existingPayment = await paymentRepository.getPaymentById(id);
      const payment = await paymentRepository.updatePaymentStatus(id, status);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment?.bookingId) {
        const bookingStatus = PAYMENT_STATUS_TO_BOOKING_STATUS[status] || null;
        try {
          if (bookingStatus) {
            await pool.query(
              `UPDATE bookings SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3`,
              [bookingStatus, status, payment.bookingId]
            );
          } else {
            await pool.query(`UPDATE bookings SET payment_status = $1, updated_at = NOW() WHERE id = $2`, [status, payment.bookingId]);
          }
        } catch (bookingError) {
          console.error('❌ Failed to sync booking status with payment update:', bookingError);
        }
      }

      const isAdminActor = req.user && ['admin', 'superadmin'].includes(req.user.role);

      if (status === 'success' && existingPayment?.status !== 'success' && isAdminActor) {
        await sendPaymentSuccessEmail(payment);
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: payment
      });

    } catch (error) {
      console.error('❌ Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
        error: error.message
      });
    }
  },

  async getPaymentStats(req, res) {
    try {
      const paymentRepository = getPaymentRepository();
      const stats = await paymentRepository.getPaymentStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment statistics',
        error: error.message
      });
    }
  }
};

module.exports = paymentController;
