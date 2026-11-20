const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');


exports.setTourUserIds = (req, res, next) => {
  req.body.tour = req.params.tourId || req.body.tour;
  req.body.user = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res) => {
  const filter = req.params.tourId ? { tour: req.params.tourId } : {};
  const query = Review.find(filter)
    .populate({ path: 'tour', select: 'name slug' })
    .populate({
      path: 'guideResponse.responder',
      select: 'name',
      options: { includeInactive: true }
    });
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { data: reviews }
  });
});
exports.getReview = factory.getOne(Review, [
  { path: 'tour', select: 'name slug' },
  { path: 'guideResponse.responder', select: 'name', options: { includeInactive: true } }
]);
exports.getAssignedReviews = catchAsync(async (req, res) => {
  const assignedTourIds = await Tour.find({ guides: req.user.id }).distinct('_id');
  const reviews = await Review.find({ tour: { $in: assignedTourIds } })
    .populate({ path: 'tour', select: 'name slug' })
    .populate({
      path: 'guideResponse.responder',
      select: 'name',
      options: { includeInactive: true }
    })
    .sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { data: reviews }
  });
});

exports.updateGuideResponse = catchAsync(async (req, res, next) => {
  const response = typeof req.body.response === 'string' ? req.body.response.trim() : '';
  if (!response || response.length > 1000) {
    return next(new AppError('A guide response must contain 1 to 1000 characters.', 400));
  }

  const review = await Review.findById(req.params.id).select('tour');
  if (!review) return next(new AppError('Review not found.', 404));
  const assignedTour = await Tour.exists({ _id: review.tour, guides: req.user.id });
  if (!assignedTour) {
    return next(new AppError('You can only reply to reviews for tours assigned to you.', 403));
  }

  review.guideResponse = {
    text: response,
    responder: req.user.id,
    updatedAt: new Date()
  };
  await review.save();

  const updatedReview = await Review.findById(review.id)
    .populate({ path: 'tour', select: 'name slug' })
    .populate({
      path: 'guideResponse.responder',
      select: 'name',
      options: { includeInactive: true }
    });
  res.status(200).json({ status: 'success', data: { data: updatedReview } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.body.tour).select('duration');
  if (!tour) return next(new AppError('Tour not found.', 404));
  const completedBefore = new Date(Date.now() - tour.duration * 24 * 60 * 60 * 1000);
  const completedBooking = await Booking.exists({
    tour: req.body.tour,
    user: req.user.id,
    paid: true,
    startDate: { $lte: completedBefore },
    status: { $nin: ['cancelled', 'refunded'] }
  });
  if (!completedBooking) {
    return next(new AppError('A review can only be submitted after a paid tour has been completed.', 403));
  }
  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.user.id
  });
  res.status(201).json({ status: 'success', data: { data: review } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user.id;
  const review = await Review.findOneAndUpdate(
    filter,
    { review: req.body.review, rating: req.body.rating },
    { returnDocument: 'after', runValidators: true }
  );
  if (!review) return next(new AppError('Review not found or you do not have permission to change it.', 404));
  await Review.calcAverageRatings(review.tour);
  res.status(200).json({ status: 'success', data: { data: review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user.id;
  const review = await Review.findOneAndDelete(filter);
  if (!review) return next(new AppError('Review not found or you do not have permission to remove it.', 404));
  await Review.calcAverageRatings(review.tour);
  res.status(204).json({ status: 'success', data: null });
});
