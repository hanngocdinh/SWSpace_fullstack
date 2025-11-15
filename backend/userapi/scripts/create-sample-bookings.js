#!/usr/bin/env node
/**
 * Create sample bookings and a sample user if needed.
 * Migrated to unified backend. Uses ../models and MONGODB_URI.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swspace';
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    let sampleUser = await User.findOne({ email: 'test@example.com' });
    if (!sampleUser) {
      sampleUser = new User({ username: 'testuser', email: 'test@example.com', password: 'hashedpassword123', fullName: 'Test User' });
      await sampleUser.save();
      console.log('👤 Sample user created');
    }

    await Booking.deleteMany({});
    console.log('🧹 Cleared existing bookings');

    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24*60*60*1000);

    const sampleBookings = [
      { userId: sampleUser._id, userEmail: sampleUser.email, userFullName: sampleUser.fullName, serviceType: 'hot-desk', packageDuration: 'daily', startDate: today, endDate: tomorrow, startTime: '09:00', endTime: '18:00', seatId: 'A2', seatName: 'A2', floor: 1, basePrice: 78333, discountPercentage: 0, finalPrice: 78333, status: 'confirmed', paymentStatus: 'paid' },
      { userId: sampleUser._id, userEmail: sampleUser.email, userFullName: sampleUser.fullName, serviceType: 'hot-desk', packageDuration: 'daily', startDate: today, endDate: tomorrow, startTime: '09:00', endTime: '18:00', seatId: 'A6', seatName: 'A6', floor: 1, basePrice: 78333, discountPercentage: 0, finalPrice: 78333, status: 'confirmed', paymentStatus: 'paid' },
      { userId: sampleUser._id, userEmail: sampleUser.email, userFullName: sampleUser.fullName, serviceType: 'hot-desk', packageDuration: 'daily', startDate: today, endDate: tomorrow, startTime: '09:00', endTime: '18:00', seatId: 'B1', seatName: 'B1', floor: 1, basePrice: 78333, discountPercentage: 0, finalPrice: 78333, status: 'confirmed', paymentStatus: 'paid' },
      { userId: sampleUser._id, userEmail: sampleUser.email, userFullName: sampleUser.fullName, serviceType: 'fixed-desk', packageDuration: 'weekly', startDate: today, endDate: new Date(today.getTime() + 7*24*60*60*1000), startTime: '08:00', endTime: '20:00', seatId: 'A1-F', seatName: 'A1', floor: 1, basePrice: 737500, discountPercentage: 5, finalPrice: 700625, status: 'confirmed', paymentStatus: 'paid' },
      { userId: sampleUser._id, userEmail: sampleUser.email, userFullName: sampleUser.fullName, serviceType: 'fixed-desk', packageDuration: 'daily', startDate: today, endDate: tomorrow, startTime: '09:00', endTime: '17:00', seatId: 'A4-F', seatName: 'A4', floor: 1, basePrice: 98333, discountPercentage: 0, finalPrice: 98333, status: 'confirmed', paymentStatus: 'paid' }
    ];

    for (const data of sampleBookings) {
      const booking = new Booking(data);
      await booking.save();
      console.log(`✅ Created booking ${booking.bookingReference} for seat ${booking.seatName}`);
    }

    console.log(`🎉 Sample bookings created: ${sampleBookings.length}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}
if (require.main === module) main();
module.exports = main;
