const express = require('express');
const auth = require('../middleware/auth');
// Chuyển sang đọc metadata từ PostgreSQL qua repository, không dùng Mongo models nữa
const teamRepo = require('../repositories/teamServicesRepository');
const { getBookingRepository } = require('../repositories/bookingRepository');
const { getUserRepository } = require('../repositories/userRepository');

const router = express.Router();

router.get('/services', async (req, res) => {
  try {
    const services = await teamRepo.listActiveServices();
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching team services' });
  }
});

router.get('/services/:serviceType/packages', async (req, res) => {
  try {
    const packages = await teamRepo.listPackagesByServiceType(req.params.serviceType);
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching duration packages' });
  }
});

// Public status endpoint for user UI to render disabled/occupied buttons in real-time
router.get('/services/:serviceType/rooms/status', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const rooms = await teamRepo.listRoomsStatusByServiceType(serviceType);
    const toUI = (s) => (s === 'available' ? 'Available' : (s === 'disabled' ? 'Maintenance' : 'Occupied'));
    const data = rooms.map(r => ({ roomCode: r.roomNumber, status: toUI(r.status), capacity: r.capacity, floor: r.floor }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching room statuses' });
  }
});

router.get('/services/:serviceType/rooms/available', async (req, res) => {
  try {
    const { serviceType } = req.params; const { startDate, endDate } = req.query;
    const allRooms = await teamRepo.listRoomsByServiceType(serviceType);
    const bookingRepo = getBookingRepository();
    const start = new Date(startDate); const end = new Date(endDate || startDate);
    const occupied = await bookingRepo.findOccupiedSeats({ serviceType: teamRepo.normalizeServiceType(serviceType), startDateTime: start, endDateTime: end });
    const busy = new Set(occupied.map(o => o.seatId)); // seatId = room_code
    const availableRooms = allRooms.filter(room => !busy.has(room.roomNumber));
    res.json({ success: true, data: availableRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching available rooms' });
  }
});

// Hard availability check before navigating to payment
// Blocks when admin has marked a room as Occupied/Maintenance or when there is a booking conflict.
router.get('/services/:serviceType/rooms/:roomCode/availability', async (req, res) => {
  try {
    const { serviceType, roomCode } = req.params;
    const { startDate, endDate, startTime, endTime } = req.query;
    const svc = await teamRepo.getServiceByType(serviceType);
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });

    // Find this room by code within service
    const allRooms = await teamRepo.listRoomsStatusByServiceType(serviceType);
    const room = allRooms.find(r => String(r.roomNumber) === String(roomCode));
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // Status gate
    if (room.status === 'disabled') {
      return res.json({ success: true, available: false, reason: 'maintenance' });
    }
    if (room.status === 'occupied' || room.status === 'reserved') {
      return res.json({ success: true, available: false, reason: 'occupied' });
    }

    // Booking conflict gate
    const bookingRepo = getBookingRepository();
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);
    const conflicts = await bookingRepo.findOccupiedSeats({
      serviceType: teamRepo.normalizeServiceType(serviceType),
      startDateTime: start,
      endDateTime: end
    });
    const hasConflict = conflicts.some(c => String(c.seatId) === String(roomCode));
    if (hasConflict) return res.json({ success: true, available: false, reason: 'occupied' });

    return res.json({ success: true, available: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while checking availability' });
  }
});

router.post('/bookings', auth, async (req, res) => {
  try {
    const { serviceType, teamServiceId, teamRoomId, durationPackageId, startDate, endDate, startTime, endTime, customHours } = req.body;
    if (!serviceType || !teamServiceId || !teamRoomId || !durationPackageId || !startDate) return res.status(400).json({ success: false, message: 'Missing required booking information' });
    const teamService = await teamRepo.getServiceByType(serviceType);
    if (!teamService) return res.status(404).json({ success: false, message: 'Team service not found' });
    const now = new Date(); const bookingDate = new Date(startDate); const diffDays = Math.ceil((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const minAdvanceDays = teamService.min_advance_days || (teamService.minimumBookingAdvance === '1 week' ? 7 : 1);
    if (diffDays < minAdvanceDays) return res.status(400).json({ success: false, message: `Minimum booking advance is ${teamService.minimumBookingAdvance}` });
    const durationPackage = await teamRepo.getPackageById(durationPackageId);
    if (!durationPackage) return res.status(404).json({ success: false, message: 'Duration package not found' });
    let finalPrice = durationPackage.price;
    if (durationPackage.isCustom && customHours) finalPrice = durationPackage.pricePerUnit * customHours;
    const room = await teamRepo.getRoomById(teamRoomId);
    if (!room) return res.status(404).json({ success: false, message: 'Team room not found' });
    const bookingRepo = getBookingRepository();
    const userRepo = getUserRepository();
    const user = await userRepo.findById(req.user.userId || req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const created = await bookingRepo.create({
      userId: user.id || req.user.userId,
      userEmail: user.email,
      userFullName: user.fullName || user.full_name,
      serviceType: teamRepo.normalizeServiceType(serviceType),
      packageDuration: durationPackage.duration.unit,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      seatId: room.roomNumber,
      seatName: room.name || 'Team Room',
      floor: room.floor || 1,
      basePrice: durationPackage.price,
      discountPercentage: (durationPackage.discount && durationPackage.discount.percentage) || 0,
      finalPrice,
      specialRequests: req.body.specialRequests || ''
    });
    if (created.conflict) return res.status(400).json({ success: false, message: 'Room is not available for the selected date and time' });
    res.status(201).json({ success: true, message: 'Team booking created successfully', data: created.booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
});

router.get('/bookings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const bookingRepo = getBookingRepository();
    const { bookings, total } = await bookingRepo.listForUser(req.user.userId || req.user.id, { status, skip: (page - 1) * limit, limit: parseInt(limit) });
    // filter chỉ lấy team services theo serviceType
    const teamTypes = new Set(['Private Office','Meeting Room','Networking Space']);
    const filtered = bookings.filter(b => (b.service_type || b.serviceType) && teamTypes.has((b.service_type || b.serviceType)));
    res.json({ success: true, data: filtered, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching bookings' });
  }
});

router.get('/bookings/:id', auth, async (req, res) => {
  try {
    const bookingRepo = getBookingRepository();
    const booking = await bookingRepo.findByIdForUser(req.params.id, req.user.userId || req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Team booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching booking' });
  }
});

router.patch('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const bookingRepo = getBookingRepository();
    const canceled = await bookingRepo.cancel(req.params.id, req.user.userId || req.user.id);
    if (!canceled) return res.status(404).json({ success: false, message: 'Team booking not found' });
    if (canceled.alreadyCancelled) return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    if (canceled.invalidStatus) return res.status(400).json({ success: false, message: 'Cannot cancel completed booking' });
    res.json({ success: true, message: 'Booking cancelled successfully', data: canceled });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while cancelling booking' });
  }
});

module.exports = router;
