const express = require('express');
const PaymentMethod = require('../models/PaymentMethod');
const auth = require('../middleware/auth');

const router = express.Router();

// @desc    Get all payment methods for user
// @route   GET /api/payment-methods
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      userId: req.user.userId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment methods',
      error: error.message
    });
  }
});

// @desc    Add new payment method
// @route   POST /api/payment-methods
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const paymentMethodData = {
      ...req.body,
      userId: req.user.userId
    };

    // If this is the first payment method, make it default
    const existingCount = await PaymentMethod.countDocuments({
      userId: req.user.userId,
      isActive: true
    });

    if (existingCount === 0) {
      paymentMethodData.isDefault = true;
    }

    const paymentMethod = new PaymentMethod(paymentMethodData);
    await paymentMethod.save();

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Server error adding payment method'
    });
  }
});

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['displayName', 'isDefault'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(paymentMethod, updates);
    await paymentMethod.save();

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Server error updating payment method'
    });
  }
});

// @desc    Set default payment method
// @route   PUT /api/payment-methods/:id/set-default
// @access  Private
router.put('/:id/set-default', auth, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.json({
      success: true,
      message: 'Default payment method updated successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting default payment method',
      error: error.message
    });
  }
});

// @desc    Delete payment method (soft delete)
// @route   DELETE /api/payment-methods/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Soft delete
    paymentMethod.isActive = false;
    await paymentMethod.save();

    // If this was the default, set another one as default
    if (paymentMethod.isDefault) {
      const nextDefault = await PaymentMethod.findOne({
        userId: req.user.userId,
        isActive: true,
        _id: { $ne: paymentMethod._id }
      }).sort({ createdAt: -1 });

      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting payment method',
      error: error.message
    });
  }
});

// @desc    Get payment method types and their required fields
// @route   GET /api/payment-methods/types
// @access  Private
router.get('/types', auth, async (req, res) => {
  try {
    const paymentTypes = {
      'credit-card': {
        label: 'Credit Card',
        fields: ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'],
        icon: 'credit-card'
      },
      'debit-card': {
        label: 'Debit Card',
        fields: ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'],
        icon: 'credit-card'
      },
      'bank-transfer': {
        label: 'Bank Transfer',
        fields: ['bankName', 'accountHolderName', 'accountNumber'],
        icon: 'university'
      },
      'momo': {
        label: 'MoMo E-Wallet',
        fields: ['phoneNumber'],
        icon: 'mobile-alt'
      },
      'zalopay': {
        label: 'ZaloPay',
        fields: ['phoneNumber'],
        icon: 'mobile-alt'
      },
      'vnpay': {
        label: 'VNPay',
        fields: ['phoneNumber'],
        icon: 'mobile-alt'
      },
      'paypal': {
        label: 'PayPal',
        fields: ['paypalEmail'],
        icon: 'paypal'
      }
    };

    res.json({
      success: true,
      paymentTypes
    });
  } catch (error) {
    console.error('Get payment types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment types',
      error: error.message
    });
  }
});

module.exports = router;
