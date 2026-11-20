const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get(
  '/assigned',
  authController.restrictTo('guide', 'lead-guide'),
  bookingController.getAssignedBookings
);
router.get('/mine', bookingController.getMyBookings);
router.post('/checkout-session', authController.restrictTo('user'), bookingController.createCheckoutSession);
router.post('/demo-checkout', authController.restrictTo('user'), bookingController.createDemoBooking);
router.patch('/:id/cancel', authController.restrictTo('user'), bookingController.cancelMyBooking);
router.patch(
  '/:id/progress',
  authController.restrictTo('guide', 'lead-guide'),
  bookingController.updateAssignedProgress
);

router.use(authController.restrictTo('admin'));
router.post('/:id/refund', bookingController.requestRefund);

router
  .route('/')
  .get(bookingController.getAllBookings);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
