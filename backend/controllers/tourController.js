const Tour = require('./../models/tourModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');



const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  const cover = req.files?.imageCover?.[0];
  const images = req.files?.images || [];
  if (!cover && images.length === 0) return next();

  const imageId = req.params.id || crypto.randomBytes(8).toString('hex');
  const outputDirectory = path.join(__dirname, '../public/img/tours');
  await fs.promises.mkdir(outputDirectory, { recursive: true });

  if (cover) {
    req.body.imageCover = `tour-${imageId}-${Date.now()}-cover.jpeg`;
    await sharp(cover.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDirectory, req.body.imageCover));
  }

  if (images.length) {
    req.body.images = await Promise.all(images.map(async (file, index) => {
      const filename = `tour-${imageId}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path.join(outputDirectory, filename));
      return filename;
    }));
  }

  next();
});

exports.parseTourFormData = (req, res, next) => {
  if (typeof req.body.startDates === 'string') {
    try {
      const startDates = JSON.parse(req.body.startDates);
      if (!Array.isArray(startDates)) throw new Error('Expected an array.');
      req.body.startDates = startDates;
    } catch (error) {
      return next(new AppError('Tour start dates must be a valid JSON array.', 400));
    }
  }
  if (typeof req.body.startLocation === 'string') {
    try {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    } catch (error) {
      return next(new AppError('Tour start location must be valid JSON.', 400));
    }
  }
  const coordinates = req.body.startLocation?.coordinates;
  if (
    typeof req.body.startLocation?.address !== 'string' ||
    !req.body.startLocation.address.trim() ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2 ||
    !Number.isFinite(Number(coordinates[0])) ||
    !Number.isFinite(Number(coordinates[1])) ||
    Math.abs(Number(coordinates[0])) > 180 ||
    Math.abs(Number(coordinates[1])) > 90
  ) {
    return next(new AppError('Provide a start location with valid [longitude, latitude] coordinates.', 400));
  }
  req.body.startLocation.coordinates = coordinates.map(Number);
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getTours = async (filter, query, res) => {
  const features = new APIFeatures(Tour.find(filter), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours }
  });
};

exports.getAllTours = catchAsync(async (req, res) => {
  const publicQuery = { ...req.query };
  delete publicQuery.secretTour;
  await getTours({ secretTour: { $ne: true } }, publicQuery, res);
});
exports.getAllToursForAdmin = catchAsync(async (req, res) => {
  await getTours({}, req.query, res);
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour || tour.secretTour) return next(new AppError('No public tour found with that ID.', 404));
  res.status(200).json({ status: 'success', data: { data: tour } });
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = catchAsync(async (req, res, next) => {
  if (req.body.guides !== undefined) {
    if (
      !Array.isArray(req.body.guides) ||
      req.body.guides.length > 20 ||
      req.body.guides.some(guideId => typeof guideId !== 'string' || !mongoose.isValidObjectId(guideId))
    ) {
      return next(new AppError('Provide a list of valid guide account IDs.', 400));
    }

    const guideIds = [...new Set(req.body.guides.map(String))];
    const guideCount = await User.countDocuments({
      _id: { $in: guideIds },
      role: { $in: ['guide', 'lead-guide'] },
      active: { $ne: false }
    });
    if (guideCount !== guideIds.length) {
      return next(new AppError('Every assigned account must be an active guide.', 400));
    }
    req.body.guides = guideIds;
  }

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });
  if (!tour) return next(new AppError('No tour found with that ID.', 404));
  res.status(200).json({ status: 'success', data: { data: tour } });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).select('_id');
  if (!tour) return next(new AppError('No tour found with that ID.', 404));
  if (await Booking.exists({ tour: tour._id })) {
    return next(new AppError('Tours with booking history cannot be deleted. Unpublish this tour instead.', 409));
  }
  await Promise.all([
    Review.deleteMany({ tour: tour._id }),
    User.updateMany({ wishlist: tour._id }, { $pull: { wishlist: tour._id } })
  ]);
  await tour.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});
exports.getAssignedTours = catchAsync(async (req, res) => {
  const tours = await Tour.find({ guides: req.user.id });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours }
  });
});



exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const assignedTours = !['admin', 'lead-guide'].includes(req.user.role)
    ? await Tour.find({ guides: req.user.id }).distinct('_id')
    : null;

  const plan = await Tour.aggregate([
    ...(assignedTours ? [{ $match: { _id: { $in: assignedTours } } }] : []),
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});


exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const numericDistance = Number(distance);
  const numericLat = Number(lat);
  const numericLng = Number(lng);

  if (
    !distance ||
    Number.isNaN(numericDistance) ||
    numericDistance <= 0 ||
    !['mi', 'km'].includes(unit)
  ) {
    return next(
      new AppError('Please provide a valid distance and unit (mi or km).', 400)
    );
  }

  if (!lat || !lng || Number.isNaN(numericLat) || Number.isNaN(numericLng)) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const radius = unit === 'mi' ? numericDistance / 3963.2 : numericDistance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[numericLng, numericLat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const numericLat = Number(lat);
  const numericLng = Number(lng);
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng || Number.isNaN(numericLat) || Number.isNaN(numericLng)) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [numericLng, numericLat]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
