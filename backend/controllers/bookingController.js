const crypto = require('crypto');
const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const isDemoPaymentAllowed = () =>
  process.env.NODE_ENV !== 'production' || process.env.DEMO_PAYMENT_ENABLED === 'true';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Online payment is not configured. Contact the site administrator.', 503);
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { data: bookings }
  });
});

exports.getAssignedBookings = catchAsync(async (req, res) => {
  const assignedTourIds = await Tour.find({ guides: req.user.id }).distinct('_id');
  const bookings = await Booking.find({ tour: { $in: assignedTourIds } })
    .populate({ path: 'user', select: 'name photo' })
    .sort('-startDate');
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { data: bookings }
  });
});

exports.updateAssignedProgress = catchAsync(async (req, res, next) => {
  const { tripProgress } = req.body;
  if (!['in_progress', 'completed'].includes(tripProgress)) {
    return next(new AppError('Trip progress must be in_progress or completed.', 400));
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found.', 404));
  const isAssignedGuide = await Tour.exists({
    _id: booking.tour._id,
    guides: req.user.id
  });
  if (!isAssignedGuide) return next(new AppError('You are not assigned to this booking’s tour.', 403));
  if (!booking.paid || booking.status !== 'confirmed') {
    return next(new AppError('Only confirmed paid trips can have progress updates.', 409));
  }
  const allowedNext = {
    scheduled: 'in_progress',
    in_progress: 'completed',
    completed: 'completed'
  };
  const currentProgress = booking.tripProgress || 'scheduled';
  if (allowedNext[currentProgress] !== tripProgress) {
    return next(new AppError('Trip progress must move from scheduled to in progress, then completed.', 409));
  }
  booking.tripProgress = tripProgress;
  await booking.save();
  res.status(200).json({ status: 'success', data: { data: booking } });
});

const getValidatedTourBooking = async req => {
  const { tourId, startDate, numGuests, travellers } = req.body;
  const guests = Number(numGuests);
  const tour = await Tour.findById(tourId);

  if (!tour) throw new AppError('Tour not found.', 404);
  if (!Number.isInteger(guests) || guests < 1 || guests > tour.maxGroupSize) {
    throw new AppError(`Choose between 1 and ${tour.maxGroupSize} travellers.`, 400);
  }
  if (
    !Array.isArray(travellers) ||
    travellers.length !== guests ||
    travellers.some(traveller => !traveller || typeof traveller.name !== 'string' || !traveller.name.trim())
  ) {
    throw new AppError('Provide a name for each traveller.', 400);
  }

  const travellerDetails = travellers.map(traveller => ({
    name: traveller.name.trim(),
    ...(traveller.age !== undefined && traveller.age !== '' ? { age: Number(traveller.age) } : {})
  }));
  if (travellerDetails.some(traveller => traveller.age !== undefined && (!Number.isInteger(traveller.age) || traveller.age < 0 || traveller.age > 120))) {
    throw new AppError('Traveller ages must be whole numbers from 0 to 120.', 400);
  }

  const departure = new Date(startDate);
  const isAvailable = startDate &&
    !Number.isNaN(departure.getTime()) &&
    tour.startDates.some(date => new Date(date).toISOString().slice(0, 10) === departure.toISOString().slice(0, 10));
  if (!isAvailable) throw new AppError('Please choose an available departure date for this tour.', 400);

  return { tour, departure, guests, travellerDetails };
};

const ensureDepartureCapacity = async (tour, departure, guests) => {
  const dateStart = new Date(`${departure.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
  const reservations = await Booking.aggregate([
    {
      $match: {
        tour: tour._id,
        startDate: { $gte: dateStart, $lt: dateEnd },
        status: { $in: ['pending', 'confirmed'] }
      }
    },
    { $group: { _id: null, travellers: { $sum: { $ifNull: ['$numGuests', 0] } } } }
  ]);
  const reservedGuests = reservations[0]?.travellers || 0;
  if (reservedGuests + guests > tour.maxGroupSize) {
    throw new AppError('There are not enough places left for this departure.', 409);
  }
};

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { tour, departure, guests, travellerDetails } = await getValidatedTourBooking(req);
  if (!process.env.STRIPE_SECRET_KEY) {
    if (isDemoPaymentAllowed()) {
      return res.status(200).json({ status: 'success', data: { paymentMode: 'demo' } });
    }
    return next(new AppError('Online payment is not configured. No booking or payment was created.', 503));
  }

  await ensureDepartureCapacity(tour, departure, guests);

  const unitPrice = tour.priceDiscount || tour.price;
  const booking = await Booking.create({
    tour: tour._id,
    user: req.user.id,
    price: unitPrice * guests,
    startDate: departure,
    numGuests: guests,
    travellers: travellerDetails,
    bookingReference: crypto.randomBytes(8).toString('hex').toUpperCase(),
    status: 'pending',
    paymentStatus: 'pending',
    paid: false
  });

  try {
    const frontendOrigin = (process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id, userId: req.user.id },
      line_items: [{
        quantity: guests,
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'inr',
          unit_amount: Math.round(unitPrice * 100),
          product_data: {
            name: tour.name,
            description: tour.summary.slice(0, 500)
          }
        }
      }],
      success_url: `${frontendOrigin}/account?payment=processing`,
      cancel_url: `${frontendOrigin}/tour/${tour.slug}?payment=cancelled`
    });

    booking.stripeSessionId = session.id;
    await booking.save();
    return res.status(200).json({
      status: 'success',
      data: { checkoutUrl: session.url, bookingReference: booking.bookingReference }
    });
  } catch (error) {
    await Booking.findByIdAndDelete(booking.id);
    throw error;
  }
});

exports.createDemoBooking = catchAsync(async (req, res, next) => {
  if (!isDemoPaymentAllowed()) {
    return next(new AppError('Demo payments are disabled in production.', 403));
  }

  const { tour, departure, guests, travellerDetails } = await getValidatedTourBooking(req);
  await ensureDepartureCapacity(tour, departure, guests);

  const unitPrice = tour.priceDiscount || tour.price;
  const booking = await Booking.create({
    tour: tour._id,
    user: req.user.id,
    price: unitPrice * guests,
    startDate: departure,
    numGuests: guests,
    travellers: travellerDetails,
    bookingReference: crypto.randomBytes(8).toString('hex').toUpperCase(),
    paymentProvider: 'demo',
    demoTransactionId: `DEMO-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    status: 'confirmed',
    paymentStatus: 'demo_paid',
    paid: false
  });

  res.status(201).json({ status: 'success', data: { data: booking } });
});

