const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const emailService = require('../services/emailService');
const qrService = require('../services/qrService');

const router = express.Router();

// Helper function to calculate package pricing
const calculatePackagePricing = (serviceType, packageDuration) => {
  const basePrices = {
    'hot-desk': {
      'daily': 78333,
      'weekly': 587500,
      'monthly': 2350000,
      'yearly': 28200000
    },
    'fixed-desk': {
      'daily': 98333,
      'weekly': 737500,
      'monthly': 2950000,
      'yearly': 35400000
    }
  };

  const discounts = {
    'daily': 0,
    'weekly': 5,
    'monthly': 10,
    'yearly': 15
  };

  const basePrice = basePrices[serviceType]?.[packageDuration] || 0;
  const discountPercentage = discounts[packageDuration] || 0;
  const finalPrice = basePrice * (1 - discountPercentage / 100);

  return {
    basePrice,
    discountPercentage,
    finalPrice: Math.round(finalPrice)
  };
};

// Helper function to calculate end date based on package duration
const calculateEndDate = (startDate, packageDuration, startTime) => {
  const start = new Date(startDate);
  const endDate = new Date(start);
  
  switch (packageDuration) {
    case 'daily':
      endDate.setDate(start.getDate() + 1);
      break;
    case 'weekly':
      endDate.setDate(start.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(start.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(start.getFullYear() + 1);
      break;
    default:
      endDate.setDate(start.getDate() + 1);
  }
  
  return endDate;
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      serviceType,
      packageDuration,
      startDate,
      startTime,
      seatId,
      seatName,
      floor,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!serviceType || !packageDuration || !startDate || !startTime || !seatId || !seatName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Get user information
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate end date and time
    const endDate = calculateEndDate(startDate, packageDuration, startTime);
    const endTime = startTime; // For simplicity, using same time

    // Calculate pricing
    const pricing = calculatePackagePricing(serviceType, packageDuration);

    // Create booking object
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

    const booking = new Booking(bookingData);

    // Check for seat conflicts
    const hasConflict = await booking.hasConflict();
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Selected seat is not available for the chosen time period'
      });
    }

    // Save booking
    await booking.save();

    // Generate QR Code and send booking confirmation email with QR
    try {
      console.log('📧 Generating QR code and sending booking confirmation email...');
      
      // Create QR data
      const qrData = {
        bookingId: booking._id.toString(),
        bookingReference: booking.bookingReference,
        serviceType: booking.serviceType,
        userFullName: user.fullName,
        startDate: booking.startDate,
        startTime: booking.startTime,
        seatName: booking.seatName,
        timestamp: new Date().toISOString()
      };
      
      const QRCode = require('qrcode');
      const fs = require('fs');
      const path = require('path');
      
      // Generate QR code image
      const qrString = JSON.stringify(qrData);
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Save QR code to temp file
      const tempDir = '/tmp';
      const qrFileName = `qr-${booking.bookingReference}.png`;
      const qrFilePath = path.join(tempDir, qrFileName);
      
      const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(qrFilePath, buffer);
      
      console.log('✅ QR code generated successfully');
      
      // Send email with QR attachment
      const emailResult = await emailService.sendQRBookingConfirmation(
        user.email,
        {
          bookingReference: booking.bookingReference,
          serviceType: booking.serviceType,
          packageDuration: booking.packageDuration,
          startDate: booking.startDate,
          startTime: booking.startTime,
          endDate: booking.endDate,
          seatName: booking.seatName,
          totalAmount: booking.finalPrice,
          userFullName: user.fullName
        },
        qrFilePath
      );

      if (emailResult.success) {
        console.log('✅ QR booking email sent successfully');
        
        // Clean up temp file
        try {
          fs.unlinkSync(qrFilePath);
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup temp QR file:', cleanupError.message);
        }
      } else {
        console.error('❌ Failed to send QR email:', emailResult.error);
        // Fallback to regular email
        const fallbackResult = await emailService.sendBookingConfirmation(
          user.email,
          {
            bookingReference: booking.bookingReference,
            serviceType: booking.serviceType,
            packageDuration: booking.packageDuration,
            startDate: booking.startDate,
            startTime: booking.startTime,
            seatName: booking.seatName,
            totalAmount: booking.finalPrice
          },
          {
            fullName: user.fullName,
            email: user.email
          }
        );
      }
      
    } catch (emailError) {
      console.error('❌ QR email generation error:', emailError);
      
      // Fallback to regular email
      try {
        const fallbackResult = await emailService.sendBookingConfirmation(
          user.email,
          {
            bookingReference: booking.bookingReference,
            serviceType: booking.serviceType,
            packageDuration: booking.packageDuration,
            startDate: booking.startDate,
            startTime: booking.startTime,
            seatName: booking.seatName,
            totalAmount: booking.finalPrice
          },
          {
            fullName: user.fullName,
            email: user.email
          }
        );
      } catch (fallbackError) {
        console.error('❌ Fallback email also failed:', fallbackError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        serviceType: booking.serviceType,
        packageDuration: booking.packageDuration,
        startDate: booking.startDate,
        endDate: booking.endDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        seatName: booking.seatName,
        floor: booking.floor,
        finalPrice: booking.finalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      },
      emailSent: true // Indicate email was attempted
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking',
      error: error.message
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { userId: req.user.userId };
    if (status) {
      query.status = status;
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting bookings',
      error: error.message
    });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting booking',
      error: error.message
    });
  }
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { specialRequests } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow updates for pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booking that is not pending'
      });
    }

    // Update allowed fields
    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking',
      error: error.message
    });
  }
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow cancellation for pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking with current status'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by user';

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking',
      error: error.message
    });
  }
});

