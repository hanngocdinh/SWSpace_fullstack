const express = require('express');
const auth = require('../middleware/auth');
const teamRepo = require('../repositories/teamServicesRepository');
const { getBookingRepository } = require('../repositories/bookingRepository');
const { getUserRepository } = require('../repositories/userRepository');
const { getPaymentRepository } = require('../../repositories/paymentRepository');
const emailService = require('../services/emailService');
const {
  extractDateRangeFromQuery,
  getOccupancyMap
} = require('../../utils/teamRoomOccupancy');

const router = express.Router();
const bookingRepo = getBookingRepository();
const userRepo = getUserRepository();
const paymentRepo = getPaymentRepository();
const TEAM_SERVICE_TYPES = new Set([
  'Private Office',
  'Meeting Room',
  'Networking Space',
  'private_office',
  'meeting_room',
  'networking'
]);

const decodeParam = (value = '') => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const resolveServiceCode = (value = '') => {
  if (!value) return '';
  if (typeof teamRepo.normalizeServiceType === 'function') {
    return teamRepo.normalizeServiceType(value) || value;
  }
  return String(value).toLowerCase().trim();
};

const combineDateTime = (dateInput, timeInput) => {
  if (!dateInput) return null;
  const dt = new Date(dateInput);
  if (Number.isNaN(dt.getTime())) return null;
  if (typeof timeInput === 'string' && timeInput.includes(':')) {
    const [hh, mm] = timeInput.split(':').map((part) => parseInt(part, 10));
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      dt.setHours(hh, mm, 0, 0);
    }
  }
  return dt;
};

const buildDateRange = (query = {}) => {
  const { startDate, endDate, startTime, endTime } = query;
  const fallbackStartTime = startTime && startTime.trim() ? startTime : '09:00';
  const fallbackEndTime = endDate || endTime
    ? (endTime && endTime.trim() ? endTime : '17:00')
    : fallbackStartTime;
  const rangeStart = combineDateTime(startDate, fallbackStartTime);
  const rangeEnd = combineDateTime(endDate || startDate, fallbackEndTime);
  if (!rangeStart || !rangeEnd) return null;
  return { rangeStart, rangeEnd };
};

const mapRoomStatusToUI = (value) => {
  switch (value) {
    case 'available': return 'Available';
    case 'occupied': return 'Occupied';
    case 'reserved': return 'Occupied';
    case 'maintenance': return 'Maintenance';
    case 'disabled': return 'Maintenance';
    default: return 'Available';
  }
};

const resolveRangeOrDefault = (query = {}) => {
  const { rangeStart, rangeEnd } = extractDateRangeFromQuery(query);
  if (rangeStart && rangeEnd) return { rangeStart, rangeEnd };
  const fallbackStart = new Date();
  const fallbackEnd = new Date(fallbackStart.getTime() + 24 * 60 * 60 * 1000);
  return { rangeStart: fallbackStart, rangeEnd: fallbackEnd };
};

router.get('/services', async (req, res) => {
  try {
    const services = await teamRepo.listActiveServices();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('❌ Failed to list team services:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching services' });
  }
});

router.get('/services/:service/packages', async (req, res) => {
  try {
    const serviceParam = decodeParam(req.params.service);
    const packages = await teamRepo.listPackagesByServiceType(serviceParam);
    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('❌ Failed to list team packages:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching packages' });
  }
});

