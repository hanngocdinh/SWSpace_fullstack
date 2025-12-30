const express = require('express');
const auth = require('../middleware/auth');
const { getPaymentMethodRepository } = require('../repositories/paymentMethodRepository');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const repo = getPaymentMethodRepository();
    const paymentMethods = await repo.listForUser(req.user.userId);
    res.json({ success: true, paymentMethods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting payment methods', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const repo = getPaymentMethodRepository();
    const paymentMethod = await repo.create(req.user.userId, req.body || {});
    res.status(201).json({ success: true, message: 'Payment method added successfully', paymentMethod });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Server error adding payment method' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const repo = getPaymentMethodRepository();
    const paymentMethod = await repo.update(req.user.userId, req.params.id, req.body || {});
    if (!paymentMethod) return res.status(404).json({ success: false, message: 'Payment method not found' });
    res.json({ success: true, message: 'Payment method updated successfully', paymentMethod });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Server error updating payment method' });
  }
});

router.put('/:id/set-default', auth, async (req, res) => {
  try {
    const repo = getPaymentMethodRepository();
    const paymentMethod = await repo.setDefault(req.user.userId, req.params.id);
    if (!paymentMethod) return res.status(404).json({ success: false, message: 'Payment method not found' });
    res.json({ success: true, message: 'Default payment method updated successfully', paymentMethod });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error setting default payment method', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const repo = getPaymentMethodRepository();
    const ok = await repo.softDelete(req.user.userId, req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Payment method not found' });
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting payment method', error: error.message });
  }
});

router.get('/types', auth, async (req, res) => {
  try {
    const paymentTypes = {
      'credit-card': { label: 'Credit Card', fields: ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'], icon: 'credit-card' },
      'debit-card': { label: 'Debit Card', fields: ['cardHolderName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'], icon: 'credit-card' },
      'bank-transfer': { label: 'Bank Transfer', fields: ['bankName', 'accountHolderName', 'accountNumber'], icon: 'university' },
      'momo': { label: 'MoMo E-Wallet', fields: ['phoneNumber'], icon: 'mobile-alt' },
      'zalopay': { label: 'ZaloPay', fields: ['phoneNumber'], icon: 'mobile-alt' },
      'vnpay': { label: 'VNPay', fields: ['phoneNumber'], icon: 'mobile-alt' },
      'paypal': { label: 'PayPal', fields: ['paypalEmail'], icon: 'paypal' }
    };
    res.json({ success: true, paymentTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error getting payment types', error: error.message });
  }
});

module.exports = router;
