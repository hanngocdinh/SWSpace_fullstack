const Payment = require('../models/paymentModel');

class PaymentRepository {
  async createPayment(paymentData) {
    return Payment.create(paymentData);
  }

  async ensurePendingPayment(paymentData) {
    const existing = await Payment.findLatestByBooking(paymentData.bookingId);
    if (existing && existing.isActionable()) {
      return existing;
    }
    return Payment.create(paymentData);
  }

  async getPaymentById(paymentId) {
    return Payment.findById(paymentId);
  }

  async getByBookingId(bookingId) {
    return Payment.findLatestByBooking(bookingId);
  }

  async getAllPayments(options = {}) {
    return Payment.findAll(options);
  }

  async updatePaymentStatus(paymentId, status) {
    return Payment.updateStatus(paymentId, status);
  }

  async getPaymentStats() {
    return Payment.getStats();
  }
}

let paymentRepository = null;

function getPaymentRepository() {
  if (!paymentRepository) {
    paymentRepository = new PaymentRepository();
  }
  return paymentRepository;
}

module.exports = {
  getPaymentRepository,
  PaymentRepository
};
