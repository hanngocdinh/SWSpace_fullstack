const express = require('express');
const qrService = require('../services/qrService');
const qrImageService = require('../services/qrImageService');
const auth = require('../middleware/auth');
const { uploadQRImage, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// @desc    Generate QR code for booking
// @route   POST /api/qr/generate/:bookingId
// @access  Private
router.post('/generate/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    console.log(`🔄 Generating QR code for booking ${bookingId}`);

    const qrResult = await qrService.generateQRCode(bookingId, userId);

    res.json({
      success: true,
      message: 'QR code generated successfully',
      ...qrResult
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate QR code'
    });
  }
});

// @desc    Verify QR code
// @route   POST /api/qr/verify
// @access  Public (anyone can scan QR)
router.post('/verify', async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    console.log(`🔍 Verifying QR code: ${qrCode}`);

    const verification = await qrService.verifyQRCode(qrCode);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    res.json({
      success: true,
      message: 'QR code is valid',
      booking: verification.booking,
      qrData: verification.qrData,
      alreadyCheckedIn: verification.alreadyCheckedIn,
      activeCheckIn: verification.activeCheckIn
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying QR code'
    });
  }
});

// @desc    Process check-in with QR code
// @route   POST /api/qr/checkin
// @access  Public
router.post('/checkin', async (req, res) => {
  try {
    const { qrCode, deviceInfo, location } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required'
      });
    }

    console.log(`✅ Processing check-in with QR: ${qrCode}`);

    // Add request info to device info
    const fullDeviceInfo = {
      ...deviceInfo,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const result = await qrService.processCheckIn(qrCode, fullDeviceInfo, location);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing check-in'
    });
  }
});

// @desc    Process check-out
// @route   POST /api/qr/checkout
// @access  Private
router.post('/checkout', auth, async (req, res) => {
  try {
    const { bookingId, notes, rating } = req.body;
    const userId = req.user.userId;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }

    console.log(`🚪 Processing check-out for booking ${bookingId}`);

    const result = await qrService.processCheckOut(bookingId, userId, notes, rating);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing check-out'
    });
  }
});

// @desc    Get check-in status for booking
// @route   GET /api/qr/status/:bookingId
// @access  Private
router.get('/status/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    console.log(`📊 Getting check-in status for booking ${bookingId}`);

    const status = await qrService.getCheckInStatus(bookingId, userId);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting check-in status'
    });
  }
});

// @desc    Get attendance history
// @route   GET /api/qr/attendance
// @access  Private
router.get('/attendance', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, skip = 0 } = req.query;

    console.log(`📈 Getting attendance history for user ${userId}`);

    const history = await qrService.getAttendanceHistory(
      userId, 
      parseInt(limit), 
      parseInt(skip)
    );

    res.json({
      success: true,
      ...history
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting attendance history'
    });
  }
});

// @desc    Get QR code for existing booking
// @route   GET /api/qr/booking/:bookingId
// @access  Private
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    console.log(`🔍 Getting QR code for booking ${bookingId}`);

    // Try to get existing QR or generate new one
    const qrResult = await qrService.generateQRCode(bookingId, userId);

    res.json({
      success: true,
      message: 'QR code retrieved successfully',
      ...qrResult
    });
  } catch (error) {
    console.error('Get QR error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get QR code'
    });
  }
});

// @desc    Get daily attendance stats (Admin only)
// @route   GET /api/qr/stats/daily/:date
// @access  Private (Admin)
router.get('/stats/daily/:date', auth, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    const { date } = req.params;

    console.log(`📊 Getting daily attendance stats for ${date}`);

    const CheckIn = require('../models/CheckIn');
    const stats = await CheckIn.getDailyAttendance(date);

    res.json({
      success: true,
      date,
      stats
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting daily stats'
    });
  }
});

