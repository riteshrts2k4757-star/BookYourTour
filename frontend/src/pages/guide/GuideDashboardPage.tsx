import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiClient, getApiErrorMessage } from '../../services/apiClient';
import { mapBackendTour } from '../../services/mock/tourService';
import type { Tour } from '../../data/tours';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Star,
  Users
} from 'lucide-react';

interface ApiListResponse<T> {
  data?: {
    data?: T[];
  };
}

interface BackendTour {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  duration?: number;
  maxGroupSize?: number;
  difficulty?: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  price?: number;
  summary?: string;
  description?: string;
  imageCover?: string;
  images?: string[];
  startDates?: string[];
  startLocation?: { address?: string; description?: string; coordinates?: number[] };
  locations?: Array<{ description?: string; address?: string; coordinates?: number[]; day?: number; photo?: string }>;
  guides?: Array<string | { _id?: string; id?: string; name?: string; photo?: string }>;
  category?: string;
  featured?: boolean;
  itinerary?: Tour['itinerary'];
  included?: string[];
  excluded?: string[];
  highlights?: string[];
}

interface BackendReference {
  _id?: string;
  id?: string;
  name?: string;
  photo?: string;
}

interface AssignedBooking {
  _id: string;
  tour?: string | BackendReference;
  user?: string | BackendReference;
  startDate?: string;
  status: string;
  paymentStatus: string;
  tripProgress?: string;
  numGuests?: number;
  paid: boolean;
}

interface AssignedReview {
  _id: string;
  tour?: string | BackendReference;
  user?: string | BackendReference;
  rating: number;
  review: string;
  createdAt?: string;
  guideResponse?: {
    text?: string;
    updatedAt?: string;
    responder?: string | BackendReference;
  };
}

const referenceName = (reference: string | BackendReference | undefined) =>
  typeof reference === 'object' && reference ? reference.name || 'Tour' : 'Tour';

