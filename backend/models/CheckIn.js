const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true
  },
  // Check-in information
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'expired', 'cancelled'],
    default: 'checked-in'
  },
  // Location và device info
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    ipAddress: String
  },
  // Attendance tracking
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  actualSeat: {
    type: String // Actual seat used (có thể khác với booked seat)
  },
  // Notes và feedback
  checkInNotes: String,
  checkOutNotes: String,
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  // Verification info
  verificationMethod: {
    type: String,
    enum: ['qr-scan', 'manual', 'nfc', 'bluetooth'],
    default: 'qr-scan'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff member who verified (if manual)
  }
}, {
  timestamps: true
});

// Indexes
checkInSchema.index({ bookingId: 1 });
checkInSchema.index({ userId: 1 });
checkInSchema.index({ checkInTime: 1 });
checkInSchema.index({ status: 1 });
checkInSchema.index({ createdAt: -1 });

// Compound indexes
checkInSchema.index({ userId: 1, checkInTime: -1 });
checkInSchema.index({ bookingId: 1, status: 1 });

// Pre-save middleware để calculate duration
checkInSchema.pre('save', function(next) {
  if (this.checkOutTime && this.checkInTime) {
    const durationMs = this.checkOutTime - this.checkInTime;
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Instance method để check-out
checkInSchema.methods.checkOut = function(notes = '', rating = null) {
  this.checkOutTime = new Date();
  this.status = 'checked-out';
  if (notes) this.checkOutNotes = notes;
  if (rating) this.satisfactionRating = rating;
  
  // Calculate duration
  const durationMs = this.checkOutTime - this.checkInTime;
  this.duration = Math.round(durationMs / (1000 * 60));
  
  return this.save();
};

// Static method để get attendance stats
checkInSchema.statics.getAttendanceStats = function(userId, startDate, endDate) {
  const match = { userId };
  
  if (startDate || endDate) {
    match.checkInTime = {};
    if (startDate) match.checkInTime.$gte = new Date(startDate);
    if (endDate) match.checkInTime.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        avgRating: { $avg: '$satisfactionRating' },
        checkedInSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'checked-in'] }, 1, 0] }
        },
        checkedOutSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method để get daily attendance
checkInSchema.statics.getDailyAttendance = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        checkInTime: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: { 
          hour: { $hour: '$checkInTime' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.hour': 1 } }
  ]);
};

module.exports = mongoose.model('CheckIn', checkInSchema);
