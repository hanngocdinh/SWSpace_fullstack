const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

mongoose.connect('mongodb://swspace_user:userpassword@swspace-mongodb:27017/swspace?authSource=swspace');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database...');
    
    // Check users
    const users = await User.find({});
    console.log(`👥 Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user._id})`);
    });
    
    // Check bookings
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log(`📋 Total bookings: ${bookings.length}`);
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found in database');
    } else {
      bookings.forEach((booking, index) => {
        console.log(`\n📍 Booking ${index + 1}:`);
        console.log(`  Reference: ${booking.bookingReference}`);
        console.log(`  User ID: ${booking.userId}`);
        console.log(`  User Email: ${booking.userEmail}`);
        console.log(`  Service Type: ${booking.serviceType}`);
        console.log(`  Seat: ${booking.seatName || booking.seatId}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Start Date: ${booking.startDate}`);
        console.log(`  Created: ${booking.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabase();
