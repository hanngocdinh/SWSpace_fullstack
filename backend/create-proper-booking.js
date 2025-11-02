const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

const mongoUri = 'mongodb://swspace_user:userpassword@localhost:27018/swspace?authSource=swspace';

async function createProperBooking() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find the demo user
    const user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      console.error('Demo user not found!');
      return;
    }

    console.log('Found user:', user.email, user.fullName);

    // Helper function to calculate package pricing
    const calculatePackagePricing = (serviceType, packageDuration) => {
      const basePrices = {
        'hot-desk': {
          'daily': 78333,
          'weekly': 587500,
          'monthly': 2350000,
          'yearly': 28200000
        },
        'fixed-desk': {
          'daily': 98333,
          'weekly': 737500,
          'monthly': 2950000,
          'yearly': 35400000
        }
      };

      const discounts = {
        'daily': 0,
        'weekly': 5,
        'monthly': 10,
        'yearly': 15
      };

      const basePrice = basePrices[serviceType]?.[packageDuration] || 0;
      const discountPercentage = discounts[packageDuration] || 0;
      const finalPrice = basePrice * (1 - discountPercentage / 100);

      return {
        basePrice,
        discountPercentage,
        finalPrice: Math.round(finalPrice)
      };
    };

    // Create booking data
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 1); // Daily booking for 1 day

    const pricing = calculatePackagePricing('hot-desk', 'daily');

    const bookingData = {
      userId: user._id,
      userEmail: user.email,
      userFullName: user.fullName,
      serviceType: 'hot-desk',
      packageDuration: 'daily',
      startDate: startDate,
      endDate: endDate,
      startTime: '09:00',
      endTime: '18:00',
      seatId: 'A3',
      seatName: 'A3',
      floor: 1,
      basePrice: pricing.basePrice,
      discountPercentage: pricing.discountPercentage,
      finalPrice: pricing.finalPrice,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Test booking for debugging'
    };

    console.log('Creating booking with data:', bookingData);

    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking created successfully!');
    console.log('Booking ID:', booking._id);
    console.log('Booking Reference:', booking.bookingReference);
    console.log('Seat:', booking.seatName);
    console.log('Service Type:', booking.serviceType);
    console.log('Package:', booking.packageDuration);
    console.log('Status:', booking.status);
    console.log('Payment Status:', booking.paymentStatus);

    // Verify the booking
    const verifyBooking = await Booking.findById(booking._id);
    console.log('\n📋 Verification:');
    console.log('Found booking:', !!verifyBooking);
    console.log('User Email:', verifyBooking.userEmail);
    console.log('Seat ID:', verifyBooking.seatId);
    console.log('Start Date:', verifyBooking.startDate);
    console.log('End Date:', verifyBooking.endDate);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating booking:', error);
    process.exit(1);
  }
}

createProperBooking();