router.get('/services/:service/rooms/status', async (req, res) => {
  try {
    const serviceParam = decodeParam(req.params.service);
    const rooms = await teamRepo.listRoomsStatusByServiceType(serviceParam);
    if (!rooms || !rooms.length) {
      return res.json({ success: true, data: [] });
    }
    const serviceCode = resolveServiceCode(serviceParam);
    const dateRange = resolveRangeOrDefault(req.query);
    const roomCodes = rooms.map((room) => room.roomNumber || room.room_code).filter(Boolean);
    const occupancyMap = roomCodes.length
      ? await getOccupancyMap(roomCodes, { ...dateRange, serviceType: serviceCode })
      : new Map();

    const data = rooms.map((room) => {
      const code = room.roomNumber || room.room_code;
      const booking = code ? occupancyMap.get(code) : null;
      const status = booking ? 'Occupied' : mapRoomStatusToUI(room.status);
      return {
        ...room,
        status,
        activeBooking: booking ? {
          bookingReference: booking.bookingReference,
          startDate: booking.startDate,
          endDate: booking.endDate,
          phase: booking.phase
        } : null
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Failed to fetch team room statuses:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching room statuses' });
  }
});

router.get('/services/:service/rooms/available', async (req, res) => {
  try {
    const serviceParam = decodeParam(req.params.service);
    const rooms = await teamRepo.listRoomsByServiceType(serviceParam);
    if (!rooms || rooms.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const dateRange = buildDateRange(req.query);
    if (!dateRange) {
      return res.status(400).json({ success: false, message: 'Invalid or missing date/time range' });
    }

    const serviceCode = resolveServiceCode(serviceParam);
    const roomCodes = rooms.map((room) => room.roomNumber || room.room_code).filter(Boolean);
    const occupancyMap = roomCodes.length
      ? await getOccupancyMap(roomCodes, { ...dateRange, serviceType: serviceCode })
      : new Map();

    const enrichedRooms = rooms.map((room) => {
      const code = room.roomNumber || room.room_code;
      const booking = code ? occupancyMap.get(code) : null;
      const status = booking ? 'Occupied' : mapRoomStatusToUI(room.status);
      return {
        ...room,
        status,
        available: status === 'Available',
        activeBooking: booking ? {
          bookingReference: booking.bookingReference,
          startDate: booking.startDate,
          endDate: booking.endDate,
          phase: booking.phase
        } : null
      };
    });

    res.json({ success: true, data: enrichedRooms });
  } catch (error) {
    console.error('❌ Failed to fetch available team rooms:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching rooms' });
  }
});

router.get('/services/:service/rooms/:roomCode/availability', async (req, res) => {
  try {
    const serviceParam = decodeParam(req.params.service);
    const roomCode = decodeParam(req.params.roomCode);
    if (!roomCode) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }
    const dateRange = buildDateRange(req.query);
    if (!dateRange) {
      return res.status(400).json({ success: false, message: 'Invalid or missing date/time range' });
    }

    const serviceCode = resolveServiceCode(serviceParam);
    const occupancyMap = await getOccupancyMap([roomCode], { ...dateRange, serviceType: serviceCode });
    const booking = occupancyMap.get(roomCode);
    res.json({ success: true, available: !booking });
  } catch (error) {
    console.error('❌ Failed to check specific team room availability:', error);
    res.status(500).json({ success: false, message: 'Server error while checking room availability' });
  }
});

// Chuyển sang đọc metadata từ PostgreSQL qua repository, không dùng Mongo models nữa
router.post('/bookings', auth, async (req, res) => {
  try {
    const {
      serviceType,
      teamServiceId,
      teamRoomId,
      durationPackageId,
      startDate,
      endDate,
      startTime,
      endTime,
      customHours,
      paymentMethod,
      paymentInfo
    } = req.body;

    if (!serviceType || !teamServiceId || !teamRoomId || !durationPackageId || !startDate) {
      return res.status(400).json({ success: false, message: 'Missing required booking information' });
    }

    const teamService = await teamRepo.getServiceByType(serviceType);
    if (!teamService) return res.status(404).json({ success: false, message: 'Team service not found' });

    const now = new Date();
    const bookingDate = new Date(startDate);
    const diffDays = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const minAdvanceDays = teamService.min_advance_days || (teamService.minimumBookingAdvance === '1 week' ? 7 : 1);
    if (diffDays < minAdvanceDays) {
      return res.status(400).json({ success: false, message: `Minimum booking advance is ${teamService.minimumBookingAdvance}` });
    }

    const durationPackage = await teamRepo.getPackageById(durationPackageId);
    if (!durationPackage) return res.status(404).json({ success: false, message: 'Duration package not found' });

    const discountPercentage = durationPackage.discountPct
      ?? durationPackage.discount?.percentage
      ?? durationPackage.discount_percentage
      ?? 0;

    let basePrice = durationPackage.price;
    if (durationPackage.isCustom && customHours) {
      basePrice = (durationPackage.pricePerUnit || durationPackage.price || 0) * customHours;
    }

    const finalPrice = Math.round(basePrice * (1 - (discountPercentage / 100)));
    const room = await teamRepo.getRoomById(teamRoomId);
    if (!room) return res.status(404).json({ success: false, message: 'Team room not found' });

    const user = await userRepo.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const created = await bookingRepo.create({
      userId: user.id || req.user.userId,
      userEmail: user.email,
      userFullName: user.fullName || user.full_name,
      serviceType: teamRepo.normalizeServiceType(serviceType),
      packageDuration: durationPackage.duration.unit,
      packageId: durationPackage.id,
      packageName: durationPackage.name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      seatId: room.roomNumber,
      seatName: room.name || 'Team Room',
      floor: room.floor || 1,
      basePrice,
      discountPercentage,
      finalPrice,
      quantity: req.body.quantity ?? 1,
      specialRequests: req.body.specialRequests || ''
    });

    if (created.conflict) {
      return res.status(400).json({ success: false, message: 'Room is not available for the selected date and time' });
    }

    const booking = created.booking;

    try {
      await paymentRepo.ensurePendingPayment({
        bookingId: booking.id,
        amount: booking.final_price || booking.finalPrice || finalPrice,
        currency: 'VND',
        paymentMethod: paymentInfo?.method || paymentMethod || 'bank-transfer',
        description: paymentInfo?.description || `Pending payment for booking ${booking.bookingReference || booking.booking_reference}`,
        userId: user.id || req.user.userId,
        userEmail: user.email,
        userFullName: user.fullName || user.full_name,
        username: user.username,
        providerMeta: {
          serviceCategory: 'team',
          serviceType: booking.serviceType || booking.service_type,
          roomCode: booking.seatCode || booking.seat_code,
          durationPackageId,
          customHours: customHours || null,
          requestedStart: startDate,
          requestedEnd: endDate || startDate,
          paymentSource: 'team-booking'
        }
      });
    } catch (paymentError) {
      console.error('⚠️ Failed to create pending payment for team booking:', paymentError);
    }

    let emailSent = false;
    try {
      const emailPayload = {
        bookingReference: booking.bookingReference || booking.booking_reference,
        serviceType: booking.serviceType || booking.service_type,
        packageDuration: booking.packageDuration || booking.package_duration || durationPackage.duration?.unit,
        startDate: booking.start_time || booking.startDate,
        endDate: booking.end_time || booking.endDate,
        seatName: booking.seat_name || room.name,
        totalAmount: booking.final_price || booking.finalPrice
      };
      const result = await emailService.sendPendingPaymentNotification(
        user.email,
        emailPayload,
        { fullName: user.fullName || user.full_name, email: user.email }
      );
      emailSent = result?.success;
    } catch (emailError) {
      console.error('⚠️ Không thể gửi email pending cho team booking:', emailError);
    }

    res.status(201).json({ success: true, message: 'Team booking created successfully', data: booking, emailSent });
  } catch (error) {
    console.error('❌ Server error while creating team booking:', error);
    res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
});

router.get('/bookings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { bookings, total } = await bookingRepo.listForUser(
      req.user.userId || req.user.id,
      { status, skip: (page - 1) * limit, limit: parseInt(limit, 10) }
    );
    const filtered = bookings.filter((b) => {
      const type = b.service_type || b.serviceType;
      return type && TEAM_SERVICE_TYPES.has(type);
    });
    res.json({
      success: true,
      data: filtered,
      pagination: { current: parseInt(page, 10), pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('❌ Server error while fetching team bookings:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
  }
});

router.get('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await bookingRepo.findByIdForUser(req.params.id, req.user.userId || req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Team booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Server error while fetching team booking detail:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching booking' });
  }
});

router.patch('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const canceled = await bookingRepo.cancel(req.params.id, req.user.userId || req.user.id);
    if (!canceled) return res.status(404).json({ success: false, message: 'Team booking not found' });
    if (canceled.alreadyCancelled) return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    if (canceled.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
    res.json({ success: true, message: 'Booking cancelled successfully', data: canceled });
  } catch (error) {
    console.error('❌ Server error while cancelling team booking:', error);
    res.status(500).json({ success: false, message: 'Server error while cancelling booking' });
  }
});

module.exports = router;
