const express = require('express');
const auth = require('../middleware/auth');
const { getBookingRepository } = require('../repositories/bookingRepository');
const { getUserRepository } = require('../repositories/userRepository');
const { getPaymentRepository } = require('../../repositories/paymentRepository');
const emailService = require('../services/emailService');
const { getPgPool } = require('../../config/pg');

const router = express.Router();
const bookingRepo = getBookingRepository();
const userRepo = getUserRepository();
const paymentRepo = getPaymentRepository();
const pgPool = getPgPool();
const packageCache = new Map(); // In-memory cache to avoid repeated package lookups per process

const legacyBasePrices = {
  'hot-desk': { daily: 78333, weekly: 587500, monthly: 2350000, yearly: 28200000 },
  'fixed-desk': { daily: 98333, weekly: 737500, monthly: 2950000, yearly: 35400000 }
};
const legacyDiscounts = { daily: 0, weekly: 5, monthly: 10, yearly: 15 };
const legacyDurations = new Set(Object.keys(legacyDiscounts));
const SERVICE_CAPACITY = {
  'hot-desk': 110
};
const PROBE_WINDOW_MINUTES = 1;
const PROBE_WINDOW_MS = PROBE_WINDOW_MINUTES * 60 * 1000;

const normalizeString = (value) => {
  if (value === undefined || value === null) return '';
  return value.toString().toLowerCase().trim();
};
const normalizeServiceType = (serviceType = '') => normalizeString(serviceType).replace(/\s+/g, '-');

async function getPackageMeta(packageDuration) {
  const numericId = Number(packageDuration);
  if (!Number.isFinite(numericId) || numericId <= 0) return null;
  if (packageCache.has(numericId)) return packageCache.get(numericId);

  const query = `
    SELECT sp.*, s.code AS service_code, tu.code AS unit_code
    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    JOIN time_units tu ON tu.id = sp.unit_id
    WHERE sp.id = $1
    LIMIT 1`;

  const { rows } = await pgPool.query(query, [numericId]);
  const pkg = rows[0] || null;
  if (pkg) packageCache.set(numericId, pkg);
  return pkg;
}

const calculatePackagePricing = (serviceType, packageDuration, packageMeta, fallbackPricing = {}) => {
  const normalizedService = normalizeServiceType(serviceType);
  const durationKey = normalizeString(packageDuration);

  if (durationKey && legacyDurations.has(durationKey)) {
    const basePrice = legacyBasePrices[normalizedService]?.[durationKey] || 0;
    const discountPercentage = legacyDiscounts[durationKey] || 0;
    const finalPrice = Math.round(basePrice * (1 - discountPercentage / 100));
    return { basePrice, discountPercentage, finalPrice };
  }

  if (packageMeta) {
    const basePrice = Number(packageMeta.price) || 0;
    const discountPercentage = Number(packageMeta.discount_pct || 0);
    const finalPrice = Math.round(basePrice * (1 - discountPercentage / 100));
    return { basePrice, discountPercentage, finalPrice };
  }

  const fallbackBase = Number(fallbackPricing.basePrice ?? fallbackPricing.totalAmount ?? 0) || 0;
  const fallbackDiscount = Number(fallbackPricing.discountPercentage ?? fallbackPricing.discountPct ?? 0) || 0;
  let fallbackFinal = Number(fallbackPricing.finalPrice ?? fallbackPricing.finalAmount ?? 0) || 0;
  if (!fallbackFinal && fallbackBase) {
    fallbackFinal = Math.round(fallbackBase * (1 - fallbackDiscount / 100));
  }

  return {
    basePrice: fallbackBase,
    discountPercentage: fallbackDiscount,
    finalPrice: fallbackFinal || fallbackBase
  };
};

const calculateEndDate = (startDate, packageDuration, packageMeta = null) => {
  const start = new Date(startDate);
  const durationKey = normalizeString(packageDuration);

  const addDays = (days) => {
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    return end;
  };

  if (packageMeta) {
    const accessDays = Number(packageMeta.access_days);
    if (accessDays) return addDays(accessDays);

    const unitCode = normalizeString(packageMeta.unit_code || packageMeta.unitCode || '');
    switch (unitCode) {
      case 'week':
        return addDays(7);
      case 'month': {
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        return end;
      }
      case 'year': {
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        return end;
      }
      default:
        return addDays(1);
    }
  }

  switch (durationKey) {
    case 'daily':
      return addDays(1);
    case 'weekly':
      return addDays(7);
    case 'monthly': {
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return end;
    }
    case 'yearly': {
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      return end;
    }
    default:
      return addDays(1);
  }
};