exports.cancelMyBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id }).select('+stripeSessionId');
  if (!booking) return next(new AppError('Booking not found.', 404));
  const isDemoBooking = booking.paymentProvider === 'demo';
  if (booking.paymentStatus === 'paid' || (booking.status === 'confirmed' && !isDemoBooking)) {
    return next(new AppError('Paid bookings require a refund review; self-service refunds are not configured.', 409));
  }
  if (booking.stripeSessionId && booking.status === 'pending') {
    const checkoutSession = await getStripe().checkout.sessions.expire(booking.stripeSessionId);
    if (checkoutSession.status !== 'expired') {
      return next(new AppError('The payment session could not be cancelled. Please try again or contact support.', 409));
    }
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'pending') booking.paymentStatus = 'failed';
  await booking.save();
  res.status(200).json({ status: 'success', data: { data: booking } });
});

exports.webhookCheckout = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ status: 'error', message: 'Payment webhook is not configured.' });
  }
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ status: 'error', message: 'Invalid payment webhook signature.' });
  }

  const session = event.data.object;
  const bookingId = session.metadata && session.metadata.bookingId;
  if (
    bookingId &&
    ['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) &&
    session.payment_status === 'paid'
  ) {
    await Booking.findOneAndUpdate(
      { _id: bookingId, stripeSessionId: session.id, paymentStatus: 'pending', status: 'pending' },
      {
        paid: true,
        paymentStatus: 'paid',
        status: 'confirmed',
        stripePaymentIntentId: session.payment_intent
      }
    );
  } else if (
    bookingId &&
    ['checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)
  ) {
    await Booking.findOneAndUpdate(
      { _id: bookingId, stripeSessionId: session.id, paymentStatus: 'pending', status: 'pending' },
      { paymentStatus: 'failed', status: 'cancelled' }
    );
  } else if (
    event.type === 'refund.failed' &&
    (typeof session.payment_intent === 'string' || session.payment_intent?.id)
  ) {
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;
    await Booking.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, paymentStatus: 'refund_pending' },
      { paymentStatus: 'paid', refundStatus: 'failed', paid: true }
    );
  } else if (
    event.type === 'charge.refunded' &&
    (typeof session.payment_intent === 'string' || session.payment_intent?.id)
  ) {
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;
    const fullyRefunded = session.refunded && session.amount_refunded >= session.amount;
    await Booking.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, paymentStatus: { $in: ['paid', 'refund_pending'] } },
      fullyRefunded
        ? { paid: false, paymentStatus: 'refunded', status: 'refunded', refundStatus: 'succeeded' }
        : { paymentStatus: 'partially_refunded', refundStatus: 'succeeded' }
    );
  }
  return res.status(200).json({ received: true });
};

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).select('+stripeSessionId');
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (req.body.status !== 'cancelled' || booking.paid) {
    return next(new AppError('Only unpaid bookings can be cancelled by an administrator. Payment state is provider-controlled.', 409));
  }
  if (booking.stripeSessionId && booking.status === 'pending') {
    const checkoutSession = await getStripe().checkout.sessions.expire(booking.stripeSessionId);
    if (checkoutSession.status !== 'expired') {
      return next(new AppError('The payment session could not be cancelled.', 409));
    }
  }
  booking.status = 'cancelled';
  if (booking.paymentStatus === 'pending') booking.paymentStatus = 'failed';
  await booking.save();
  res.status(200).json({ status: 'success', data: { data: booking } });
});

exports.requestRefund = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).select('+stripePaymentIntentId');
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (!booking.paid || booking.paymentStatus !== 'paid' || !booking.stripePaymentIntentId) {
    return next(new AppError('This booking has no refundable verified payment.', 409));
  }
  const refund = await getStripe().refunds.create(
    { payment_intent: booking.stripePaymentIntentId, reason: 'requested_by_customer' },
    { idempotencyKey: `booking-refund-${booking.id}` }
  );
  booking.refundStatus = refund.status === 'succeeded' ? 'succeeded' : 'pending';
  if (refund.status === 'succeeded') {
    booking.paid = false;
    booking.paymentStatus = 'refunded';
    booking.status = 'refunded';
  } else {
    booking.paymentStatus = 'refund_pending';
  }
  await booking.save();
  res.status(202).json({ status: 'success', data: { data: booking } });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found.', 404));
  if (booking.paid || booking.paymentStatus === 'pending' || booking.paymentStatus === 'refund_pending') {
    return next(new AppError('Paid or pending-payment bookings cannot be deleted.', 409));
  }
  await booking.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});