// @desc    Permanently delete booking
// @route   DELETE /api/bookings/:id/permanent
// @access  Private
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow permanent deletion for cancelled bookings or pending bookings
    if (!['pending', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete booking with current status. Please cancel first.'
      });
    }

    // Permanently delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Booking ${booking.bookingReference} permanently deleted by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Booking permanently deleted successfully',
      deletedBookingReference: booking.bookingReference
    });

  } catch (error) {
    console.error('Permanent delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting booking',
      error: error.message
    });
  }
});

// @desc    Confirm booking payment
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private
router.post('/:id/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm payment for non-pending booking'
      });
    }

    // Update payment information
    booking.paymentStatus = 'paid';
    booking.paymentMethod = paymentMethod || 'credit-card';
    booking.transactionId = transactionId;
    booking.status = 'confirmed';

    await booking.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      booking
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error confirming payment',
      error: error.message
    });
  }
});

// @desc    Get available seats
// @route   GET /api/bookings/seats/available
// @access  Private
router.get('/seats/available', auth, async (req, res) => {
  try {
    const { serviceType, startDate, endDate } = req.query;

    if (!serviceType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Service type, start date, and end date are required'
      });
    }

    const availableSeats = await Booking.findAvailableSeats(
      new Date(startDate),
      new Date(endDate),
      serviceType
    );

    res.json({
      success: true,
      seats: availableSeats
    });

  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting available seats',
      error: error.message
    });
  }
});

// @desc    Get occupied seats for specific date and time
// @route   GET /api/bookings/seats/occupied
// @access  Private
router.get('/seats/occupied', auth, async (req, res) => {
  try {
    const { serviceType, date, startTime, endTime } = req.query;
    
    if (!serviceType || !date) {
      return res.status(400).json({ 
        success: false,
        message: 'Service type and date are required' 
      });
    }

    // Parse the date and create start/end datetime
    const targetDate = new Date(date);
    let startDateTime = new Date(targetDate);
    let endDateTime = new Date(targetDate);
    
    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    if (endTime) {
      const [hours, minutes] = endTime.split(':');
      endDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // If no end time, check for the entire day
      endDateTime.setHours(23, 59, 59, 999);
    }

    const bookings = await Booking.find({
      serviceType,
      status: { $in: ['confirmed', 'paid'] },
      $or: [
        // Booking starts during the target time
        {
          startDate: { $gte: startDateTime, $lte: endDateTime }
        },
        // Booking ends during the target time
        {
          endDate: { $gte: startDateTime, $lte: endDateTime }
        },
        // Booking spans the entire target time
        {
          startDate: { $lte: startDateTime },
          endDate: { $gte: endDateTime }
        }
      ]
    }).select('seatId seatName startDate endDate bookingReference floor');

    const occupiedSeats = bookings.map(booking => ({
      seatId: booking.seatId,
      seatName: booking.seatName,
      floor: booking.floor,
      bookingReference: booking.bookingReference,
      startDate: booking.startDate,
      endDate: booking.endDate
    }));

    res.json({
      success: true,
      date,
      serviceType,
      startTime,
      endTime,
      occupiedSeats,
      count: occupiedSeats.length
    });
  } catch (error) {
    console.error('Error getting occupied seats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error getting occupied seats',
      error: error.message
    });
  }
});

// @desc    Test email service
// @route   POST /api/bookings/test-email
// @access  Private
router.post('/test-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Test email connection
    const connectionTest = await emailService.testConnection();
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Email service connection failed',
        error: connectionTest.error
      });
    }

    // Send test email
    const testResult = await emailService.sendTestEmail(user.email);
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        recipient: user.email,
        messageId: testResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: testResult.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error testing email',
      error: error.message
    });
  }
});

module.exports = router;