export const GuideDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [assignedTours, setAssignedTours] = useState<Tour[]>([]);
  const [assignedBookings, setAssignedBookings] = useState<AssignedBooking[]>([]);
  const [assignedReviews, setAssignedReviews] = useState<AssignedReview[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingReviewId, setSavingReviewId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tourResponse, bookingResponse, reviewResponse] = await Promise.all([
        apiClient.get<ApiListResponse<BackendTour>>('/tours/assigned'),
        apiClient.get<ApiListResponse<AssignedBooking>>('/bookings/assigned'),
        apiClient.get<ApiListResponse<AssignedReview>>('/reviews/assigned')
      ]);
      setAssignedTours((tourResponse.data.data?.data || []).map(mapBackendTour));
      setAssignedBookings(bookingResponse.data.data?.data || []);
      const reviews = reviewResponse.data.data?.data || [];
      setAssignedReviews(reviews);
      setResponses((current) => Object.fromEntries(reviews.map((review) => [
        review._id,
        current[review._id] ?? review.guideResponse?.text ?? ''
      ])));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Guide workspace data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateProgress = async (booking: AssignedBooking) => {
    const tripProgress = booking.tripProgress === 'in_progress' ? 'completed' : 'in_progress';
    try {
      await apiClient.patch(`/bookings/${encodeURIComponent(booking._id)}/progress`, { tripProgress });
      showToast(`Trip progress updated to ${tripProgress.replace('_', ' ')}.`, 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Trip progress could not be updated.'), 'error');
    }
  };

  const saveResponse = async (review: AssignedReview) => {
    const response = responses[review._id]?.trim() || '';
    if (!response) {
      showToast('Write a response before saving.', 'error');
      return;
    }
    setSavingReviewId(review._id);
    try {
      await apiClient.patch(`/reviews/${encodeURIComponent(review._id)}/guide-response`, { response });
      showToast('Your reply was saved.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Your reply could not be saved.'), 'error');
    } finally {
      setSavingReviewId('');
    }
  };

  const activeTrips = assignedBookings.filter((booking) =>
    booking.paid && booking.status === 'confirmed' && booking.tripProgress !== 'completed'
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-slate-800 transition-colors dark:bg-[#0B0F19] dark:text-slate-100 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <img src={user?.photo || '/img/users/default.jpg'} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Guide workspace</p>
              <h1 className="mt-1 font-heading text-2xl font-black">{user?.name}</h1>
              <p className="text-xs text-slate-300">{user?.email} · {user?.role === 'lead-guide' ? 'Lead guide' : 'Tour guide'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Metric icon={CalendarDays} label="Assigned tours" value={assignedTours.length} />
            <Metric icon={Users} label="Active trips" value={activeTrips.length} />
            <Metric icon={MessageSquareText} label="Reviews" value={assignedReviews.length} />
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={() => void loadData()} className="inline-flex shrink-0 items-center gap-2 font-bold">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-emerald-700" aria-label="Loading guide workspace" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
              <div className="mb-5">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Assigned tours</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tours assigned to your verified guide account</p>
              </div>
              {assignedTours.length ? (
                <div className="space-y-3">
                  {assignedTours.map((tour) => (
                    <Link key={tour.id} to={`/tours/${tour.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-600">
                      <img src={tour.imageCover} alt="" className="h-16 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-900 dark:text-white">{tour.name}</strong>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{tour.duration} days · {tour.startLocation.description}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Open</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState detail="No tours are currently assigned to this guide account." />
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
              <div className="mb-5">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Assigned bookings</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Progress updates are checked against the assigned tour and payment state.</p>
              </div>
              {assignedBookings.length ? (
                <div className="space-y-3">
                  {assignedBookings.map((booking) => {
                    const canUpdate = booking.paid &&
                      booking.status === 'confirmed' &&
                      booking.tripProgress !== 'completed';
                    const nextStep = booking.tripProgress === 'in_progress' ? 'Mark completed' : 'Start trip';
                    return (
                      <article key={booking._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <strong className="block text-sm text-slate-900 dark:text-white">{referenceName(booking.tour)}</strong>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Traveller: {referenceName(booking.user)} · {booking.numGuests || 1} guest{booking.numGuests === 1 ? '' : 's'}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {booking.status} · {booking.paymentStatus.replace('_', ' ')} · {(booking.tripProgress || 'scheduled').replace('_', ' ')}
                            </p>
                          </div>
                          {canUpdate && (
                            <button type="button" onClick={() => void updateProgress(booking)} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">
                              {nextStep}
                            </button>
                          )}
                          {booking.tripProgress === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState detail="No bookings are currently attached to your assigned tours." />
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726] lg:col-span-2">
              <div className="mb-5">
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Traveller reviews</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Reply to reviews on tours assigned to you. Guest ratings and review text remain unchanged.</p>
              </div>
              {assignedReviews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {assignedReviews.map((review) => (
                    <article key={review._id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="text-sm text-slate-900 dark:text-white">{referenceName(review.tour)}</strong>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">By {referenceName(review.user)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-300"><Star className="h-3.5 w-3.5 fill-current" /> {review.rating} / 5</span>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{review.review}</p>
                      <label className="mt-4 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your response
                        <textarea
                          value={responses[review._id] || ''}
                          onChange={(event) => setResponses((current) => ({ ...current, [review._id]: event.target.value }))}
                          className="input-field mt-1 min-h-24"
                          maxLength={1000}
                          placeholder="Thank the traveller or address their feedback..."
                        />
                      </label>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{responses[review._id]?.length || 0}/1000</span>
                        <button
                          type="button"
                          onClick={() => void saveResponse(review)}
                          disabled={savingReviewId === review._id}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          {savingReviewId === review._id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Save reply
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState detail="No reviews are available for your assigned tours." />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const Metric: React.FC<{ icon: typeof CalendarDays; label: string; value: number }> = ({ icon: Icon, label, value }) => (
  <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/5 px-3 py-2">
    <Icon className="h-4 w-4 text-emerald-300" />
    <strong className="mt-1 block text-lg font-black">{value}</strong>
    <span className="block text-[10px] text-slate-300">{label}</span>
  </div>
);

const EmptyState: React.FC<{ detail: string }> = ({ detail }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
    {detail}
  </div>
);
