import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiClient, getApiErrorMessage } from '../../services/apiClient';
import { mapBackendTour } from '../../services/mock/tourService';
import type { BackendTour } from '../../services/mock/tourService';
import { TourCard } from '../../components/cards/TourCard';
import type { Tour } from '../../data/tours';
import {
  CalendarDays,
  Check,
  CircleUserRound,
  CreditCard,
  Heart,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
  X
} from 'lucide-react';

interface ApiListResponse<T> {
  data?: {
    data?: T[];
  };
}

interface BackendTourReference {
  _id?: string;
  id?: string;
  name?: string;
  duration?: number;
  slug?: string;
  imageCover?: string;
}

interface BookingRecord {
  _id: string;
  tour?: string | BackendTourReference;
  startDate?: string;
  createdAt?: string;
  numGuests?: number;
  price?: number;
  status: string;
  paymentStatus: string;
  tripProgress?: string;
  paid: boolean;
}

interface ReviewRecord {
  _id: string;
  tour: string | BackendTourReference;
  rating: number;
  review: string;
  createdAt?: string;
  guideResponse?: {
    text?: string;
    updatedAt?: string;
  };
}

const getReferenceId = (reference: string | BackendTourReference | undefined) =>
  typeof reference === 'string' ? reference : String(reference?._id || reference?.id || '');

const getReferenceName = (reference: string | BackendTourReference | undefined) =>
  typeof reference === 'object' && reference ? reference.name || 'Tour' : 'Tour';

const formatDate = (date: string | undefined) => {
  if (!date) return 'Date unavailable';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleDateString();
};

const isReviewEligible = (booking: BookingRecord) => {
  const tour = typeof booking.tour === 'object' ? booking.tour : null;
  const startTime = booking.startDate ? new Date(booking.startDate).getTime() : Number.NaN;
  if (!tour?.duration || !Number.isFinite(startTime) || !booking.paid) return false;
  if (booking.status === 'cancelled' || booking.status === 'refunded') return false;
  return startTime + tour.duration * 24 * 60 * 60 * 1000 <= Date.now();
};

