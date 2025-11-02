const crypto = require('crypto');
const QRCode = require('../models/QRCode');
const CheckIn = require('../models/CheckIn');
const Booking = require('../models/Booking');
const qrImageService = require('./qrImageService');
const emailService = require('./emailService');

class QRService {
  // Generate QR code cho booking
  async generateQRCode(bookingId, userId) {
    try {
      // Check if booking exists và belongs to user
      const booking = await Booking.findOne({
        _id: bookingId,
        userId: userId
      });

      if (!booking) {
        throw new Error('Booking not found or access denied');
      }

      // Check if QR already exists
      let existingQR = await QRCode.findOne({ bookingId });
      if (existingQR && existingQR.isValid()) {
        return this.formatQRResponse(existingQR, booking);
      }

      // Deactivate existing QR if any
      if (existingQR) {
        existingQR.isActive = false;
        await existingQR.save();
      }

      // Calculate expiration (booking end time + 1 hour buffer)
      const bookingEndTime = new Date(booking.endDate);
      const expiresAt = new Date(bookingEndTime.getTime() + (60 * 60 * 1000)); // +1 hour

      // Create QR data
      const qrData = {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        seatName: booking.seatName,
        serviceType: booking.serviceType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingReference: booking.bookingReference
      };

      // Generate unique QR code và secret key
      const crypto = require('crypto');
      const timestamp = Date.now();
      const randomBytes = crypto.randomBytes(8).toString('hex');
      const qrCodeString = `SWS-${timestamp}-${randomBytes}`;
      const secretKey = crypto.randomBytes(32).toString('hex');

      // Create new QR code
      const qrCode = new QRCode({
        bookingId,
        qrCode: qrCodeString,
        qrData: JSON.stringify(qrData),
        secretKey: secretKey,
        expiresAt,
        maxUsage: 20 // Allow multiple scans for flexibility
      });

      await qrCode.save();

      return this.formatQRResponse(qrCode, booking);
    } catch (error) {
      console.error('QR Generation error:', error);
      throw error;
    }
  }

  // Verify QR code và prepare for check-in
  async verifyQRCode(qrCodeString) {
    try {
      const qrRecord = await QRCode.findValidQR(qrCodeString);
      
      if (!qrRecord) {
        return {
          valid: false,
          message: 'Invalid or expired QR code'
        };
      }

      const booking = qrRecord.bookingId;
      const qrData = JSON.parse(qrRecord.qrData);

      // Additional validations
      const now = new Date();
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Allow check-in 30 minutes before booking starts
      const checkInAllowedFrom = new Date(bookingStart.getTime() - (30 * 60 * 1000));

      if (now < checkInAllowedFrom) {
        return {
          valid: false,
          message: 'Check-in not yet available. Please try 30 minutes before your booking time.'
        };
      }

      if (now > bookingEnd) {
        return {
          valid: false,
          message: 'Booking has expired'
        };
      }

      // Check if already checked in và not checked out
      const activeCheckIn = await CheckIn.findOne({
        bookingId: booking._id,
        status: 'checked-in'
      });

      return {
        valid: true,
        qrRecord,
        booking,
        qrData,
        alreadyCheckedIn: !!activeCheckIn,
        activeCheckIn
      };
    } catch (error) {
      console.error('QR Verification error:', error);
      throw error;
    }
  }

