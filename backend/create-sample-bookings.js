const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

// Connect to MongoDB using the same connection string as backend
mongoose.connect('mongodb://swspace_user:userpassword@swspace-mongodb:27017/swspace?authSource=swspace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createSampleBookings = async () => {
  try {
    console.log('Creating sample bookings...');

    // Create a sample user first if doesn't exist
    let sampleUser = await User.findOne({ email: 'test@example.com' });
    if (!sampleUser) {
      sampleUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123', // In real app, this would be hashed
        fullName: 'Test User'
      });
      await sampleUser.save();
      console.log('Sample user created');
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Create sample bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sampleBookings = [
      {
        userId: sampleUser._id,
        userEmail: sampleUser.email,
        userFullName: sampleUser.fullName,
        serviceType: 'hot-desk',
        packageDuration: 'daily',
        startDate: today,
        endDate: tomorrow,
        startTime: '09:00',
        endTime: '18:00',
        seatId: 'A2',
        seatName: 'A2',
        floor: 1,
        basePrice: 78333,
        discountPercentage: 0,
        finalPrice: 78333,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        userId: sampleUser._id,
        userEmail: sampleUser.email,
        userFullName: sampleUser.fullName,
        serviceType: 'hot-desk',
        packageDuration: 'daily',
        startDate: today,
        endDate: tomorrow,
        startTime: '09:00',
        endTime: '18:00',
        seatId: 'A6',
        seatName: 'A6',
        floor: 1,
        basePrice: 78333,
        discountPercentage: 0,
        finalPrice: 78333,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        userId: sampleUser._id,
        userEmail: sampleUser.email,
        userFullName: sampleUser.fullName,
        serviceType: 'hot-desk',
        packageDuration: 'daily',
        startDate: today,
        endDate: tomorrow,
        startTime: '09:00',
        endTime: '18:00',
        seatId: 'B1',
        seatName: 'B1',
        floor: 1,
        basePrice: 78333,
        discountPercentage: 0,
        finalPrice: 78333,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        userId: sampleUser._id,
        userEmail: sampleUser.email,
        userFullName: sampleUser.fullName,
        serviceType: 'fixed-desk',
        packageDuration: 'weekly',
        startDate: today,
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '08:00',
        endTime: '20:00',
        seatId: 'A1-F',
        seatName: 'A1',
        floor: 1,
        basePrice: 737500,
        discountPercentage: 5,
        finalPrice: 700625,
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        userId: sampleUser._id,
        userEmail: sampleUser.email,
        userFullName: sampleUser.fullName,
        serviceType: 'fixed-desk',
        packageDuration: 'daily',
        startDate: today,
        endDate: tomorrow,
        startTime: '09:00',
        endTime: '17:00',
        seatId: 'A4-F',
        seatName: 'A4',
        floor: 1,
        basePrice: 98333,
        discountPercentage: 0,
        finalPrice: 98333,
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    ];

    for (const bookingData of sampleBookings) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(`Created booking: ${booking.bookingReference} for seat ${booking.seatName}`);
    }

    console.log('Sample bookings created successfully!');
    console.log(`Total bookings: ${sampleBookings.length}`);

  } catch (error) {
    console.error('Error creating sample bookings:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleBookings();
