const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many authentication attempts. Try again later.' }
});
const sanitizeMultipart = mongoSanitize();
const cleanMultipart = xss();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.protect, authController.logout);
router.post('/forgotPassword', authLimiter, authController.forgotPassword);
router.patch('/resetPassword/:token', authLimiter, authController.resetPassword);

router.use(authController.protect);


router.patch(
  '/updateMyPassword',
  authLimiter,
  authController.updatePassword
);

router.get('/wishlist', userController.getMyWishlist);
router.post('/wishlist/:tourId', userController.addToWishlist);
router.delete('/wishlist/:tourId', userController.removeFromWishlist);
router.get('/me',  userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  sanitizeMultipart,
  cleanMultipart,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe',  userController.deleteMe);
router.patch(
  '/guide/availability',
  authController.restrictTo('guide', 'lead-guide'),
  userController.updateGuideAvailability
);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
