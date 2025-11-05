const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const TeamService = require('../models/TeamService');
const DurationPackage = require('../models/DurationPackage');
const TeamRoom = require('../models/TeamRoom');
const Booking = require('../models/Booking');

// Get all team services
router.get('/services', async (req, res) => {
  try {
    const services = await TeamService.find({ isActive: true })
      .select('name description image features capacity minimumBookingAdvance');
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching team services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team services'
    });
  }
});

// Get duration packages by service type
router.get('/services/:serviceType/packages', async (req, res) => {
  try {
    const { serviceType } = req.params;
    
    const packages = await DurationPackage.find({ 
      serviceType, 
      isActive: true 
    }).sort({ price: 1 });
    
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching duration packages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching duration packages'
    });
  }
});

// Get available rooms by service type and date
router.get('/services/:serviceType/rooms/available', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { startDate, endDate, startTime, endTime } = req.query;

    // Get all rooms for this service type
    const allRooms = await TeamRoom.find({ 
      serviceType, 
      isActive: true 
    });

    // Check for existing bookings
    const existingBookings = await Booking.find({
      serviceType,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    }).populate('teamRoomId');

    // Filter out booked rooms
    const bookedRoomIds = existingBookings.map(booking => 
      booking.teamRoomId ? booking.teamRoomId._id.toString() : null
    ).filter(Boolean);

    const availableRooms = allRooms.filter(room => 
      !bookedRoomIds.includes(room._id.toString())
    );

    res.json({
      success: true,
      data: availableRooms
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available rooms'
    });
  }
});

// Create team booking
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
      customHours
    } = req.body;

    // Validate required fields
    if (!serviceType || !teamServiceId || !teamRoomId || !durationPackageId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Validate minimum booking advance
    const teamService = await TeamService.findById(teamServiceId);
    if (!teamService) {
      return res.status(404).json({
        success: false,
        message: 'Team service not found'
      });
    }

    const now = new Date();
    const bookingDate = new Date(startDate);
    const diffTime = bookingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const minAdvanceDays = teamService.minimumBookingAdvance === '1 week' ? 7 : 1;
    if (diffDays < minAdvanceDays) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking advance is ${teamService.minimumBookingAdvance}`
      });
    }

    // Get duration package and calculate price
    const durationPackage = await DurationPackage.findById(durationPackageId);
    if (!durationPackage) {
      return res.status(404).json({
        success: false,
        message: 'Duration package not found'
      });
    }

    let finalPrice = durationPackage.price;
    
    // For custom packages (Meeting Room custom hours)
    if (durationPackage.isCustom && customHours) {
      finalPrice = durationPackage.pricePerUnit * customHours;
    }

    // Check room availability
    const existingBooking = await Booking.findOne({
      teamRoomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate || startDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected date and time'
      });
    }

    // Generate booking reference
    const bookingReference = `TEAM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      userEmail: req.user.email,
      userFullName: req.user.fullName,
      serviceType,
      isTeamService: true,
      teamServiceId,
      teamRoomId,
      durationPackageId,
      packageDuration: durationPackage.duration.unit,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      seatId: teamRoomId, // Use room ID as seat ID for team bookings
      seatName: `Team Room`, // Will be populated with actual room name
      floor: 1, // Will be updated with actual floor
      basePrice: durationPackage.price,
      discountPercentage: durationPackage.discount.percentage,
      finalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      bookingReference,
      additionalServices: [],
      specialRequests: req.body.specialRequests || '',
      customDuration: customHours || null
    });

    await booking.save();

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('teamServiceId')
      .populate('teamRoomId')
      .populate('durationPackageId');

    res.status(201).json({
      success: true,
      message: 'Team booking created successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Error creating team booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
});

// Get team booking history for user
router.get('/bookings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { 
      userId: req.user._id,
      isTeamService: true
    };
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('teamServiceId')
      .populate('teamRoomId')
      .populate('durationPackageId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching team bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
});

// Get single team booking
router.get('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isTeamService: true
    })
      .populate('teamServiceId')
      .populate('teamRoomId')
      .populate('durationPackageId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Team booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching team booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
});

// Cancel team booking
router.patch('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isTeamService: true
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Team booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling team booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
});

module.exports = router;