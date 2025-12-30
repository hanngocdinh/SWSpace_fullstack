#!/usr/bin/env node
// Migrated from backend_user/clear-bookings.js with base URL updated to unified backend port.
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const USERNAME = process.env.TEST_USERNAME || 'nhathuy';
const PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function clearAllBookings() {
  console.log('🗑️  Clearing all bookings for user', USERNAME, '...\n');
  try {
    console.log('🔑 Step 1: Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, { username: USERNAME, password: PASSWORD });
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log('\n📋 Step 2: Getting all bookings...');
    const bookingsResponse = await axios.get(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
    const bookings = bookingsResponse.data.bookings || [];
    console.log(`📊 Found ${bookings.length} bookings`);
    for (const booking of bookings) {
      if (booking.status !== 'cancelled') {
        console.log(`🗑️  Cancelling booking: ${booking.bookingReference} (${booking.seatName})`);
        try {
          await axios.patch(`${API_BASE}/bookings/${booking._id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
          console.log(`✅ Cancelled: ${booking.bookingReference}`);
        } catch (cancelError) {
          console.error(`❌ Failed to cancel ${booking.bookingReference}:`, cancelError.response?.data?.message || cancelError.message);
        }
      } else {
        console.log(`⏭️  Skipping already cancelled booking: ${booking.bookingReference}`);
      }
    }
    console.log('\n🎉 All bookings processed!');
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data.message || error.response.statusText, 'Status:', error.response.status);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

if (require.main === module) clearAllBookings();
module.exports = clearAllBookings;
