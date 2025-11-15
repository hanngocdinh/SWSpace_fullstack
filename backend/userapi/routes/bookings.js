const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { getBookingRepository } = require('../repositories/bookingRepository');
const { getUserRepository } = require('../repositories/userRepository');
const emailService = require('../services/emailService');

const router = express.Router();
const bookingRepo = getBookingRepository();
const userRepo = getUserRepository();

const calculatePackagePricing = (serviceType, packageDuration) => {
  const basePrices = {
    'hot-desk': { daily: 78333, weekly: 587500, monthly: 2350000, yearly: 28200000 },
    'fixed-desk': { daily: 98333, weekly: 737500, monthly: 2950000, yearly: 35400000 }
  };
  const discounts = { daily: 0, weekly: 5, monthly: 10, yearly: 15 };
  const basePrice = basePrices[serviceType]?.[packageDuration] || 0;
  const discountPercentage = discounts[packageDuration] || 0;
  return { basePrice, discountPercentage, finalPrice: Math.round(basePrice * (1 - discountPercentage / 100)) };
};

const calculateEndDate = (startDate, packageDuration) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  switch (packageDuration) {
    case 'daily': endDate.setDate(start.getDate() + 1); break;
    case 'weekly': endDate.setDate(start.getDate() + 7); break;
    case 'monthly': endDate.setMonth(start.getMonth() + 1); break;
    case 'yearly': endDate.setFullYear(start.getFullYear() + 1); break;
    default: endDate.setDate(start.getDate() + 1);
  }
  return endDate;
};

router.post('/', auth, async (req, res) => {
  try {
    const { serviceType, packageDuration, startDate, startTime, seatId, seatName, floor, specialRequests } = req.body;
    if (!serviceType || !packageDuration || !startDate || !startTime || !seatId || !seatName) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

  const user = await userRepo.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const endDate = calculateEndDate(startDate, packageDuration);
    const endTime = startTime;
    const pricing = calculatePackagePricing(serviceType, packageDuration);

    const bookingData = {
      userId: user._id,
      userEmail: user.email,
      userFullName: user.fullName,
      serviceType,
      packageDuration,
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
      specialRequests
    };

    const created = await bookingRepo.create(bookingData);
    if (created.conflict) {
      return res.status(409).json({ success: false, message: 'Selected seat is not available for the chosen time period' });
    }
    const booking = created.booking;

    try {
      const qrData = {
        bookingId: (booking._id?.toString?.() || booking.id)?.toString(),
        bookingReference: booking.bookingReference || booking.booking_reference,
        serviceType: booking.serviceType || booking.service_type,
        userFullName: user.fullName,
        startDate: booking.startDate || booking.start_time,
        startTime: booking.startTime || booking.start_time,
        seatName: booking.seatName || booking.seat_name,
        timestamp: new Date().toISOString()
      };
      const QRCode = require('qrcode');
      const qrString = JSON.stringify(qrData);
      const qrDataURL = await QRCode.toDataURL(qrString, { width: 256, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } });
      const tempDir = os.tmpdir();
      const qrFileName = `qr-${booking.bookingReference}.png`;
      const qrFilePath = path.join(tempDir, qrFileName);
      const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(qrFilePath, buffer);

      const emailResult = await emailService.sendQRBookingConfirmation(
        user.email,
        {
          bookingReference: booking.bookingReference || booking.booking_reference,
          serviceType: booking.serviceType || booking.service_type,
          packageDuration: booking.packageDuration || booking.package_duration,
          startDate: booking.startDate || booking.start_time,
          startTime: booking.startTime || booking.start_time,
          endDate: booking.endDate || booking.end_time,
          seatName: booking.seatName || booking.seat_name,
          totalAmount: booking.finalPrice || booking.final_price,
          userFullName: user.fullName
        },
        qrFilePath
      );
      try { fs.unlinkSync(qrFilePath); } catch {}
    } catch (emailError) {
      try {
        await emailService.sendBookingConfirmation(
          user.email,
          {
            bookingReference: booking.bookingReference || booking.booking_reference,
            serviceType: booking.serviceType || booking.service_type,
            packageDuration: booking.packageDuration || booking.package_duration,
            startDate: booking.startDate || booking.start_time,
            startTime: booking.startTime || booking.start_time,
            seatName: booking.seatName || booking.seat_name,
            totalAmount: booking.finalPrice || booking.final_price
          },
          { fullName: user.fullName, email: user.email }
        );
      } catch {}
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
    const { serviceType, date, startTime, endTime } = req.query;
    if (!serviceType || !date) return res.status(400).json({ success: false, message: 'Service type and date are required' });
    const targetDate = new Date(date);
    let startDateTime = new Date(targetDate);
    let endDateTime = new Date(targetDate);
    if (startTime) { const [h,m] = startTime.split(':'); startDateTime.setHours(parseInt(h), parseInt(m), 0, 0); }
    if (endTime) { const [h,m] = endTime.split(':'); endDateTime.setHours(parseInt(h), parseInt(m), 0, 0); } else { endDateTime.setHours(23,59,59,999); }
  const occupiedSeats = await bookingRepo.findOccupiedSeats({ serviceType, startDateTime, endDateTime });
    res.json({ success: true, date, serviceType, startTime, endTime, occupiedSeats, count: occupiedSeats.length });
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
