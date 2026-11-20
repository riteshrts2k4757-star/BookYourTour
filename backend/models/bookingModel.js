const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
    min: 0
  },
  startDate: Date,
  numGuests: {
    type: Number,
    min: 1
  },
  travellers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 120
    }
  }],
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  tripProgress: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed'],
    default: 'scheduled'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'demo_paid', 'failed', 'refund_pending', 'partially_refunded', 'refunded'],
    default: 'pending'
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'demo'],
    default: 'stripe'
  },
  demoTransactionId: {
    type: String,
    select: false
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'succeeded', 'failed'],
    default: 'none'
  },
  stripePaymentIntentId: {
    type: String,
    select: false
  },
  stripeSessionId: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paid: {
    type: Boolean,
    default: false
  }
});

bookingSchema.pre(/^find/, function() {
  this.populate({
    path: 'user',
    select: 'name email photo role',
    options: { includeInactive: true }
  }).populate({
    path: 'tour',
    select: 'name duration slug imageCover'
  });
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ tour: 1, startDate: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
