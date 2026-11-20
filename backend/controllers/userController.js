const User = require('./../models/userModel');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
// const upload = multer({dest: 'public/img/users'});


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Profile pictures must be JPG, PNG, or WebP images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const outputPath = path.join(__dirname, '../public/img/users', req.file.filename);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(req.file.buffer)
    .resize(500, 500, { fit: 'cover' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(outputPath);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next)=>{
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    returnDocument: 'after',
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
  const [user] = await Promise.all([
    User.findByIdAndUpdate(req.user.id, { active: false }),
    Tour.updateMany({ guides: req.user.id }, { $pull: { guides: req.user.id } })
  ]);
  if (!user) return next(new AppError('Your account could not be found.', 404));

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMyWishlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');
  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: { data: user.wishlist }
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId).select('_id');
  if (!tour) return next(new AppError('Tour not found.', 404));
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { wishlist: tour.id } },
    { returnDocument: 'after' }
  ).populate('wishlist');
  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: { data: user.wishlist }
  });
});

exports.removeFromWishlist = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: req.params.tourId } },
    { returnDocument: 'after' }
  ).populate('wishlist');
  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: { data: user.wishlist }
  });
});

exports.updateGuideAvailability = catchAsync(async (req, res, next) => {
  const availability = req.body.availability;
  if (!Array.isArray(availability) || availability.length > 100) {
    return next(new AppError('Provide at most 100 guide availability date ranges.', 400));
  }
  const normalized = availability.map((range) => ({
    startDate: new Date(range?.startDate),
    endDate: new Date(range?.endDate)
  }));
  if (normalized.some(({ startDate, endDate }) =>
    Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate
  )) {
    return next(new AppError('Each availability range must have valid dates and an end date on or after its start date.', 400));
  }
  normalized.sort((first, second) => first.startDate - second.startDate);
  if (normalized.some((range, index) => index > 0 && range.startDate <= normalized[index - 1].endDate)) {
    return next(new AppError('Availability ranges cannot overlap.', 400));
  }
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { guideAvailability: normalized },
    { returnDocument: 'after', runValidators: true, select: 'name guideAvailability role' }
  );
  if (!user) return next(new AppError('Guide account not found.', 404));
  res.status(200).json({ status: 'success', data: { data: user } });
});


exports.createUser = (req, res)=>{
  res.status(500).json({
    status:'error',
    message: 'This route is not yet defined! please use sign up instead'
  });
};


exports.getUser = factory.getOne(User);
exports.getAllUsers = catchAsync(async (req, res) => {
  const query = User.find()
    .setOptions({ includeInactive: true })
    .select('name email role photo createdAt +active');
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { data: users }
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Use the password update workflow to change credentials.', 400));
  }
  const allowedFields = filterObj(req.body, 'name', 'email', 'phone', 'role', 'active');
  const user = await User.findByIdAndUpdate(req.params.id, allowedFields, {
    includeInactive: true,
    new: true,
    runValidators: true
  }).select('+active');
  if (!user) return next(new AppError('No user found with that ID.', 404));
  if ((user.role !== 'guide' && user.role !== 'lead-guide') || !user.active) {
    await Tour.updateMany({ guides: user._id }, { $pull: { guides: user._id } });
  }
  res.status(200).json({ status: 'success', data: { data: user } });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).setOptions({ includeInactive: true }).select('+active');
  if (!user) return next(new AppError('No user found with that ID.', 404));

  const [hasBookings, hasReviews, hasAssignedTours] = await Promise.all([
    Booking.exists({ user: user._id }),
    Review.exists({ $or: [{ user: user._id }, { 'guideResponse.responder': user._id }] }),
    Tour.exists({ guides: user._id })
  ]);
  if (hasBookings || hasReviews || hasAssignedTours) {
    return next(new AppError('This account is linked to bookings, reviews, or assigned tours. Deactivate it instead of deleting it.', 409));
  }

  await User.findOneAndDelete({ _id: user._id }).setOptions({ includeInactive: true });
  res.status(204).json({ status: 'success', data: null });
});
