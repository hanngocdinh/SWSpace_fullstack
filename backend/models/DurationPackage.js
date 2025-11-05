const mongoose = require('mongoose');

const durationPackageSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    enum: ['Private Office', 'Meeting Room', 'Networking Space']
  },
  name: {
    type: String,
    required: true
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['hours', 'days', 'months', 'years']
    }
  },
  price: {
    type: Number,
    required: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  pricePerUnit: {
    type: Number, // For custom packages (price per hour/day)
    default: null
  },
  discount: {
    percentage: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DurationPackage', durationPackageSchema);