router.post('/', auth, async (req, res) => {
  try {
    const { serviceType, packageDuration, startDate, startTime, seatId, seatName, floor, specialRequests } = req.body;
    if (!serviceType || !packageDuration || !startDate || !startTime || !seatId || !seatName) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

  const user = await userRepo.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const packageMeta = await getPackageMeta(packageDuration);
    const endDate = calculateEndDate(startDate, packageDuration, packageMeta);
    const endTime = startTime;
    const pricing = calculatePackagePricing(serviceType, packageDuration, packageMeta, req.body);

    const bookingData = {
      userId: user.id || user._id,
      userEmail: user.email,
      userFullName: user.fullName,
      serviceType,
      packageDuration,
      packageId: packageMeta?.id || null,
      packageName: packageMeta?.name || req.body.packageName || seatName,
      startDate: new Date(startDate),
      endDate,
      startTime,
      endTime,
      seatId,
      seatName,
      floor: floor || 1,
      basePrice: pricing.basePrice,
      discountPercentage: pricing.discountPercentage,
      finalPrice: pricing.finalPrice,
      specialRequests,
      quantity: req.body.quantity ?? 1
    };

    const created = await bookingRepo.create(bookingData);
    if (created.conflict) {
      return res.status(409).json({ success: false, message: 'Selected seat is not available for the chosen time period' });
    }
    const booking = created.booking;

    const paymentInfo = req.body?.paymentInfo || {};
    const amount = booking.finalPrice || booking.final_price || booking.basePrice || 0;

    try {
      await paymentRepo.ensurePendingPayment({
        bookingId: booking.id,
        amount,
        currency: 'VND',
        paymentMethod: paymentInfo.method || 'offline',
        description: paymentInfo.description || `Pending payment for booking ${booking.bookingReference || booking.booking_reference}`,
        userId: user.id || user._id,
        userEmail: user.email,
        userFullName: user.fullName,
        username: user.username,
      });
    } catch (paymentError) {
      console.error('⚠️ Failed to create pending payment record:', paymentError);
    }

    try {
      await emailService.sendPendingPaymentNotification(
        user.email,
        {
          bookingReference: booking.bookingReference || booking.booking_reference,
          serviceType: booking.serviceType || booking.service_type,
          packageDuration: booking.packageDuration || booking.package_duration,
          startDate: booking.startDate || booking.start_time,
          endDate: booking.endDate || booking.end_time,
          seatName: booking.seatName || booking.seat_name,
          totalAmount: booking.finalPrice || booking.final_price
        },
        { fullName: user.fullName, email: user.email }
      );
    } catch (emailError) {
      console.error('⚠️ Failed to send pending payment notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: bookingRepo.toResponse ? bookingRepo.toResponse(booking) : booking,
      emailSent: true
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const { bookings, total } = await bookingRepo.listForUser(req.user.userId || req.user.id, { status, skip: parseInt(skip), limit: parseInt(limit) });
  const result = (bookingRepo.toResponse ? bookings.map(b => bookingRepo.toResponse(b)) : bookings);
  res.json({ success: true, bookings: result, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting bookings', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
  const booking = await bookingRepo.findByIdForUser(req.params.id, req.user.userId || req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, booking: bookingRepo.toResponse ? bookingRepo.toResponse(booking) : booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting booking', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
  const { specialRequests } = req.body;
  const updated = await bookingRepo.updateSpecialRequests(req.params.id, req.user.userId || req.user.id, specialRequests);
  if (!updated) return res.status(404).json({ success: false, message: 'Booking not found or not pending' });
  if (updated.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot update booking that is not pending' });
  res.json({ success: true, message: 'Booking updated successfully', booking: bookingRepo.toResponse ? bookingRepo.toResponse(updated) : updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Server error updating booking' });
  }
});

router.patch('/:id/cancel', auth, async (req, res) => {
  try {
  const canceled = await bookingRepo.cancel(req.params.id, req.user.userId || req.user.id);
  if (!canceled) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (canceled.alreadyCancelled) return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  if (canceled.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot cancel booking with current status' });
  res.json({ success: true, message: 'Booking cancelled successfully', booking: bookingRepo.toResponse ? bookingRepo.toResponse(canceled) : canceled });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
});

// Cancel booking (DELETE semantics)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await bookingRepo.deletePermanent(req.params.id, req.user.userId || req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (deleted.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot delete booking with current status. Please cancel first.' });
    res.json({ success: true, message: 'Booking permanently deleted successfully', deletedBookingReference: deleted.bookingReference || deleted.booking_reference });
  } catch (error) {
    console.error('Permanent delete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting booking', error: error.message });
  }
});

// Permanently delete booking
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const deleted = await bookingRepo.deletePermanent(req.params.id, req.user.userId || req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (deleted.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot delete booking with current status. Please cancel first.' });
    res.json({ success: true, message: 'Booking permanently deleted successfully', deletedBookingReference: deleted.bookingReference || deleted.booking_reference });
  } catch (error) {
    console.error('Permanent delete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting booking', error: error.message });
  }
});

// Confirm booking payment
router.post('/:id/confirm-payment', auth, async (req, res) => {
  try {
  const { paymentMethod, transactionId } = req.body || {};
  const updated = await bookingRepo.confirmPayment(req.params.id, req.user.userId || req.user.id, { paymentMethod, transactionId });
  if (!updated) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (updated.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot confirm payment for non-pending booking' });
  res.json({ success: true, message: 'Payment confirmed successfully', booking: bookingRepo.toResponse ? bookingRepo.toResponse(updated) : updated });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Server error confirming payment', error: error.message });
  }
});

// Available seats
router.get('/seats/available', auth, async (req, res) => {
  try {
  const { serviceType, startDate, endDate } = req.query;
    if (!serviceType || !startDate || !endDate) return res.status(400).json({ success: false, message: 'Service type, start date, and end date are required' });
  const seats = await bookingRepo.findAvailableSeats(new Date(startDate), new Date(endDate), serviceType);
    res.json({ success: true, seats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting available seats', error: error.message });
  }
});

// Occupied seats on date/time
router.get('/seats/occupied', auth, async (req, res) => {
  try {
    const { serviceType, date, endDate, startTime, endTime, probeStartOnly: probeFlag } = req.query;
    if (!serviceType || !date) return res.status(400).json({ success: false, message: 'Service type and date are required' });
    const probeStartOnly = typeof probeFlag === 'string'
      ? probeFlag.toLowerCase() === 'true'
      : Boolean(probeFlag);

    const parseDateTime = (value, time, fallbackEndOfDay = false) => {
      if (!value) return null;

      let dt = null;
      let treatAsDateOnly = false;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (dateOnlyMatch) {
          const [, year, month, day] = dateOnlyMatch;
          dt = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
          treatAsDateOnly = true;
        } else {
          dt = new Date(trimmed);
        }
      } else if (value instanceof Date) {
        dt = new Date(value.getTime());
        treatAsDateOnly =
          value.getHours() === 0 &&
          value.getMinutes() === 0 &&
          value.getSeconds() === 0 &&
          value.getMilliseconds() === 0;
      } else {
        dt = new Date(value);
      }

      if (Number.isNaN(dt.getTime())) return null;

      if (typeof time === 'string' && time.length) {
        const [h = '0', m = '0'] = time.split(':');
        const parsedH = Number.parseInt(h, 10);
        const parsedM = Number.parseInt(m, 10);
        dt.setHours(Number.isFinite(parsedH) ? parsedH : 0, Number.isFinite(parsedM) ? parsedM : 0, 0, 0);
      } else if (treatAsDateOnly) {
        if (fallbackEndOfDay) {
          dt.setHours(23, 59, 59, 999);
        } else {
          dt.setHours(0, 0, 0, 0);
        }
      }

      return dt;
    };

    const startDateTime = parseDateTime(date, startTime, false);
    if (!startDateTime) {
      return res.status(400).json({ success: false, message: 'Invalid start date' });
    }
    let endDateTime = parseDateTime(endDate || date, endTime, true);
    if (!endDateTime) {
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(23, 59, 59, 999);
    }
    if (endDateTime <= startDateTime) {
      if (endDate) {
        endDateTime = new Date(startDateTime.getTime() + 60 * 1000);
      } else {
        endDateTime = new Date(startDateTime);
        endDateTime.setHours(23, 59, 59, 999);
      }
    }

    const effectiveEndDateTime = probeStartOnly
      ? new Date(startDateTime.getTime() + PROBE_WINDOW_MS)
      : endDateTime;

    const occupiedSeats = await bookingRepo.findOccupiedSeats({ serviceType, startDateTime, endDateTime: effectiveEndDateTime });
    const normalizedService = normalizeServiceType(serviceType);
    const capacity = SERVICE_CAPACITY[normalizedService] ?? null;
    const occupiedCount = occupiedSeats.length;
    const seatsLeft = capacity == null ? null : Math.max(0, capacity - occupiedCount);
    const timeWindow = {
      start: startDateTime.toISOString(),
      end: effectiveEndDateTime.toISOString()
    };

    res.json({
      success: true,
      date,
      endDate,
      serviceType,
      startTime,
      endTime,
      probeStartOnly,
      occupiedSeats,
      count: occupiedCount,
      timeWindow,
      summary: {
        capacity,
        occupiedCount,
        seatsLeft,
        timeWindow,
        probeStartOnly
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting occupied seats', error: error.message });
  }
});

// Test email service
router.post('/test-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (emailService.testConnection) {
      const connectionTest = await emailService.testConnection();
      if (!connectionTest.success) return res.status(500).json({ success: false, message: 'Email service connection failed', error: connectionTest.error });
    }
    const to = user.email;
    const result = await (emailService.sendTestEmail ? emailService.sendTestEmail(to) : emailService.sendBookingConfirmation(to, { bookingReference: 'TEST', serviceType: 'hot-desk', packageDuration: 'daily', startDate: new Date(), startTime: '09:00', seatName: 'A1', totalAmount: 0 }, { fullName: user.fullName }));
    if (result && result.success) return res.json({ success: true, message: 'Test email sent successfully', recipient: to, messageId: result.messageId });
    return res.status(500).json({ success: false, message: 'Failed to send test email', error: result && result.error });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error testing email', error: error.message });
  }
});

module.exports = router;
