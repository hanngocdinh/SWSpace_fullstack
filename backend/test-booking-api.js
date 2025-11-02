const fs = require('fs');

// Script để tạo booking qua API
async function createBookingViaAPI() {
  try {
    console.log('🔐 Logging in first...');
    
    // Step 1: Login to get token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'demo',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData.user.username);
    console.log('Token:', loginData.token.substring(0, 20) + '...');

    // Step 2: Create booking
    console.log('\n📝 Creating booking...');
    const bookingData = {
      serviceType: 'hot-desk',
      packageDuration: 'daily', 
      startDate: '2025-10-27',
      startTime: '09:00',
      seatId: 'C1',
      seatName: 'C1',
      floor: 1,
      specialRequests: 'Test booking via API'
    };

    console.log('Booking data:', bookingData);

    const bookingResponse = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    const bookingResult = await bookingResponse.json();
    
    if (bookingResponse.ok) {
      console.log('✅ Booking created successfully!');
      console.log('Booking ID:', bookingResult.booking.id);
      console.log('Reference:', bookingResult.booking.bookingReference);
      console.log('Seat:', bookingResult.booking.seatName);
      console.log('Price:', bookingResult.booking.finalPrice);
      
      // Step 3: Test occupied seats API
      console.log('\n🔍 Testing occupied seats API...');
      const occupiedResponse = await fetch(`http://localhost:3001/api/bookings/seats/occupied?serviceType=hot-desk&date=2025-10-27`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (occupiedResponse.ok) {
        const occupiedData = await occupiedResponse.json();
        console.log('✅ Occupied seats API response:');
        console.log('Count:', occupiedData.count);
        console.log('Occupied seats:', occupiedData.occupiedSeats);
      } else {
        console.error('❌ Failed to fetch occupied seats');
      }

    } else {
      console.error('❌ Booking creation failed:', bookingResult);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Check if running with Node.js fetch (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install node-fetch', { stdio: 'inherit', cwd: __dirname });
    global.fetch = require('node-fetch');
  } catch (error) {
    console.error('Failed to install node-fetch. Please run: npm install node-fetch');
    process.exit(1);
  }
}

createBookingViaAPI();
