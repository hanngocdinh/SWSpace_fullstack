#!/usr/bin/env node

const axios = require('axios');

async function clearAllBookings() {
  console.log('🗑️  Clearing all bookings for user nhathuy...\n');
  
  try {
    // 1. Login first
    console.log('🔑 Step 1: Login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'nhathuy',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    
    // 2. Get all bookings
    console.log('\n📋 Step 2: Getting all bookings...');
    const bookingsResponse = await axios.get('http://localhost:3001/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!bookingsResponse.data.bookings) {
      console.log('📭 No bookings found');
      return;
    }
    
    const bookings = bookingsResponse.data.bookings;
    console.log(`📊 Found ${bookings.length} bookings`);
    
    // 3. Cancel all active bookings
    for (const booking of bookings) {
      if (booking.status !== 'cancelled') {
        console.log(`\n🗑️  Cancelling booking: ${booking.bookingReference} (${booking.seatName})`);
        
        try {
          await axios.patch(`http://localhost:3001/api/bookings/${booking._id}/cancel`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`✅ Cancelled: ${booking.bookingReference}`);
        } catch (cancelError) {
          console.error(`❌ Failed to cancel ${booking.bookingReference}:`, 
            cancelError.response?.data?.message || cancelError.message);
        }
      } else {
        console.log(`⏭️  Skipping already cancelled booking: ${booking.bookingReference}`);
      }
    }
    
    console.log('\n🎉 All bookings processed!');
    console.log('✨ You can now create new bookings with fresh seats');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data.message || error.response.statusText);
      console.error('Status:', error.response.status);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run cleanup
clearAllBookings();
