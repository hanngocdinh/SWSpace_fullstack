require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { getPaymentRepository } = require('../repositories/paymentRepository');

(async () => {
  try {
    const repo = getPaymentRepository();
    const pendingPayments = await repo.getAllPayments({ bookingStatus: 'pending', limit: 20, offset: 0 });
    console.log('Pending payments count:', pendingPayments.length);
    if (pendingPayments[0]) {
      console.log('Sample pending payment:', pendingPayments[0]);
    }
    const stats = await repo.getPaymentStats();
    console.log('Stats result:', stats);
  } catch (error) {
    console.error('Debug script error:', error);
  } finally {
    process.exit();
  }
})();