// @desc    Generate QR image for email
// @route   POST /api/qr/generate-image/:bookingId
// @access  Private
router.post('/generate-image/:bookingId', auth, async (req, res) => {
  try {
    console.log('🎨 Generating QR image for booking:', req.params.bookingId);

    // Get QR code first
    const qrResult = await qrService.generateQRCode(req.params.bookingId, req.user.userId);
    
    if (!qrResult.success) {
      return res.status(400).json({
        success: false,
        message: qrResult.message
      });
    }

    // Generate branded image
    const imageResult = await qrImageService.generateQRImage(
      qrResult.qrCode.qrString,
      qrResult.booking
    );

    if (imageResult.success) {
      res.json({
        success: true,
        qrCode: qrResult.qrCode,
        booking: qrResult.booking,
        image: {
          filename: imageResult.filename,
          size: imageResult.size
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: imageResult.error
      });
    }
  } catch (error) {
    console.error('💥 Generate QR image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating QR image'
    });
  }
});

// @desc    Upload QR image for check-in
// @route   POST /api/qr/upload
// @access  Public (no auth needed for check-in)
router.post('/upload', (req, res) => {
  uploadQRImage(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }

      console.log('📷 Processing uploaded QR image:', req.file.filename);

      // Extract QR code from image
      const extractResult = await qrImageService.extractQRFromImage(req.file.path);

      if (extractResult.success && extractResult.qrString) {
        // Verify the extracted QR code
        const verifyResult = await qrService.verifyQRCode(extractResult.qrString);
        
        res.json({
          success: true,
          message: 'QR code extracted and verified successfully',
          qrString: extractResult.qrString,
          verification: verifyResult,
          uploadedFile: {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Could not extract QR code from image. Please ensure the image contains a valid QR code.',
          details: extractResult.message || extractResult.error
        });
      }
    } catch (error) {
      console.error('💥 QR upload processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing uploaded QR image'
      });
    }
  });
});

// @desc    Verify uploaded QR and process check-in
// @route   POST /api/qr/upload-checkin
// @access  Public
router.post('/upload-checkin', (req, res) => {
  uploadQRImage(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res);
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded'
        });
      }

      console.log('🔍 Processing QR check-in from uploaded image:', req.file.filename);

      // Extract QR code from image
      const extractResult = await qrImageService.extractQRFromImage(req.file.path);

      if (!extractResult.success || !extractResult.qrString) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract QR code from image',
          details: extractResult.message || extractResult.error
        });
      }

      // Process check-in with extracted QR
      const deviceInfo = {
        platform: req.headers['user-agent'] || 'Unknown',
        uploadMethod: 'image-upload',
        filename: req.file.filename,
        fileSize: req.file.size
      };

      const checkInResult = await qrService.processCheckIn(
        extractResult.qrString,
        deviceInfo,
        req.body.location ? JSON.parse(req.body.location) : null
      );

      res.json({
        success: checkInResult.success,
        message: checkInResult.message,
        booking: checkInResult.booking,
        checkIn: checkInResult.checkIn,
        uploadInfo: {
          filename: req.file.filename,
          extractedQR: extractResult.qrString
        }
      });

    } catch (error) {
      console.error('💥 Upload check-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing check-in from uploaded image'
      });
    }
  });
});

// @desc    Generate QR and send email after booking completion
// @route   POST /api/qr/email/:bookingId
// @access  Private
router.post('/email/:bookingId', auth, async (req, res) => {
  try {
    console.log('📧 Processing QR email for booking:', req.params.bookingId);

    const { userEmail, userData } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const result = await qrService.generateAndEmailQR(
      req.params.bookingId,
      req.user.userId,
      userEmail,
      userData || { fullName: req.user.name || 'Valued Customer' }
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.emailSent ? 'QR code generated and email sent successfully' : 'QR code generated but email failed',
        qrCode: result.qrCode,
        booking: result.booking,
        emailSent: result.emailSent,
        emailInfo: result.emailInfo,
        image: result.image
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('💥 QR email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating QR and sending email'
    });
  }
});

module.exports = router;
