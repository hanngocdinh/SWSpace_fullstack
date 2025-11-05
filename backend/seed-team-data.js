const mongoose = require('mongoose');
require('dotenv').config();

const TeamService = require('./models/TeamService');
const DurationPackage = require('./models/DurationPackage');
const TeamRoom = require('./models/TeamRoom');

const seedTeamData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await TeamService.deleteMany({});
    await DurationPackage.deleteMany({});
    await TeamRoom.deleteMany({});
    console.log('Cleared existing team data');

    // Seed Team Services
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
    console.log('Team services created successfully');

    // Seed Duration Packages
    const durationPackages = [
      // Private Office packages
      {
        serviceType: 'Private Office',
        name: '3 Months Package',
        duration: { value: 3, unit: 'months' },
        price: 15000000, // 15 triệu
        discount: { percentage: 0, description: '' }
      },
      {
        serviceType: 'Private Office',
        name: '6 Months Package',
        duration: { value: 6, unit: 'months' },
        price: 25000000, // 25 triệu
        discount: { percentage: 17, description: 'Save 17% compared to 3-month packages' }
      },
      {
        serviceType: 'Private Office',
        name: '1 Year Package',
        duration: { value: 1, unit: 'years' },
        price: 45000000, // 45 triệu
        discount: { percentage: 25, description: 'Save 25% compared to 6-month packages' }
      },
      
      // Meeting Room packages
      {
        serviceType: 'Meeting Room',
        name: '3 Hours Package',
        duration: { value: 3, unit: 'hours' },
        price: 600000, // 600k
        discount: { percentage: 0, description: '' }
      },
      {
        serviceType: 'Meeting Room',
        name: '5 Hours Package',
        duration: { value: 5, unit: 'hours' },
        price: 900000, // 900k
        discount: { percentage: 10, description: 'Save 10% compared to hourly rate' }
      },
      {
        serviceType: 'Meeting Room',
        name: 'Custom Hours',
        duration: { value: 1, unit: 'hours' },
        price: 200000, // 200k per hour
        isCustom: true,
        pricePerUnit: 200000
      },
      
      // Networking Space packages
      {
        serviceType: 'Networking Space',
        name: '3 Hours Package',
        duration: { value: 3, unit: 'hours' },
        price: 3000000, // 3 triệu
        discount: { percentage: 0, description: '' }
      },
      {
        serviceType: 'Networking Space',
        name: 'Full Day Package',
        duration: { value: 1, unit: 'days' },
        price: 7000000, // 7 triệu
        discount: { percentage: 13, description: 'Save 13% compared to 3-hour packages' }
      }
    ];

    await DurationPackage.insertMany(durationPackages);
    console.log('Duration packages created successfully');

    // Seed Team Rooms
    const teamRooms = [
      // Private Offices
      {
        name: 'Executive Office A',
        serviceType: 'Private Office',
        roomNumber: 'PO-A-01',
        floor: 2,
        capacity: 6,
        features: ['Executive desk', 'Meeting table', 'Private bathroom', 'Balcony'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png'],
        amenities: [
          { name: 'Air Conditioning', description: 'Climate controlled environment' },
          { name: 'High-speed Wi-Fi', description: 'Fiber optic internet connection' },
          { name: 'Printing Access', description: 'Shared printer and scanner' }
        ],
        area: 40,
        coordinates: { x: 100, y: 150 }
      },
      {
        name: 'Team Office B',
        serviceType: 'Private Office',
        roomNumber: 'PO-B-01',
        floor: 2,
        capacity: 8,
        features: ['Open layout', 'Collaboration area', 'Storage space'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1759999994/Screenshot_2025-10-09_155300_kll7tl.png'],
        amenities: [
          { name: 'Air Conditioning', description: 'Climate controlled environment' },
          { name: 'High-speed Wi-Fi', description: 'Fiber optic internet connection' },
          { name: 'Printing Access', description: 'Shared printer and scanner' }
        ],
        area: 50,
        coordinates: { x: 200, y: 150 }
      },
      
      // Meeting Rooms
      {
        name: 'Conference Room Alpha',
        serviceType: 'Meeting Room',
        roomNumber: 'MR-A-01',
        floor: 1,
        capacity: 12,
        features: ['75-inch display', 'Conference phone', 'Whiteboard', 'Video conferencing'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000185/Screenshot_2025-10-09_155610_izpoax.png'],
        amenities: [
          { name: 'Projector', description: '4K resolution projector' },
          { name: 'Whiteboard', description: 'Large magnetic whiteboard' },
          { name: 'Video Conferencing', description: 'Zoom and Teams compatible' }
        ],
        area: 30,
        coordinates: { x: 50, y: 100 }
      },
      {
        name: 'Meeting Room Beta',
        serviceType: 'Meeting Room',
        roomNumber: 'MR-B-01',
        floor: 1,
        capacity: 8,
        features: ['Smart TV', 'Conference phone', 'Flipchart'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000185/Screenshot_2025-10-09_155610_izpoax.png'],
        amenities: [
          { name: 'Smart TV', description: '55-inch smart display' },
          { name: 'Conference Phone', description: 'HD audio conference system' },
          { name: 'Flipchart', description: 'Professional presentation easel' }
        ],
        area: 25,
        coordinates: { x: 150, y: 100 }
      },
      
      // Networking Spaces
      {
        name: 'Innovation Hub',
        serviceType: 'Networking Space',
        roomNumber: 'NS-H-01',
        floor: 1,
        capacity: 40,
        features: ['Modular seating', 'Sound system', 'Catering area', 'Stage area'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000266/Screenshot_2025-10-09_155732_dzzhgv.png'],
        amenities: [
          { name: 'Sound System', description: 'Professional audio setup' },
          { name: 'Catering Support', description: 'Full kitchen facilities' },
          { name: 'Flexible Seating', description: 'Configurable furniture layout' }
        ],
        area: 100,
        coordinates: { x: 300, y: 200 }
      },
      {
        name: 'Collaboration Lounge',
        serviceType: 'Networking Space',
        roomNumber: 'NS-L-01',
        floor: 2,
        capacity: 25,
        features: ['Comfortable seating', 'Coffee station', 'Presentation area'],
        images: ['https://res.cloudinary.com/dvwp5td6y/image/upload/v1760000266/Screenshot_2025-10-09_155732_dzzhgv.png'],
        amenities: [
          { name: 'Coffee Station', description: 'Complimentary beverages' },
          { name: 'Presentation Area', description: 'Small stage with microphone' },
          { name: 'Comfortable Seating', description: 'Lounge-style furniture' }
        ],
        area: 60,
        coordinates: { x: 250, y: 250 }
      }
    ];

    await TeamRoom.insertMany(teamRooms);
    console.log('Team rooms created successfully');

    console.log('All team data seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding team data:', error);
    process.exit(1);
  }
};

seedTeamData();