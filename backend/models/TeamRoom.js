const mongoose = require('mongoose');

const teamRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['Private Office', 'Meeting Room', 'Networking Space']
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  amenities: [{
    name: String,
    description: String,
    icon: String
  }],
  area: {
    type: Number, // in square meters
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coordinates: {
    x: Number,
    y: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeamRoom', teamRoomSchema);