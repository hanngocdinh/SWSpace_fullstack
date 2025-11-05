const mongoose = require('mongoose');

const teamServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Private Office', 'Meeting Room', 'Networking Space']
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  capacity: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  minimumBookingAdvance: {
    type: String,
    required: true,
    enum: ['1 day', '1 week']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeamService', teamServiceSchema);