export const UserDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [wishlist, setWishlist] = useState<Tour[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const profilePhotoUrl = useRef<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [reviewBooking, setReviewBooking] = useState<BookingRecord | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);

  const activeTab = location.pathname.includes('bookings')
    ? 'bookings'
    : location.pathname.includes('wishlist')
      ? 'wishlist'
      : location.pathname.includes('reviews')
        ? 'reviews'
        : location.pathname.includes('profile') || location.pathname.includes('settings')
          ? 'profile'
          : 'overview';

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [bookingResponse, wishlistResponse, reviewResponse] = await Promise.all([
        apiClient.get<ApiListResponse<BookingRecord>>('/bookings/mine'),
        apiClient.get<ApiListResponse<BackendTour>>('/users/wishlist'),
        apiClient.get<ApiListResponse<ReviewRecord>>('/reviews', { params: { user: user.id } })
      ]);
      setBookings(bookingResponse.data.data?.data || []);
      setWishlist((wishlistResponse.data.data?.data || []).map(mapBackendTour));
      setReviews(reviewResponse.data.data?.data || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Your account data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  }, [user]);

  useEffect(() => () => {
    if (profilePhotoUrl.current) URL.revokeObjectURL(profilePhotoUrl.current);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const reviewedTourIds = useMemo(
    () => new Set(reviews.map((review) => getReferenceId(review.tour))),
    [reviews]
  );
  const completedBookings = bookings.filter(isReviewEligible);
  const upcomingBookings = bookings.filter((booking) =>
    booking.status === 'confirmed' && !isReviewEligible(booking)
  );

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const croppedPhoto = profilePhoto
        ? await createCroppedProfilePhoto(profilePhoto, cropZoom, cropX, cropY)
        : undefined;
      await updateUser(
        { name: name.trim(), email: email.trim(), phone: phone.trim() },
        croppedPhoto
      );
      setProfilePhoto(null);
      setProfilePhotoPreview('');
      if (profilePhotoUrl.current) URL.revokeObjectURL(profilePhotoUrl.current);
      profilePhotoUrl.current = null;
      showToast('Profile updated.', 'success');
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Profile could not be saved.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (booking: BookingRecord) => {
    if (booking.paid || booking.status !== 'pending') {
      showToast('Only unpaid pending bookings can be cancelled here.', 'error');
      return;
    }
    if (!window.confirm('Cancel this pending booking?')) return;
    try {
      await apiClient.patch(`/bookings/${encodeURIComponent(booking._id)}/cancel`);
      showToast('Pending booking cancelled.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Booking could not be cancelled.'), 'error');
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewBooking || !reviewText.trim()) return;
    const tourId = getReferenceId(reviewBooking.tour);
    if (!tourId) {
      showToast('The tour linked to this booking is unavailable.', 'error');
      return;
    }
    try {
      await apiClient.post(`/tours/${encodeURIComponent(tourId)}/reviews`, {
        rating: reviewRating,
        review: reviewText.trim()
      });
      setReviewBooking(null);
      setReviewText('');
      setReviewRating(5);
      showToast('Your verified tour review was published.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Review could not be submitted.'), 'error');
    }
  };

  const updateReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingReview || !editText.trim()) return;
    try {
      await apiClient.patch(`/reviews/${encodeURIComponent(editingReview._id)}`, {
        rating: editRating,
        review: editText.trim()
      });
      setEditingReview(null);
      showToast('Review updated.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Review could not be updated.'), 'error');
    }
  };

  const deleteReview = async (review: ReviewRecord) => {
    if (!window.confirm('Delete this review? This will remove its rating from the tour.')) return;
    try {
      await apiClient.delete(`/reviews/${encodeURIComponent(review._id)}`);
      showToast('Review deleted.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Review could not be deleted.'), 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', to: '/account', icon: CircleUserRound },
    { id: 'bookings', label: 'Bookings', to: '/account/bookings', icon: CalendarDays },
    { id: 'wishlist', label: 'Saved tours', to: '/account/wishlist', icon: Heart },
    { id: 'reviews', label: 'Reviews', to: '/account/reviews', icon: MessageSquareText },
    { id: 'profile', label: 'Profile', to: '/account/profile', icon: CircleUserRound }
  ];

  if (!user) return null;
  const memberSince = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-slate-50 py-6 text-slate-800 transition-colors dark:bg-[#0B0F19] dark:text-slate-100 sm:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111726] lg:sticky lg:top-24">
            <div className="flex items-center gap-4 p-5">
              <img src={user.photo} alt={`${user.name}'s profile`} className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-violet-100 dark:ring-violet-950" />
              <div className="min-w-0">
                <h2 className="truncate text-base font-black text-slate-900 dark:text-white">{user.name}</h2>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">Traveller account</p>
              </div>
            </div>
            <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Member since</p>
              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{memberSince}</p>
            </div>
            <nav className="flex gap-1 overflow-x-auto border-t border-slate-200 p-3 dark:border-slate-800 lg:flex-col" aria-label="Account sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    to={tab.to}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition lg:w-full ${
                      activeTab === tab.id
                        ? 'bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">My account</p>
                <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white">
                  {activeTab === 'overview' ? 'Dashboard' : tabs.find((tab) => tab.id === activeTab)?.label}
                </h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage your bookings, profile and saved travel plans.</p>
              </div>
              <Link to="/tours" className="rounded-xl bg-violet-700 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-violet-800">
                Explore tours
              </Link>
            </header>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 font-bold">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-emerald-700" aria-label="Loading account data" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Total bookings', value: bookings.length, icon: CalendarDays },
                    { label: 'Saved tours', value: wishlist.length, icon: Heart },
                    { label: 'Reviews written', value: reviews.length, icon: Star }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111726]">
                        <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                        <strong className="mt-1 block text-2xl font-black text-slate-900 dark:text-white">{item.value}</strong>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Recent bookings</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Live booking records from your account</p>
                    </div>
                    <Link to="/account/bookings" className="text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-300">View all</Link>
                  </div>
                  {bookings.length ? (
                    <BookingList bookings={bookings.slice(0, 3)} onCancel={cancelBooking} />
                  ) : (
                    <EmptyState title="No bookings yet" detail="Your confirmed and pending tour bookings will appear here." />
                  )}
                </div>

                {upcomingBookings.length > 0 && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                    You have {upcomingBookings.length} upcoming tour{upcomingBookings.length === 1 ? '' : 's'} in your itinerary.
                  </div>
                )}
              </section>
            )}

            {activeTab === 'bookings' && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                <div className="mb-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">My bookings</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Only bookings attached to your verified account are shown.</p>
                </div>
                {bookings.length ? <BookingList bookings={bookings} onCancel={cancelBooking} /> : <EmptyState title="No bookings yet" detail="Browse tours and your reservations will appear here." />}
              </section>
            )}

            {activeTab === 'wishlist' && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-slate-900 dark:text-white">Saved tours</h2>
                {wishlist.length ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {wishlist.map((tour) => <TourCard key={tour.id} tour={tour} />)}
                  </div>
                ) : (
                  <EmptyState title="Your wishlist is empty" detail="Save a tour from its listing to keep it here." />
                )}
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                  <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Review a completed tour</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ratings are available only after a paid tour is complete. The server verifies eligibility.</p>
                  <div className="mt-5 space-y-3">
                    {completedBookings.filter((booking) => !reviewedTourIds.has(getReferenceId(booking.tour))).map((booking) => (
                      <div key={booking._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <strong className="block text-sm text-slate-900 dark:text-white">{getReferenceName(booking.tour)}</strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Travel date: {formatDate(booking.startDate)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReviewBooking(booking); setReviewText(''); setReviewRating(5); }}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                        >
                          Write review
                        </button>
                      </div>
                    ))}
                    {completedBookings.every((booking) => reviewedTourIds.has(getReferenceId(booking.tour))) && (
                      <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        No eligible completed tours are waiting for a review.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                  <h2 className="mb-4 font-heading text-xl font-bold text-slate-900 dark:text-white">Your reviews</h2>
                  {reviews.length ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reviews.map((review) => (
                        <article key={review._id} className="py-5 first:pt-0 last:pb-0">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{getReferenceName(review.tour)}</h3>
                              <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300"><Star className="h-3.5 w-3.5 fill-current" /> {review.rating} / 5 · {formatDate(review.createdAt)}</p>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => { setEditingReview(review); setEditText(review.review); setEditRating(review.rating); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-slate-700">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button type="button" onClick={() => void deleteReview(review)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:text-rose-300">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{review.review}</p>
                          {review.guideResponse?.text && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                              <strong className="mb-1 block text-slate-800 dark:text-white">Guide response</strong>
                              {review.guideResponse.text}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No reviews yet" detail="After completing a paid tour, you can leave a verified rating and review." />
                  )}
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                <div className="mb-6 flex items-center gap-3">
                  <CircleUserRound className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Profile details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Changes are saved to your MongoDB account.</p>
                  </div>
                </div>
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <img
                          src={profilePhotoPreview || user.photo}
                          alt="Profile photo preview"
                          className="h-full w-full object-cover"
                          style={profilePhotoPreview ? {
                            objectPosition: `${cropX}% ${cropY}%`,
                            transform: `scale(${cropZoom})`
                          } : undefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Profile picture
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="input-field mt-1 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-800"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = '';
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                showToast('Choose a profile picture smaller than 5 MB.', 'error');
                                return;
                              }
                              if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                                showToast('Profile pictures must be JPG, PNG, or WebP images.', 'error');
                                return;
                              }
                              if (profilePhotoUrl.current) URL.revokeObjectURL(profilePhotoUrl.current);
                              profilePhotoUrl.current = URL.createObjectURL(file);
                              setProfilePhotoPreview(profilePhotoUrl.current);
                              setProfilePhoto(file);
                              setCropZoom(1);
                              setCropX(50);
                              setCropY(50);
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose a JPG, PNG, or WebP image up to 5 MB, then adjust the square crop.</p>
                      </div>
                    </div>
                    {profilePhotoPreview && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Zoom: {cropZoom.toFixed(1)}×
                          <input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} aria-label="Profile picture zoom" className="mt-2 block w-full accent-emerald-700" />
                        </label>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Horizontal position
                          <input type="range" min="0" max="100" step="1" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} aria-label="Profile picture horizontal crop position" className="mt-2 block w-full accent-emerald-700" />
                        </label>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Vertical position
                          <input type="range" min="0" max="100" step="1" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} aria-label="Profile picture vertical crop position" className="mt-2 block w-full accent-emerald-700" />
                        </label>
                      </div>
                    )}
                  </div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full name
                    <input className="input-field mt-1" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required />
                  </label>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email address
                    <input className="input-field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </label>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone number
                    <input className="input-field mt-1" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={25} />
                  </label>
                  <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <CreditCard className="h-4 w-4 shrink-0" />
                    Account role: <strong className="capitalize">{user.role === 'lead-guide' ? 'Lead guide' : user.role}</strong>. Only an administrator can change privileged roles.
                  </p>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                    {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save profile
                  </button>
                </form>
              </section>
            )}
          </>
        )}
          </div>
        </div>
      </div>

      {reviewBooking && (
        <Modal title={`Review ${getReferenceName(reviewBooking.tour)}`} onClose={() => setReviewBooking(null)}>
          <form onSubmit={submitReview} className="space-y-4">
            <div className="flex items-center gap-1" aria-label={`Selected rating: ${reviewRating} out of 5`}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} type="button" onClick={() => setReviewRating(rating)} aria-label={`${rating} stars`} className="p-1 text-amber-500">
                  <Star className={`h-5 w-5 ${rating <= reviewRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <textarea className="input-field min-h-32" value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="How was your tour?" minLength={5} maxLength={1000} required />
            <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Publish verified review</button>
          </form>
        </Modal>
      )}

      {editingReview && (
        <Modal title="Edit your review" onClose={() => setEditingReview(null)}>
          <form onSubmit={updateReview} className="space-y-4">
            <div className="flex items-center gap-1" aria-label={`Selected rating: ${editRating} out of 5`}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} type="button" onClick={() => setEditRating(rating)} aria-label={`${rating} stars`} className="p-1 text-amber-500">
                  <Star className={`h-5 w-5 ${rating <= editRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <textarea className="input-field min-h-32" value={editText} onChange={(event) => setEditText(event.target.value)} minLength={5} maxLength={1000} required />
            <button className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">Save changes</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const BookingList: React.FC<{
  bookings: BookingRecord[];
  onCancel: (booking: BookingRecord) => void;
}> = ({ bookings, onCancel }) => (
  <div className="divide-y divide-slate-200 dark:divide-slate-800">
    {bookings.map((booking) => (
      <article key={booking._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link to={`/tours/${getReferenceId(booking.tour)}`} className="block truncate text-sm font-bold text-slate-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300">
            {getReferenceName(booking.tour)}
          </Link>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatDate(booking.startDate)} · {booking.numGuests || 1} traveller{booking.numGuests === 1 ? '' : 's'} · Ref {booking._id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
            {booking.paymentStatus.replace('_', ' ')} · {booking.status.replace('_', ' ')}
            {booking.tripProgress && booking.tripProgress !== 'scheduled' ? ` · ${booking.tripProgress.replace('_', ' ')}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <strong className="text-sm font-black text-slate-900 dark:text-white">₹{Number(booking.price || 0).toLocaleString('en-IN')}</strong>
          {!booking.paid && booking.status === 'pending' && (
            <button type="button" onClick={() => void onCancel(booking)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:text-rose-300">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
        </div>
      </article>
    ))}
  </div>
);

const EmptyState: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
    <Heart className="mx-auto h-7 w-7 text-slate-400" />
    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
  </div>
);

const createCroppedProfilePhoto = async (
  file: File,
  zoom: number,
  horizontalPosition: number,
  verticalPosition: number
): Promise<Blob> => {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected profile picture could not be opened.'));
      image.src = imageUrl;
    });

    const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const sourceX = (image.naturalWidth - cropSize) * (horizontalPosition / 100);
    const sourceY = (image.naturalHeight - cropSize) * (verticalPosition / 100);
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the profile picture.');
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 500, 500);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('The adjusted profile picture could not be created.'));
      }, 'image/jpeg', 0.9);
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#111726]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </section>
  </div>
);
