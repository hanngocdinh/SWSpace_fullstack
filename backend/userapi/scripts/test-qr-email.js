#!/usr/bin/env node
// Migrated from backend_user/test-qr-email.js with unified backend base URL.
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const USERNAME = process.env.TEST_USERNAME || 'nhathuy';
const PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function testQRBooking() {
  console.log('🧪 Testing QR Email Generation...\n');
  try {
    console.log('🔑 Step 1: Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, { username: USERNAME, password: PASSWORD });
    if (!loginResponse.data.success) { console.error('❌ Login failed:', loginResponse.data.message); return; }
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('👤 User:', loginResponse.data.user.username);
    console.log('📧 Email:', loginResponse.data.user.email);

    console.log('\n📝 Step 2: Creating booking...');
    const bookingData = { serviceType: 'hot-desk', packageDuration: 'daily', startDate: new Date().toISOString().substring(0,10), startTime: '10:00', seatId: 'B5', seatName: 'B5', floor: 1, specialRequests: 'QR Test Booking' };
    const bookingResponse = await axios.post(`${API_BASE}/bookings`, bookingData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (bookingResponse.data.success) {
      console.log('✅ Booking created successfully!');
      console.log('📋 Booking Reference:', bookingResponse.data.booking.bookingReference);
      console.log('🪑 Seat:', bookingResponse.data.booking.seatName);
      console.log('💰 Amount:', bookingResponse.data.booking.finalPrice);
      console.log('\n🎯 Check your email for QR code!');
      console.log('📧 Email should be sent to:', loginResponse.data.user.email);
    } else {
      console.error('❌ Booking failed:', bookingResponse.data.message);
    }
  } catch (error) {
    if (error.response) { console.error('❌ API Error:', error.response.data.message || error.response.statusText, 'Status:', error.response.status); }
    else { console.error('❌ Network Error:', error.message); }
  }
}

if (require.main === module) testQRBooking();
module.exports = testQRBooking;
