#!/usr/bin/env node

const axios = require('axios');

async function testQRBooking() {
  console.log('🧪 Testing QR Email Generation...\n');
  
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
    console.log('👤 User:', loginResponse.data.user.username);
    console.log('📧 Email:', loginResponse.data.user.email);
    
    // 2. Create booking
    console.log('\n📝 Step 2: Creating booking...');
    const bookingData = {
      serviceType: 'hot-desk',
      packageDuration: 'daily',
      startDate: '2025-10-28',
      startTime: '10:00',
      seatId: 'B5',
      seatName: 'B5',
      floor: 1,
      specialRequests: 'QR Test Booking'
    };
    
    const bookingResponse = await axios.post('http://localhost:3001/api/bookings', bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
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
    if (error.response) {
      console.error('❌ API Error:', error.response.data.message || error.response.statusText);
      console.error('Status:', error.response.status);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run test
testQRBooking();
