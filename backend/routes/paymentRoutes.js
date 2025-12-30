const express = require('express');
const auth = require('../userapi/middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, paymentController.createPayment);                    // Create payment for booking
router.get('/my-payments', auth, paymentController.getUserPayments);        // Get user's payments

// Admin routes (require admin authentication) - put specific routes before /:id
router.get('/stats', auth, paymentController.getPaymentStats);              // Get payment statistics (admin)  
router.get('/admin', auth, paymentController.getAllPayments);               // Get all payments (admin)
router.put('/:id/status', auth, paymentController.updatePaymentStatus);     // Update payment status (admin)

// Get specific payment (must be last to avoid conflicts)
router.get('/:id', auth, paymentController.getPaymentById);                 // Get specific payment

module.exports = router;