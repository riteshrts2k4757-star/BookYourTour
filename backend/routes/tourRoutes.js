const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const router = express.Router();
const sanitizeMultipart = mongoSanitize();
const cleanMultipart = xss();

router.use('/:tourId/reviews', reviewRouter);

router.get(
  '/assigned',
  authController.protect,
  authController.restrictTo('guide', 'lead-guide', 'admin'),
  tourController.getAssignedTours
);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.get(
  '/manage',
  authController.protect,
  authController.restrictTo('admin'),
  tourController.getAllToursForAdmin
);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    sanitizeMultipart,
    cleanMultipart,
    tourController.parseTourFormData,
    tourController.resizeTourImages,
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    sanitizeMultipart,
    cleanMultipart,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
