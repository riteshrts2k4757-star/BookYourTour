const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = user => {
  return jwt.sign({ id: user.id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);
  const cookieOptions = getCookieOptions();

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.tokenVersion = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user
    }
  });
};

const getCookieOptions = () => ({
  expires: new Date(
    Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, passwordConfirm } = req.body;
  if (!name || !email || !phone || !password || !passwordConfirm) {
    return next(new AppError('Name, email, phone, password and password confirmation are required.', 400));
  }
  const newUser = await User.create({
    name,
    email,
    phone,
    password,
    passwordConfirm,
    role: 'user'
  });
  const frontendOrigin = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${frontendOrigin.replace(/\/$/, '')}/account`;
  // console.log(url);
  try {
    await new Email(newUser, url).sendWelcome();
  } catch (emailError) {
    console.error('Registration completed, but the welcome email could not be sent:', emailError.message);
  }
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password +tokenVersion');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  // Prevent Vercel Edge caching from stripping the Set-Cookie header
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  res.clearCookie('jwt', getCookieOptions());
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+tokenVersion +passwordChangedAt');
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  if (
    decoded.tokenVersion !== undefined &&
    decoded.tokenVersion !== (currentUser.tokenVersion || 0)
  ) {
    return next(new AppError('Your session is no longer valid. Please log in again.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  currentUser.passwordChangedAt = undefined;
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }).select('+tokenVersion');
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists for that email, a password reset link will be sent.'
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  
  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  
  try {
    const frontendOrigin = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const resetURL = `${frontendOrigin.replace(/\/$/, '')}/reset-password/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'If an account exists and email delivery is available, a reset link will be sent.'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Password reset email delivery failed:', err.message);
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists and email delivery is available, a reset link will be sent.'
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('A new password and confirmation are required.', 400));
  }
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+tokenVersion');

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.passwordCurrent || !req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('Current password, new password and confirmation are required.', 400));
  }
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password +tokenVersion');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
