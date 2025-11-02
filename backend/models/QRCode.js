const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // Mỗi booking chỉ có 1 QR code
  },
  qrCode: {
    type: String,
    required: true,
    unique: true // QR code phải unique
  },
  qrData: {
    type: String,
    required: true // JSON string chứa booking info
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true // QR code có thời hạn
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  // Security fields
  secretKey: {
    type: String,
    required: true // Key để verify QR authenticity
  },
  usageCount: {
    type: Number,
    default: 0 // Số lần đã scan
  },
  maxUsage: {
    type: Number,
    default: 10 // Giới hạn số lần scan (prevent abuse)
  }
}, {
  timestamps: true
});

// Index để tối ưu queries
qrCodeSchema.index({ bookingId: 1 });
qrCodeSchema.index({ qrCode: 1 });
qrCodeSchema.index({ expiresAt: 1 });

// Auto-expire QR codes
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware để generate QR code
qrCodeSchema.pre('save', function(next) {
  if (!this.qrCode) {
    // Generate unique QR code
    const crypto = require('crypto');
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    this.qrCode = `SWS-${timestamp}-${randomBytes}`;
  }
  
  if (!this.secretKey) {
    // Generate secret key for verification
    const crypto = require('crypto');
    this.secretKey = crypto.randomBytes(32).toString('hex');
  }
  
  next();
});

// Instance method để check QR validity
qrCodeSchema.methods.isValid = function() {
  return this.isActive && 
         this.expiresAt > new Date() && 
         this.usageCount < this.maxUsage;
};

// Instance method để increment usage
qrCodeSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method để find valid QR
qrCodeSchema.statics.findValidQR = function(qrCode) {
  return this.findOne({
    qrCode: qrCode,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('bookingId');
};

module.exports = mongoose.model('QRCode', qrCodeSchema);
