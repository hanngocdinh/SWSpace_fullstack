const express = require('express');
const authMw = require('../middleware/auth');
const qrService = require('../services/qrService');
const qrImageService = require('../services/qrImageService');
const { uploadQRImage, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Generate QR for a booking
router.post('/generate/:bookingId', authMw, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const qrResult = await qrService.generateQRCode(bookingId, userId);
    res.json({ success: true, message: 'QR code generated successfully', ...qrResult });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to generate QR code' });
  }
});

// Verify QR (public)
router.post('/verify', async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ success: false, message: 'QR code is required' });
    const verification = await qrService.verifyQRCode(qrCode);
    if (!verification.valid) return res.status(400).json({ success: false, message: verification.message });
    res.json({ success: true, message: 'QR code is valid', booking: verification.booking, qrData: verification.qrData, alreadyCheckedIn: verification.alreadyCheckedIn, activeCheckIn: verification.activeCheckIn });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error verifying QR code' });
  }
});

// Process check-in (public)
router.post('/checkin', async (req, res) => {
  try {
    const { qrCode, deviceInfo, location } = req.body;
    if (!qrCode) return res.status(400).json({ success: false, message: 'QR code is required' });
    const fullDeviceInfo = { ...deviceInfo, userAgent: req.headers['user-agent'], ipAddress: req.ip || req.connection.remoteAddress };
    const result = await qrService.processCheckIn(qrCode, fullDeviceInfo, location);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error processing check-in' });
  }
});

// Process check-out (private)
router.post('/checkout', authMw, async (req, res) => {
  try {
    const { bookingId, notes, rating } = req.body;
    const userId = req.user.userId;
    if (!bookingId) return res.status(400).json({ success: false, message: 'Booking ID is required' });
    const result = await qrService.processCheckOut(bookingId, userId, notes, rating);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error processing check-out' });
  }
});

// Check-in status (private)
router.get('/status/:bookingId', authMw, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const status = await qrService.getCheckInStatus(bookingId, userId);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting check-in status' });
  }
});

// Attendance history (private)
router.get('/attendance', authMw, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, skip = 0 } = req.query;
    const history = await qrService.getAttendanceHistory(userId, parseInt(limit), parseInt(skip));
    res.json({ success: true, ...history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting attendance history' });
  }
});

// Get QR for booking (private)
router.get('/booking/:bookingId', authMw, async (req, res) => {
  try {
    const { bookingId } = req.params; const userId = req.user.userId;
    const qrResult = await qrService.generateQRCode(bookingId, userId);
    res.json({ success: true, message: 'QR code retrieved successfully', ...qrResult });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to get QR code' });
  }
});

// Daily attendance stats (admin)
router.get('/stats/daily/:date', authMw, authMw.requireAdmin, async (req, res) => {
  try {
    // Simple PG-based daily stats using the view created in migration 05
    const { getPgPool } = require('../../config/pg');
    const pool = getPgPool();
    const day = new Date(req.params.date);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const { rows } = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE status='checked-in') AS active_checkins,
              COUNT(*) FILTER (WHERE status='checked-out') AS completed_checkouts
       FROM qr_checkins WHERE check_in_at >= $1 AND check_in_at < $2`,
      [dayStart, dayEnd]
    );
    res.json({ success: true, date: req.params.date, stats: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting daily stats' });
  }
});

// Generate QR image for email (private)
router.post('/generate-image/:bookingId', authMw, async (req, res) => {
  try {
    const qrResult = await qrService.generateQRCode(req.params.bookingId, req.user.userId);
    if (!qrResult.success && !qrResult.qrCode) return res.status(400).json({ success: false, message: qrResult.message });
    const imageResult = await qrImageService.generateQRImage(qrResult.qrCode.qrString, qrResult.booking);
    if (imageResult.success) {
      res.json({ success: true, qrCode: qrResult.qrCode, booking: qrResult.booking, image: { filename: imageResult.filename, size: imageResult.size } });
    } else {
      res.status(500).json({ success: false, message: imageResult.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while generating QR image' });
  }
});

// Upload QR image and extract/verify (public)
router.post('/upload', (req, res) => {
  uploadQRImage(req, res, async (err) => {
    if (err) return handleUploadError(err, req, res);
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });
      const extractResult = await qrImageService.extractQRFromImage(req.file.path);
      if (extractResult.success && extractResult.qrString) {
        const verifyResult = await qrService.verifyQRCode(extractResult.qrString);
        res.json({ success: true, message: 'QR code extracted and verified successfully', qrString: extractResult.qrString, verification: verifyResult, uploadedFile: { filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype } });
      } else {
        res.status(400).json({ success: false, message: 'Could not extract QR code from image. Please ensure the image contains a valid QR code.', details: extractResult.message || extractResult.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error while processing uploaded QR image' });
    }
  });
});

// Upload QR image and process check-in (public)
router.post('/upload-checkin', (req, res) => {
  uploadQRImage(req, res, async (err) => {
    if (err) return handleUploadError(err, req, res);
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded' });
      const extractResult = await qrImageService.extractQRFromImage(req.file.path);
      if (!extractResult.success || !extractResult.qrString) {
        return res.status(400).json({ success: false, message: 'Could not extract QR code from image', details: extractResult.message || extractResult.error });
      }
      const deviceInfo = { platform: req.headers['user-agent'] || 'Unknown', uploadMethod: 'image-upload', filename: req.file.filename, fileSize: req.file.size };
      const checkInResult = await qrService.processCheckIn(extractResult.qrString, deviceInfo, req.body.location ? JSON.parse(req.body.location) : null);
      res.json({ success: checkInResult.success, message: checkInResult.message, booking: checkInResult.booking, checkIn: checkInResult.checkIn, uploadInfo: { filename: req.file.filename, size: req.file.size } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error while processing uploaded QR image' });
    }
  });
});

// Generate QR and send email after booking completion
router.post('/email/:bookingId', authMw, async (req, res) => {
  try {
    const { userEmail, userData } = req.body || {};
    if (!userEmail) return res.status(400).json({ success: false, message: 'User email is required' });
    const result = await qrService.generateAndEmailQR(req.params.bookingId, req.user.userId, userEmail, userData || { fullName: req.user.fullName || 'Valued Customer' });
    if (result.success) {
      res.json({ success: true, message: result.emailSent ? 'QR code generated and email sent successfully' : 'QR code generated but email failed', qrCode: result.qrCode, booking: result.booking, emailSent: result.emailSent, emailInfo: result.emailInfo, image: result.image });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while generating QR and sending email' });
  }
});

module.exports = router;
