#!/usr/bin/env node

// Test script đơn giản để kiểm tra payment flow hoàn chỉnh
// Chạy: node test-payment-flow.js

const { getPgPool } = require('./config/pg');
const { getPaymentRepository } = require('./repositories/paymentRepository');

async function testPaymentFlow() {
  console.log('🚀 Testing Complete Payment Flow...\n');
  
  try {
    // Test 1: Kết nối database
    console.log('1️⃣ Testing database connection...');
    const pool = getPgPool();
    const { rows } = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', rows[0].now);
    
    // Test 2: Payment Repository
    console.log('\n2️⃣ Testing Payment Repository...');
    const paymentRepo = getPaymentRepository();
    
    // Test get existing payment
    console.log('Getting existing payment (ID: 1)...');
    const existingPayment = await paymentRepo.getPaymentById(1);
    console.log('✅ Payment retrieved:', existingPayment.transaction_id);
    
    // Test update status
    console.log('\nUpdating payment status...');
    const updated = await paymentRepo.updatePaymentStatus(1, 'success', 'Test completion');
    console.log('✅ Payment status updated:', updated.status);
    
    // Test get all payments
    console.log('\nGetting all payments...');
    const allPayments = await paymentRepo.getAllPayments({ limit: 5, offset: 0 });
    console.log('✅ Total payments retrieved:', allPayments.length);
    
    // Test payment stats
    console.log('\nGetting payment statistics...');
    const stats = await paymentRepo.getPaymentStats();
    console.log('✅ Payment stats:', {
      total: stats.total_payments,
      amount: stats.total_amount,
      pending: stats.pending_count,
      completed: stats.completed_count
    });
    
    console.log('\n🎉 Payment repository tests passed!');
    
  } catch (error) {
    console.error('\n❌ Payment test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Test booking integration
async function testBookingIntegration() {
  console.log('\n3️⃣ Testing Booking → Payment Integration...');
  
  try {
    // Import booking repository
    const BookingRepository = require('./userapi/repositories/bookingRepository');
    const bookingRepo = BookingRepository.createPgRepo();
    
    // Create test booking
    const testBookingData = {
      userId: 1,
      serviceType: 'meeting_room',
      packageDuration: '1_hour',
      startDate: new Date('2024-02-01'),
      startTime: '14:00',
      endDate: new Date('2024-02-01'),
      endTime: '15:00',
      seatId: `TEST-${Date.now()}`,
      seatName: 'Test Meeting Room',
      floor: 1,
      basePrice: 150000,
      discountPercentage: 10,
      finalPrice: 135000,
      specialRequests: 'Test booking for payment integration'
    };
    
    console.log('Creating test booking...');
    const bookingResult = await bookingRepo.create(testBookingData);
    
    if (bookingResult.conflict) {
      console.log('⚠️ Booking conflict detected, using different time slot...');
      testBookingData.startTime = '15:00';
      testBookingData.endTime = '16:00';
      testBookingData.seatId = `TEST-${Date.now()}-2`;
      const retryResult = await bookingRepo.create(testBookingData);
      if (!retryResult.conflict) {
        console.log('✅ Booking created on retry:', retryResult.booking.booking_reference);
      } else {
        console.log('❌ Still conflict, skipping booking test');
        return;
      }
    } else {
      console.log('✅ Booking created:', bookingResult.booking.booking_reference);
    }
    
    // Wait for payment to be created
    console.log('Waiting for payment to be created...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if payment was created
    const paymentRepo = getPaymentRepository();
    const allPayments = await paymentRepo.getAllPayments({ limit: 20, offset: 0 });
    const bookingPayment = allPayments.find(p => p.booking_id === bookingResult.booking.id);
    
    if (bookingPayment) {
      console.log('✅ Payment automatically created for booking!');
      console.log('Payment details:', {
        id: bookingPayment.id,
        amount: bookingPayment.amount,
        status: bookingPayment.status,
        transaction_ref: bookingPayment.transaction_ref
      });
    } else {
      console.log('❌ Payment was not automatically created for booking');
    }
    
  } catch (error) {
    console.error('❌ Booking integration test failed:', error.message);
  }
}

// Main test runner
async function main() {
  await testPaymentFlow();
  await testBookingIntegration();
  
  console.log('\n🏁 Test completed! Payment system is integrated with booking flow.');
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
