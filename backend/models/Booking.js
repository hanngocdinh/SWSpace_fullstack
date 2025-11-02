const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required']
  },
  userFullName: {
    type: String,
    required: [true, 'User full name is required']
  },

  // Service information
  serviceType: {
    type: String,
    enum: ['hot-desk', 'fixed-desk', 'meeting-room', 'private-office'],
    required: [true, 'Service type is required']
  },

  // Package information
  packageDuration: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: [true, 'Package duration is required']
  },

  // Date and time information
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },

  // Seat information
  seatId: {
    type: String,
    required: [true, 'Seat ID is required']
  },
  seatName: {
    type: String,
    required: [true, 'Seat name is required']
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: [1, 'Floor must be at least 1'],
    max: [10, 'Floor cannot exceed 10']
  },

  // Pricing information
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  finalPrice: {
    type: Number,
    required: [true, 'Final price is required'],
    min: [0, 'Final price cannot be negative']
  },

  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },

  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'cash', 'wallet'],
    default: 'credit-card'
  },
  transactionId: {
    type: String,
    sparse: true
  },

  // Additional information
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },

  // Metadata
  bookingReference: {
    type: String,
    unique: true
  },
  
  // Cancellation information
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ userId: 1, startDate: 1 });
bookingSchema.index({ seatId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `SWS-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Method to check if booking conflicts with another booking
bookingSchema.methods.hasConflict = async function(excludeBookingId = null) {
  const query = {
    seatId: this.seatId,
    status: { $nin: ['cancelled'] },
    $or: [
      {
        startDate: { $lte: this.endDate },
        endDate: { $gte: this.startDate }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await this.constructor.findOne(query);
  return !!conflictingBooking;
};

// Method to calculate duration in hours
bookingSchema.methods.getDurationInHours = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.abs(end - start) / 36e5; // Convert milliseconds to hours
};

// Virtual for formatted booking reference
bookingSchema.virtual('formattedReference').get(function() {
  return this.bookingReference;
});

// Static method to find available seats
bookingSchema.statics.findAvailableSeats = async function(startDate, endDate, serviceType) {
  const bookedSeats = await this.find({
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
    status: { $nin: ['cancelled'] }
  }).distinct('seatId');

  // This would typically query a separate Seats collection
  // For now, return a basic structure
  const allSeats = generateSeatsForServiceType(serviceType);
  return allSeats.filter(seat => !bookedSeats.includes(seat.id));
};

// Helper function to generate seats (this would typically come from a separate Seats model)
function generateSeatsForServiceType(serviceType) {
  const seats = [];
  
  if (serviceType === 'hot-desk' || serviceType === 'fixed-desk') {
    // Floor 1: A1-A8, B1-B8
    for (let row of ['A', 'B']) {
      for (let num = 1; num <= 8; num++) {
        seats.push({
          id: `${row}${num}`,
          name: `${row}${num}`,
          floor: 1,
          type: serviceType,
          status: 'available'
        });
      }
    }
    
    // Floor 2: C1-C8, D1-D8
    for (let row of ['C', 'D']) {
      for (let num = 1; num <= 8; num++) {
        seats.push({
          id: `${row}${num}`,
          name: `${row}${num}`,
          floor: 2,
          type: serviceType,
          status: 'available'
        });
      }
    }
  }
  
  return seats;
}

module.exports = mongoose.model('Booking', bookingSchema);
