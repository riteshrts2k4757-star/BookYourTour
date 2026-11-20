import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { tourService } from '../../services/mock/tourService';
import { apiClient, getApiErrorMessage } from '../../services/apiClient';
import type { Tour } from '../../data/tours';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TourAttractionsMap } from '../../components/naviband/TourAttractionsMap';
import { DemoPaymentModal } from '../../components/modals/DemoPaymentModal';
import {
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  Heart,
  Share2,
  ArrowRight,
  Compass,
  Watch,
  Navigation,
  Sparkles
} from 'lucide-react';

interface TourReview {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface BackendReview {
  _id?: string;
  id?: string;
  user?: string | { _id?: string; id?: string; name?: string; photo?: string };
  rating?: number;
  review?: string;
  createdAt?: string;
}

interface TourBooking {
  tour?: string | { _id?: string; id?: string };
  startDate?: string;
  duration?: number;
  status?: string;
  paid?: boolean;
}

interface TourGuidePreview {
  id: string;
  name: string;
  photo: string;
}

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, isWishlisted, toggleWishlist } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null>(null);
  const [guide, setGuide] = useState<TourGuidePreview | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Active Gallery Image
  const [activeImage, setActiveImage] = useState<string>('');

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [travellers, setTravellers] = useState<number>(2);
  const [travellerNames, setTravellerNames] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isDemoPaymentOpen, setIsDemoPaymentOpen] = useState(false);

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setLoading(true);
      setLoadError('');
      setCanReview(false);
      setAlreadyReviewed(false);
      try {
        if (!id) {
          setTour(null);
          return;
        }
        const tourData = await tourService.getById(id);
        if (!active) return;
        if (!tourData) {
          setTour(null);
          return;
        }
        setTour(tourData);
        setActiveImage(tourData.imageCover);
        setSelectedDate(tourData.startDates[0] || '');
        setGuide(tourData.guideProfiles?.[0] || null);

        const reviewResponse = await apiClient.get<{ data?: { data?: BackendReview[] } }>(`/tours/${encodeURIComponent(tourData.id)}/reviews`);
        const tourReviews = (reviewResponse.data.data?.data || []).map((review) => {
          const reviewUser = typeof review.user === 'object' && review.user !== null ? review.user : null;
          const photo = reviewUser?.photo || '';
          return {
            id: String(review._id || review.id || ''),
            userId: typeof review.user === 'string' ? review.user : String(reviewUser?._id || reviewUser?.id || ''),
            userName: reviewUser?.name || 'Traveller',
            userPhoto: photo.startsWith('http') || photo.startsWith('/') ? photo : photo ? `/img/users/${encodeURIComponent(photo)}` : '/img/users/default.jpg',
            rating: Number(review.rating || 0),
            review: review.review || '',
            createdAt: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''
          };
        });
        if (!active) return;
        setReviews(tourReviews);
        setAlreadyReviewed(Boolean(user && tourReviews.some((review) => review.userId === user.id)));

        if (user?.role === 'user') {
          const bookingResponse = await apiClient.get<{ data?: { data?: TourBooking[] } }>('/bookings/mine');
          const bookings = bookingResponse.data.data?.data || [];
          const hasCompletedPaidBooking = bookings.some((booking) => {
            const bookingTourId = typeof booking.tour === 'string'
              ? booking.tour
              : booking.tour?._id || booking.tour?.id;
            const startTime = booking.startDate ? new Date(booking.startDate).getTime() : Number.NaN;
            const completionTime = startTime + tourData.duration * 24 * 60 * 60 * 1000;
            return bookingTourId === tourData.id &&
              booking.paid === true &&
              booking.status !== 'cancelled' &&
              booking.status !== 'refunded' &&
              Number.isFinite(startTime) &&
              completionTime <= Date.now();
          });
          if (active) setCanReview(hasCompletedPaidBooking);
        }
      } catch (error) {
        if (active) setLoadError(getApiErrorMessage(error, 'Tour information could not be loaded.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadData();
    return () => {
      active = false;
    };
  }, [id, user?.id, user?.role]);

  useEffect(() => {
    setTravellerNames((currentNames) =>
      Array.from({ length: travellers }, (_, index) =>
        currentNames[index] || (index === 0 ? user?.name || '' : '')
      )
    );
  }, [travellers, user?.name]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading expedition details...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tour Circuit Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">{loadError || 'The requested tour package does not exist or has been archived.'}</p>
        <Link to="/tours" className="mt-6 inline-block btn-primary text-xs font-bold py-2.5 px-6">
          Browse Available Tours
        </Link>
      </div>
    );
  }

  const basePrice = tour.priceDiscount || tour.price;
  const subtotal = basePrice * travellers;
  const totalAmount = subtotal;

  const handleStartBooking = async () => {
    if (!selectedDate) {
      showToast('Please select a travel departure date.', 'error');
      return;
    }
    if (!user) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    if (role !== 'user') {
      showToast('Only traveller accounts can book tours.', 'error');
      return;
    }
    if (travellerNames.length !== travellers || travellerNames.some((name) => !name.trim())) {
      showToast('Enter the name of every traveller before continuing.', 'error');
      return;
    }

    setIsBooking(true);
    try {
      const response = await apiClient.post<{ data?: { checkoutUrl?: string; paymentMode?: 'demo' } }>('/bookings/checkout-session', {
        tourId: tour.id,
        startDate: selectedDate,
        numGuests: travellers,
        travellers: travellerNames.map((name) => ({ name: name.trim() }))
      });
      if (response.data.data?.paymentMode === 'demo') {
        setIsDemoPaymentOpen(true);
        setIsBooking(false);
        return;
      }
      const checkoutUrl = response.data.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('The payment provider did not return a checkout link.');
      window.location.assign(checkoutUrl);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Secure checkout could not be started.');
      showToast(message, 'error');
      setIsBooking(false);
    }
  };

  const handleDemoPaymentSuccess = async () => {
    await apiClient.post('/bookings/demo-checkout', {
      tourId: tour.id,
      startDate: selectedDate,
      numGuests: travellers,
      travellers: travellerNames.map((name) => ({ name: name.trim() }))
    });
    setIsDemoPaymentOpen(false);
    navigate('/account/bookings');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canReview || alreadyReviewed || !newReviewText.trim()) return;
    try {
      await apiClient.post(`/tours/${encodeURIComponent(tour.id)}/reviews`, {
        rating: newReviewRating,
        review: newReviewText.trim()
      });
      setNewReviewText('');
      setAlreadyReviewed(true);
      showToast('Your review has been published.', 'success');
      const response = await apiClient.get<{ data?: { data?: BackendReview[] } }>(`/tours/${encodeURIComponent(tour.id)}/reviews`);
      setReviews((response.data.data?.data || []).map((review) => {
        const reviewUser = typeof review.user === 'object' && review.user !== null ? review.user : null;
        const photo = reviewUser?.photo || '';
        return {
          id: String(review._id || review.id || ''),
          userId: typeof review.user === 'string' ? review.user : String(reviewUser?._id || reviewUser?.id || ''),
          userName: reviewUser?.name || 'Traveller',
          userPhoto: photo.startsWith('http') || photo.startsWith('/') ? photo : photo ? `/img/users/${encodeURIComponent(photo)}` : '/img/users/default.jpg',
          rating: Number(review.rating || 0),
          review: review.review || '',
          createdAt: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''
        };
      }));
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Review could not be submitted.'), 'error');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    try {
      await toggleWishlist(tour.id);
      showToast(wishlisted ? 'Removed from your saved tours.' : 'Added to your saved tours.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Wishlist could not be updated.'), 'error');
    }
  };

  const wishlisted = isWishlisted(tour.id);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Actions Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-slate-900 dark:text-white">Home</Link>
            <span>/</span>
            <Link to="/tours" className="hover:text-slate-900 dark:text-white">Tours</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{tour.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleToggleWishlist()}
              className={`p-2 rounded-xl border flex items-center gap-1.5 transition ${
                wishlisted
                  ? 'bg-coral-50 border-coral-200 text-coral-600 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{wishlisted ? 'Saved' : 'Wishlist'}</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Tour link copied to clipboard!', 'info');
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Share Link"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-navy uppercase tracking-wider">{tour.category}</span>
            <span className="badge-teal uppercase tracking-wider">{tour.difficulty} difficulty</span>
            <div className="flex items-center gap-1 text-xs text-slate-600 ml-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900">{tour.ratingsAverage}</span>
              <span className="text-slate-400">({tour.ratingsQuantity} verified ratings)</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {tour.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-teal-600" />
            Starts in {tour.startLocation.description} ({tour.startLocation.address})
          </p>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
          {/* Main Hero Photo */}
          <div className="lg:col-span-3 h-[380px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={activeImage}
              alt={tour.name}
              className="h-full w-full object-cover transition-all duration-300"
            />
          </div>
          {/* Thumbnail Strip */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 h-[120px] lg:h-[460px]">
            {[tour.imageCover, ...(tour.images || [])].slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`relative rounded-2xl overflow-hidden h-full border-2 transition ${
                  activeImage === img ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Sticky Booking Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Itinerary, Inclusions, Guide, Reviews */}
          <div className="lg:col-span-8 space-y-10">
            {/* Highlights Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Compass className="h-5 w-5 text-teal-600" /> Expedition Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tour.highlights.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Description */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-3">
                About This Journey
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Day-by-Day Detailed Itinerary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" /> Day-by-Day Journey Schedule
              </h3>
              <div className="space-y-6">
                {tour.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        D{day.day}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    </div>
                    <div className="pb-4">
                      <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        {day.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                        {day.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {day.activities.map((act, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NaviBand Interactive Circuit Map & Explorer */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-teal-50 text-teal-600">
                      <Watch className="h-4 w-4" />
                    </span>
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                      Circuit Map & NaviBand Stops
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Airport arrival, hotel accommodation, and daily expedition checkpoints.
                  </p>
                </div>

                <Link
                  to={`/tours/${tour.id}/naviband`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-transform hover:scale-105"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Explore with NaviBand</span>
                </Link>
              </div>

              {/* Render Leaflet Map */}
              <TourAttractionsMap
                stops={[
                  ...(tour.airport ? [{ address: tour.airport.name, coordinates: tour.airport.coordinates, description: 'Airport Arrival & Transit Hub' }] : []),
                  ...(tour.hotel ? [{ address: tour.hotel.name, coordinates: tour.hotel.coordinates, description: 'Heritage Hotel Accommodation' }] : []),
                  ...tour.locations.map((loc) => ({
                    address: loc.description,
                    coordinates: loc.coordinates,
                    day: loc.day,
                    photo: loc.photo,
                    description: `Day ${loc.day} itinerary checkpoint`
                  })),
                  ...(tour.airport ? [{ address: `${tour.airport.name} (Return)`, coordinates: tour.airport.coordinates, description: 'Departure Flight Transfer' }] : [])
                ]}
              />

              {/* NaviBand Banner Feature Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-navy-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shrink-0">
                    <Watch className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-1.5 text-teal-300">
                      <span>Hands-Free Smartwatch Navigation</span>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Sync with your NaviBand wristband for subtle left/right haptic vibration guidance throughout this tour.
                    </p>
                  </div>
                </div>

                <Link
                  to={`/tours/${tour.id}/naviband`}
                  className="shrink-0 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                >
                  <span>Launch NaviBand</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-6">
                What's Included & Excluded
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-3">
                    Included Services
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {tour.included.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-3">
                    Not Included
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                    {tour.excluded.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Assigned Guide Profile */}
            {guide && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={guide.photo}
                  alt={guide.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-md shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">{guide.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Certified Expedition Lead
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Assigned guide for this tour.</p>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
                <span>Traveller Reviews ({reviews.length})</span>
                <span className="text-xs font-normal text-slate-500">Verified community ratings</span>
              </h3>

              {user && canReview && !alreadyReviewed ? (
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Review your completed tour</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-0.5 text-amber-400"
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star className={`h-4 w-4 ${star <= newReviewRating ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share details of your experience on this circuit..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
                    rows={3}
                    minLength={5}
                    maxLength={1000}
                    required
                  />
                  <button type="submit" className="mt-2 btn-primary text-xs py-2 px-4 font-bold">
                    Submit review
                  </button>
                </form>
              ) : (
                <p className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {alreadyReviewed
                    ? 'You have already reviewed this tour.'
                    : user
                      ? 'Reviews are available after a paid tour has been completed.'
                      : 'Sign in after completing a paid tour to leave a verified review.'}
                </p>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img src={r.userPhoto} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <strong className="text-xs text-slate-800 block">{r.userName}</strong>
                          <span className="text-[10px] text-slate-400">{r.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(r.rating)].map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  All-Inclusive Fare
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                  {tour.priceDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{tour.price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">/ person</span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-teal-600" /> Select Departure Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field text-xs font-semibold"
                  disabled={tour.startDates.length === 0}
                  required
                >
                  {tour.startDates.length === 0 && <option value="">No departures currently scheduled</option>}
                  {tour.startDates.map((d, i) => (
                    <option key={i} value={d}>
                      {new Date(`${d}T00:00:00`).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travellers Counter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-teal-600" /> Number of Travellers
                </label>
                <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTravellers(Math.max(1, travellers - 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{travellers} Guest{travellers > 1 ? 's' : ''}</span>
                  <button
                    type="button"
                    onClick={() => setTravellers(Math.min(tour.maxGroupSize, travellers + 1))}
                    className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Traveller names</span>
                {travellerNames.map((name, index) => (
                  <input
                    key={index}
                    type="text"
                    value={name}
                    onChange={(event) => setTravellerNames((currentNames) =>
                      currentNames.map((currentName, currentIndex) => currentIndex === index ? event.target.value : currentName)
                    )}
                    className="input-field text-xs"
                    placeholder={`Traveller ${index + 1} full name`}
                    maxLength={100}
                    required
                  />
                ))}
              </div>

              {/* Price Calculation Summary */}
              <div className="py-3 border-y border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>₹{basePrice.toLocaleString('en-IN')} × {travellers} Guests:</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes & Tourism Fees:</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100">
                  <span>Total Payable:</span>
                  <span className="text-teal-700 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                type="button"
                onClick={() => void handleStartBooking()}
                disabled={isBooking || !tour.startDates.length}
                className="w-full btn-primary py-3.5 text-sm font-bold shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
              >
                {isBooking ? 'Opening secure checkout...' : user ? 'Continue to secure checkout' : 'Sign in to book'}
                {!isBooking && <ArrowRight className="h-4 w-4" />}
              </button>

              {/* Explore with NaviBand Button */}
              <Link
                to={`/tours/${tour.id}/naviband`}
                className="w-full py-3 rounded-xl border border-teal-600/30 bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Watch className="h-4 w-4 text-teal-600" />
                <span>Explore with NaviBand</span>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="h-3.5 w-3.5 text-teal-600" />
                <span>Bookings and payment confirmation are stored by the secure booking service.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoPaymentModal
        isOpen={isDemoPaymentOpen}
        onClose={() => setIsDemoPaymentOpen(false)}
        amount={totalAmount}
        itemName={tour.name}
        itemType={tour.category}
        onPaymentSuccess={handleDemoPaymentSuccess}
        onPaymentFailure={() => setIsDemoPaymentOpen(false)}
      />
    </div>
  );
};

