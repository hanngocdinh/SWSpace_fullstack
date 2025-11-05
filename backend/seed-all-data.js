const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const TeamService = require('./models/TeamService');
const DurationPackage = require('./models/DurationPackage');
const TeamRoom = require('./models/TeamRoom');
const PaymentMethod = require('./models/PaymentMethod');
const Booking = require('./models/Booking');

const seedAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all existing data
    await User.deleteMany({});
    await TeamService.deleteMany({});
    await DurationPackage.deleteMany({});
    await TeamRoom.deleteMany({});
    await PaymentMethod.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️ Cleared all existing data');

    // 1. Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'hanne',
        email: 'hanne@example.com',
        password: hashedPassword,
        fullName: 'Hanne Nguyen',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'john',
        email: 'john@example.com',
        password: hashedPassword,
        fullName: 'John Smith',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@swspace.com',
        password: hashedPassword,
        fullName: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Users created successfully');

    // 2. Seed Team Services
    const teamServices = [
      {
        name: 'Private Office',
        description: 'Dedicated private office space for teams that need privacy and focus.',
        image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png',
        features: ['Private space', 'Air conditioning', 'High-speed Wi-Fi', 'Printing access', 'Meeting room access'],
        capacity: { min: 1, max: 10 },
        minimumBookingAdvance: '1 week'
      },
      {
        name: 'Meeting Room',
        description: 'Professional meeting rooms equipped with modern facilities for team meetings.',
        image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000185/Screenshot_2025-10-09_155610_izpoax.png',
        features: ['Projector', 'Whiteboard', 'Air conditioning', 'High-speed Wi-Fi', 'Video conferencing'],
        capacity: { min: 2, max: 20 },
        minimumBookingAdvance: '1 day'
      },
      {
        name: 'Networking Space',
        description: 'Open collaborative space perfect for networking events and team activities.',
        image: 'https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000266/Screenshot_2025-10-09_155732_dzzhgv.png',
        features: ['Open layout', 'Event setup', 'Sound system', 'Catering support', 'Flexible seating'],
        capacity: { min: 10, max: 50 },
        minimumBookingAdvance: '1 day'
      }
    ];

    const createdServices = await TeamService.insertMany(teamServices);
    console.log('🏢 Team services created successfully');

    // 3. Seed Duration Packages
    const durationPackages = [
      // Private Office Packages (3 months, 6 months, 1 year)
      { serviceType: 'Private Office', name: '3 Months Package', duration: { value: 3, unit: 'months' }, price: 30000000, discount: { percentage: 0 } },
      { serviceType: 'Private Office', name: '6 Months Package', duration: { value: 6, unit: 'months' }, price: 54000000, discount: { percentage: 10 } },
      { serviceType: 'Private Office', name: '1 Year Package', duration: { value: 1, unit: 'years' }, price: 96000000, discount: { percentage: 20 } },

      // Meeting Room Packages (3 hours, 5 hours, custom hourly 200k/hour)
      { serviceType: 'Meeting Room', name: '3 Hours Package', duration: { value: 3, unit: 'hours' }, price: 600000, discount: { percentage: 0 } },
      { serviceType: 'Meeting Room', name: '5 Hours Package', duration: { value: 5, unit: 'hours' }, price: 900000, discount: { percentage: 10 } },
      { serviceType: 'Meeting Room', name: 'Custom Hourly', duration: { value: 1, unit: 'hours' }, price: 200000, discount: { percentage: 0 }, isCustom: true, pricePerUnit: 200000 },

      // Networking Space Packages (3 hours = 3M, 1 day with discount)
      { serviceType: 'Networking Space', name: '3 Hours Package', duration: { value: 3, unit: 'hours' }, price: 3000000, discount: { percentage: 0 } },
      { serviceType: 'Networking Space', name: '1 Day Package', duration: { value: 1, unit: 'days' }, price: 7200000, discount: { percentage: 10 } }
    ];

    await DurationPackage.insertMany(durationPackages);
    console.log('📦 Duration packages created successfully');

    // 4. Seed Team Rooms
    const teamRooms = [
      // Private Offices
      { 
        name: 'Private Office A1', 
        serviceType: 'Private Office', 
        roomNumber: 'A101',
        floor: 1,
        capacity: 5, 
        area: 25,
        amenities: [
          { name: 'Air Conditioning', description: 'Climate control', icon: 'ac' },
          { name: 'High-speed WiFi', description: 'Fiber internet', icon: 'wifi' },
          { name: 'Printer Access', description: 'Shared printer', icon: 'printer' }
        ]
      },
      { 
        name: 'Private Office A2', 
        serviceType: 'Private Office', 
        roomNumber: 'A102',
        floor: 1,
        capacity: 8, 
        area: 40,
        amenities: [
          { name: 'Air Conditioning', description: 'Climate control', icon: 'ac' },
          { name: 'High-speed WiFi', description: 'Fiber internet', icon: 'wifi' },
          { name: 'Printer Access', description: 'Shared printer', icon: 'printer' },
          { name: 'Projector', description: 'HD projector', icon: 'projector' }
        ]
      },

      // Meeting Rooms
      { 
        name: 'Meeting Room B1', 
        serviceType: 'Meeting Room', 
        roomNumber: 'B201',
        floor: 2,
        capacity: 10, 
        area: 30,
        amenities: [
          { name: 'Projector', description: 'HD projector', icon: 'projector' },
          { name: 'Whiteboard', description: 'Large whiteboard', icon: 'whiteboard' },
          { name: 'Air Conditioning', description: 'Climate control', icon: 'ac' },
          { name: 'High-speed WiFi', description: 'Fiber internet', icon: 'wifi' }
        ]
      },
      { 
        name: 'Meeting Room B2', 
        serviceType: 'Meeting Room', 
        roomNumber: 'B202',
        floor: 2,
        capacity: 15, 
        area: 45,
        amenities: [
          { name: 'Projector', description: 'HD projector', icon: 'projector' },
          { name: 'Whiteboard', description: 'Large whiteboard', icon: 'whiteboard' },
          { name: 'Air Conditioning', description: 'Climate control', icon: 'ac' },
          { name: 'High-speed WiFi', description: 'Fiber internet', icon: 'wifi' },
          { name: 'Video Conferencing', description: 'Zoom/Teams setup', icon: 'video' }
        ]
      },
      { 
        name: 'Meeting Room B3', 
        serviceType: 'Meeting Room', 
        roomNumber: 'B203',
        floor: 2,
        capacity: 20, 
        area: 60,
        amenities: [
          { name: 'Projector', description: 'HD projector', icon: 'projector' },
          { name: 'Whiteboard', description: 'Large whiteboard', icon: 'whiteboard' },
          { name: 'Air Conditioning', description: 'Climate control', icon: 'ac' },
          { name: 'High-speed WiFi', description: 'Fiber internet', icon: 'wifi' },
          { name: 'Video Conferencing', description: 'Zoom/Teams setup', icon: 'video' }
        ]
      },

      // Networking Spaces
      { 
        name: 'Networking Space C1', 
        serviceType: 'Networking Space', 
        roomNumber: 'C301',
        floor: 3,
        capacity: 50, 
        area: 150,
        amenities: [
          { name: 'Sound System', description: 'Professional audio', icon: 'sound' },
          { name: 'Event Setup', description: 'Flexible furniture', icon: 'setup' },
          { name: 'Catering Support', description: 'Kitchen access', icon: 'catering' }
        ]
      }
    ];

    await TeamRoom.insertMany(teamRooms);
    console.log('🏠 Team rooms created successfully');

    // 5. Seed Payment Methods for users
    const hanneUser = createdUsers.find(u => u.username === 'hanne');
    const johnUser = createdUsers.find(u => u.username === 'john');

    const paymentMethods = [
      {
        userId: hanneUser._id,
        type: 'credit-card',
        displayName: 'Visa ending in 1234',
        cardNumber: '1234',
        cardHolderName: 'Hanne Nguyen',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        isActive: true
      },
      {
        userId: hanneUser._id,
        type: 'bank-transfer',
        displayName: 'My Bank Account',
        bankName: 'Vietcombank',
        bankAccountNumber: '123456789',
        accountHolderName: 'Hanne Nguyen',
        isDefault: false,
        isActive: true
      },
      {
        userId: johnUser._id,
        type: 'credit-card',
        displayName: 'Mastercard ending in 5678',
        cardNumber: '5678',
        cardHolderName: 'John Smith',
        expiryMonth: 6,
        expiryYear: 2026,
        isDefault: true,
        isActive: true
      }
    ];

    await PaymentMethod.insertMany(paymentMethods);
    console.log('💳 Payment methods created successfully');

    console.log('🎉 All data seeded successfully!');
    
    // Print summary
    const counts = {
      users: await User.countDocuments(),
      teamServices: await TeamService.countDocuments(),
      durationPackages: await DurationPackage.countDocuments(),
      teamRooms: await TeamRoom.countDocuments(),
      paymentMethods: await PaymentMethod.countDocuments()
    };
    
    console.log('📊 Data summary:');
    Object.entries(counts).forEach(([collection, count]) => {
      console.log(`  ${collection}: ${count} documents`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAllData();