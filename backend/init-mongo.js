// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

print('=== Starting MongoDB initialization ===');

// Switch to swspace database
db = db.getSiblingDB('swspace');

// Create user for the swspace database
db.createUser({
  user: 'swspace_user',
  pwd: 'userpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'swspace'
    }
  ]
});

// Create collections with some initial data
db.createCollection('users');
db.createCollection('bookings');

// Insert sample users matching frontend demo data
// Note: These passwords are hashed version of 'password123'
const bcryptHashPassword123 = '$2a$10$xNzApkVDV4A15XDtk/kE..do82Uybi6D8kguFkMghrJLTtudx/bt2';

db.users.insertMany([
  {
    username: 'hanne',
    email: 'hanne@example.com',
    password: bcryptHashPassword123,
    fullName: 'Hanne Nguyen',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'john',
    email: 'john@example.com',
    password: bcryptHashPassword123,
    fullName: 'John Smith',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'admin',
    email: 'admin@swspace.com',
    password: bcryptHashPassword123,
    fullName: 'System Administrator',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('=== MongoDB initialization completed ===');
