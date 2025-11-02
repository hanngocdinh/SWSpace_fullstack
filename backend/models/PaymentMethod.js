const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit-card', 'debit-card', 'bank-transfer', 'momo', 'zalopay', 'vnpay', 'paypal'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // For card payments
  cardNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type.includes('card') ? v && v.length >= 4 : true;
      },
      message: 'Card number is required for card payments'
    }
  },
  cardHolderName: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type.includes('card') ? v && v.length > 0 : true;
      },
      message: 'Card holder name is required for card payments'
    }
  },
  expiryMonth: {
    type: Number,
    min: 1,
    max: 12,
    validate: {
      validator: function(v) {
        return this.type.includes('card') ? v >= 1 && v <= 12 : true;
      },
      message: 'Valid expiry month is required for card payments'
    }
  },
  expiryYear: {
    type: Number,
    validate: {
      validator: function(v) {
        const currentYear = new Date().getFullYear();
        return this.type.includes('card') ? v >= currentYear : true;
      },
      message: 'Valid expiry year is required for card payments'
    }
  },
  last4Digits: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type.includes('card') ? v && v.length === 4 : true;
      },
      message: 'Last 4 digits are required for card payments'
    }
  },
  // For bank transfer
  bankName: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type === 'bank-transfer' ? v && v.length > 0 : true;
      },
      message: 'Bank name is required for bank transfer'
    }
  },
  accountNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type === 'bank-transfer' ? v && v.length > 0 : true;
      },
      message: 'Account number is required for bank transfer'
    }
  },
  accountHolderName: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type === 'bank-transfer' ? v && v.length > 0 : true;
      },
      message: 'Account holder name is required for bank transfer'
    }
  },
  // For e-wallets
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return ['momo', 'zalopay', 'vnpay'].includes(this.type) ? v && v.length > 0 : true;
      },
      message: 'Phone number is required for e-wallet payments'
    }
  },
  // For PayPal
  paypalEmail: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type === 'paypal' ? v && v.includes('@') : true;
      },
      message: 'Valid PayPal email is required'
    }
  },
  // Display name for easy identification
  displayName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate display name
paymentMethodSchema.pre('save', function(next) {
  if (!this.displayName) {
    switch (this.type) {
      case 'credit-card':
      case 'debit-card':
        this.displayName = `${this.type.replace('-', ' ').toUpperCase()} **** ${this.last4Digits}`;
        break;
      case 'bank-transfer':
        this.displayName = `${this.bankName} - **** ${this.accountNumber.slice(-4)}`;
        break;
      case 'momo':
        this.displayName = `MoMo - ${this.phoneNumber}`;
        break;
      case 'zalopay':
        this.displayName = `ZaloPay - ${this.phoneNumber}`;
        break;
      case 'vnpay':
        this.displayName = `VNPay - ${this.phoneNumber}`;
        break;
      case 'paypal':
        this.displayName = `PayPal - ${this.paypalEmail}`;
        break;
      default:
        this.displayName = this.type.toUpperCase();
    }
  }
  next();
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index for faster queries
paymentMethodSchema.index({ userId: 1, isActive: 1 });
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
