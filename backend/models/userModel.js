const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [25, 'Phone number cannot exceed 25 characters']
  },
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Tour'
  }],
  guideAvailability: [{
    startDate: Date,
    endDate: Date
  }],
  photo: {
    type: String,
    default: 'default.jpg'
    
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: { type: Date, select: false },
  tokenVersion: {
    type: Number,
    default: 0,
    select: false
  },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.index({ wishlist: 1 });


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});


userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});


userSchema.pre(/^find/, function () {
  if (!this.getOptions().includeInactive) {
    this.find({ active: { $ne: false } });
  }
});

//
// 🔑 CHECK PASSWORD
//
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//
// 🔄 CHECK IF PASSWORD CHANGED AFTER JWT
//
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

//
// 🔁 CREATE RESET TOKEN
//
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
