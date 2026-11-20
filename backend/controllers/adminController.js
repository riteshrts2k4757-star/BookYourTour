const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res) => {
  const [users, activeUsers, tours, bookings, guides, reviews, payments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ active: { $ne: false } }),
    Tour.countDocuments(),
    Booking.countDocuments(),
    User.countDocuments({ role: { $in: ['guide', 'lead-guide'] }, active: { $ne: false } }),
    Review.countDocuments(),
    Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: {
            $sum: {
              $cond: [
                { $in: ['$paymentStatus', ['paid', 'partially_refunded']] },
                '$price',
                0
              ]
            }
          }
        }
      }
    ])
  ]);
  const paymentCounts = Object.fromEntries(payments.map(payment => [payment._id || 'unknown', payment.count]));
  const grossVerifiedPayments = payments.reduce((total, payment) => total + payment.amount, 0);

  res.status(200).json({
    status: 'success',
    data: {
      data: {
        users,
        activeUsers,
        tours,
        bookings,
        guides,
        reviews,
        paymentCounts,
        grossVerifiedPayments
      }
    }
  });
});