  // Process check-in
  async processCheckIn(qrCodeString, deviceInfo = {}, location = {}) {
    try {
      const verification = await this.verifyQRCode(qrCodeString);
      
      if (!verification.valid) {
        return {
          success: false,
          message: verification.message
        };
      }

      const { qrRecord, booking, alreadyCheckedIn, activeCheckIn } = verification;

      if (alreadyCheckedIn) {
        return {
          success: false,
          message: 'Already checked in',
          checkIn: activeCheckIn
        };
      }

      // Create check-in record
      const checkIn = new CheckIn({
        bookingId: booking._id,
        userId: booking.userId,
        qrCodeId: qrRecord._id,
        checkInLocation: location,
        deviceInfo,
        actualSeat: booking.seatName, // Default to booked seat
        verificationMethod: 'qr-scan'
      });

      await checkIn.save();

      // Increment QR usage
      await qrRecord.incrementUsage();

      return {
        success: true,
        message: 'Check-in successful',
        checkIn: await checkIn.populate(['bookingId', 'userId']),
        booking
      };
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  // Process check-out
  async processCheckOut(bookingId, userId, notes = '', rating = null) {
    try {
      const activeCheckIn = await CheckIn.findOne({
        bookingId,
        userId,
        status: 'checked-in'
      });

      if (!activeCheckIn) {
        return {
          success: false,
          message: 'No active check-in found'
        };
      }

      await activeCheckIn.checkOut(notes, rating);

      return {
        success: true,
        message: 'Check-out successful',
        checkIn: await activeCheckIn.populate(['bookingId', 'userId'])
      };
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  }

  // Get check-in status
  async getCheckInStatus(bookingId, userId) {
    try {
      const checkIn = await CheckIn.findOne({
        bookingId,
        userId
      }).populate(['bookingId', 'qrCodeId']).sort({ createdAt: -1 });

      if (!checkIn) {
        return {
          hasCheckIn: false,
          message: 'No check-in record found'
        };
      }

      return {
        hasCheckIn: true,
        checkIn,
        isActive: checkIn.status === 'checked-in'
      };
    } catch (error) {
      console.error('Get check-in status error:', error);
      throw error;
    }
  }

  // Get attendance history
  async getAttendanceHistory(userId, limit = 10, skip = 0) {
    try {
      const checkIns = await CheckIn.find({ userId })
        .populate(['bookingId', 'qrCodeId'])
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await CheckIn.countDocuments({ userId });
      const stats = await CheckIn.getAttendanceStats(userId);

      return {
        checkIns,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        },
        stats: stats[0] || {}
      };
    } catch (error) {
      console.error('Get attendance history error:', error);
      throw error;
    }
  }

  // Helper method để format QR response
  formatQRResponse(qrRecord, booking) {
    return {
      qrCode: qrRecord.qrCode,
      qrData: JSON.parse(qrRecord.qrData),
      expiresAt: qrRecord.expiresAt,
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        seatName: booking.seatName,
        serviceType: booking.serviceType,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      },
      isValid: qrRecord.isValid(),
      usageCount: qrRecord.usageCount,
      maxUsage: qrRecord.maxUsage
    };
  }

  // Generate QR và gửi email tự động sau khi booking
  async generateAndEmailQR(bookingId, userId, userEmail, userData) {
    try {
      console.log('📧 Starting QR generation and email process for booking:', bookingId);

      // Generate QR code
      const qrResult = await this.generateQRCode(bookingId, userId);
      
      if (!qrResult.success) {
        console.error('Failed to generate QR code:', qrResult.message);
        return {
          success: false,
          message: 'Failed to generate QR code'
        };
      }

      // Generate branded QR image
      const imageResult = await qrImageService.generateQRImage(
        qrResult.qrCode.qrString,
        {
          ...qrResult.booking,
          customerName: userData.fullName || userData.name
        }
      );

      if (!imageResult.success) {
        console.error('Failed to generate QR image:', imageResult.error);
        // Still return success since QR code was generated
        return {
          success: true,
          qrCode: qrResult.qrCode,
          booking: qrResult.booking,
          emailSent: false,
          message: 'QR code generated but email failed'
        };
      }

      // Get image buffer for email attachment
      const imageBuffer = await qrImageService.getImageBuffer(imageResult.filepath);
      
      if (!imageBuffer) {
        console.error('Failed to read QR image buffer');
        return {
          success: true,
          qrCode: qrResult.qrCode,
          booking: qrResult.booking,
          emailSent: false,
          message: 'QR code generated but email attachment failed'
        };
      }

      // Prepare booking data for email
      const bookingData = {
        bookingReference: qrResult.booking._id.toString().slice(-8).toUpperCase(),
        serviceType: qrResult.booking.spaceType,
        packageDuration: qrResult.booking.duration || 'daily',
        startDate: qrResult.booking.date,
        startTime: qrResult.booking.time,
        seatName: qrResult.booking.seatName || `${qrResult.booking.spaceType} seat`,
        totalAmount: qrResult.booking.totalAmount
      };

      // Send email with QR attachment
      const emailResult = await emailService.sendBookingWithQR(
        userEmail,
        bookingData,
        userData,
        imageBuffer,
        imageResult.filename
      );

      // Cleanup temporary image file
      setTimeout(async () => {
        try {
          await qrImageService.cleanupTempFiles(0); // Immediate cleanup
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }, 5000);

      return {
        success: true,
        qrCode: qrResult.qrCode,
        booking: qrResult.booking,
        emailSent: emailResult.success,
        emailInfo: emailResult,
        image: {
          filename: imageResult.filename,
          size: imageResult.size
        }
      };

    } catch (error) {
      console.error('💥 Generate and email QR error:', error);
      return {
        success: false,
        message: error.message || 'Failed to generate QR and send email'
      };
    }
  }
}

module.exports = new QRService();
