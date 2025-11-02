#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');
  
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://admin:adminpassword@localhost:27018/swspace?authSource=admin';
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const Booking = require('./models/Booking');
    const QRCode = require('./models/QRCode');
    const CheckIn = require('./models/CheckIn');
    
    // Clear all bookings
    console.log('\n📋 Clearing all bookings...');
    const bookingResult = await Booking.deleteMany({});
    console.log(`✅ Deleted ${bookingResult.deletedCount} bookings`);
    
    // Clear all QR codes
    console.log('\n📱 Clearing all QR codes...');
    const qrResult = await QRCode.deleteMany({});
    console.log(`✅ Deleted ${qrResult.deletedCount} QR codes`);
    
    // Clear all check-ins
    console.log('\n✅ Clearing all check-ins...');
    const checkinResult = await CheckIn.deleteMany({});
    console.log(`✅ Deleted ${checkinResult.deletedCount} check-ins`);
    
    console.log('\n🎉 Database cleared successfully!');
    console.log('✨ All seats are now available for booking');
    
  } catch (error) {
    console.error('❌ Database clear failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run cleanup
clearDatabase();
