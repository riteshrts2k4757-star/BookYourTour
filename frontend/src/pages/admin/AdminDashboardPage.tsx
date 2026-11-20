import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiClient, getApiErrorMessage } from '../../services/apiClient';
import { mapBackendTour } from '../../services/mock/tourService';
import type { Tour } from '../../data/tours';
import {
  BarChart3,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  Wallet,
  X
} from 'lucide-react';

type UserRole = 'user' | 'guide' | 'lead-guide' | 'admin';
type Section = 'overview' | 'users' | 'guides' | 'tours' | 'bookings' | 'reviews';

interface ApiListResponse<T> {
  data?: {
    data?: T[];
  };
}

interface ApiSingleResponse<T> {
  data?: {
    data?: T;
  };
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  active: boolean;
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
  priceDiscount?: number;
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
  secretTour?: boolean;
  itinerary?: Tour['itinerary'];
  included?: string[];
  excluded?: string[];
  highlights?: string[];
}

interface AdminBooking {
  _id: string;
  bookingReference?: string;
  user?: string | { _id?: string; name?: string; email?: string };
  tour?: string | { _id?: string; name?: string };
  startDate?: string;
  price: number;
  numGuests?: number;
  status: string;
  paymentStatus: string;
  paid: boolean;
}

interface AdminReview {
  _id: string;
  user?: string | { _id?: string; name?: string };
  tour?: string | { _id?: string; name?: string };
  rating: number;
  review: string;
  createdAt?: string;
  guideResponse?: { text?: string };
}

interface DashboardStats {
  users: number;
  activeUsers: number;
  tours: number;
  bookings: number;
  guides: number;
  reviews: number;
  grossVerifiedPayments: number;
  paymentCounts: Record<string, number>;
}

interface TourDraft {
  name: string;
  category: string;
  featured: boolean;
  duration: string;
  maxGroupSize: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  price: string;
  summary: string;
  imageCover: string;
  startDate: string;
  address: string;
  longitude: string;
  latitude: string;
}

const emptyDraft: TourDraft = {
  name: '',
  category: 'Tour',
  featured: false,
  duration: '3',
  maxGroupSize: '10',
  difficulty: 'easy',
  price: '',
  summary: '',
  imageCover: '',
  startDate: '',
  address: '',
  longitude: '',
  latitude: ''
};

const referenceName = (reference: AdminBooking['user'] | AdminBooking['tour'] | AdminReview['user'] | AdminReview['tour'], fallback: string) =>
  typeof reference === 'object' && reference && 'name' in reference && reference.name
    ? reference.name
    : fallback;

const formatDate = (date: string | undefined) => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
};

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const getInitialSection = (): Section => {
    if (location.pathname.includes('users')) return 'users';
    if (location.pathname.includes('guides')) return 'guides';
    if (location.pathname.includes('tours')) return 'tours';
    if (location.pathname.includes('bookings')) return 'bookings';
    if (location.pathname.includes('reviews')) return 'reviews';
    if (location.pathname.includes('analytics')) return 'overview';
    return 'overview';
  };

  const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showTourForm, setShowTourForm] = useState(false);
  const [tourDraft, setTourDraft] = useState<TourDraft>(emptyDraft);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [savingTour, setSavingTour] = useState(false);

  useEffect(() => {
    setActiveSection(getInitialSection());
  }, [location.pathname]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, usersResponse, toursResponse, bookingsResponse, reviewsResponse] = await Promise.all([
        apiClient.get<ApiSingleResponse<DashboardStats>>('/admin/stats'),
        apiClient.get<ApiListResponse<AdminUser>>('/users'),
        apiClient.get<ApiListResponse<BackendTour>>('/tours/manage'),
        apiClient.get<ApiListResponse<AdminBooking>>('/bookings'),
        apiClient.get<ApiListResponse<AdminReview>>('/reviews')
      ]);
      setStats(statsResponse.data.data?.data || null);
      setUsers(usersResponse.data.data?.data || []);
      setTours((toursResponse.data.data?.data || []).map(mapBackendTour));
      setBookings(bookingsResponse.data.data?.data || []);
      setReviews(reviewsResponse.data.data?.data || []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Admin data could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const roleFiltered = activeSection === 'guides'
      ? users.filter((account) => account.role === 'guide' || account.role === 'lead-guide')
      : users;
    return query
      ? roleFiltered.filter((account) => `${account.name} ${account.email} ${account.role}`.toLowerCase().includes(query))
      : roleFiltered;
  }, [activeSection, search, users]);

  const filteredTours = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? tours.filter((tour) => `${tour.name} ${tour.category} ${tour.startLocation.description}`.toLowerCase().includes(query))
      : tours;
  }, [search, tours]);

  const closeTourForm = () => {
    setShowTourForm(false);
    setEditingTourId(null);
    setTourDraft(emptyDraft);
  };

  const editTour = (tour: Tour) => {
    setEditingTourId(tour.id);
    setTourDraft({
      name: tour.name,
      category: tour.category || 'Tour',
      featured: tour.featured,
      duration: String(tour.duration),
      maxGroupSize: String(tour.maxGroupSize),
      difficulty: tour.difficulty,
      price: String(tour.price),
      summary: tour.summary,
      imageCover: tour.imageCover,
      startDate: tour.startDates[0]?.slice(0, 10) || '',
      address: tour.startLocation.address,
      longitude: String(tour.startLocation.coordinates[0]),
      latitude: String(tour.startLocation.coordinates[1])
    });
    setShowTourForm(true);
  };

  const startTourForm = () => {
    setEditingTourId(null);
    setTourDraft(emptyDraft);
    setShowTourForm(true);
  };

  const changeUser = async (target: AdminUser, updates: Partial<Pick<AdminUser, 'role' | 'active'>>) => {
    try {
      await apiClient.patch(`/users/${encodeURIComponent(target._id)}`, updates);
      showToast('User account updated.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'User account could not be updated.'), 'error');
    }
  };

  const toggleTourVisibility = async (tour: Tour) => {
    const secretTour = !tour.secretTour;
    try {
      await apiClient.patch(`/tours/${encodeURIComponent(tour.id)}`, { secretTour });
      showToast(secretTour ? 'Tour hidden from public listings.' : 'Tour published.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Tour visibility could not be updated.'), 'error');
    }
  };

  const assignTourGuides = async (tour: Tour, guideId: string, assigned: boolean) => {
    const guideIds = new Set(tour.guides);
    if (assigned) guideIds.add(guideId);
    else guideIds.delete(guideId);

    try {
      await apiClient.patch(`/tours/${encodeURIComponent(tour.id)}`, { guides: Array.from(guideIds) });
      showToast('Tour guide assignments saved.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Tour guide assignments could not be saved.'), 'error');
    }
  };

  const deleteTour = async (tour: Tour) => {
    if (!window.confirm(`Delete "${tour.name}"? Tours with booking history cannot be deleted.`)) return;
    try {
      await apiClient.delete(`/tours/${encodeURIComponent(tour.id)}`);
      showToast('Tour deleted.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Tour could not be deleted.'), 'error');
    }
  };

  const saveTour = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingTour(true);
    try {
      const existingTour = editingTourId ? tours.find((tour) => tour.id === editingTourId) : undefined;
      const existingStartDates = existingTour?.startDates || [];
      const startDates = editingTourId
        ? !tourDraft.startDate || existingStartDates[0]?.slice(0, 10) === tourDraft.startDate
          ? existingStartDates
          : [tourDraft.startDate, ...existingStartDates.slice(1)]
        : tourDraft.startDate ? [tourDraft.startDate] : [];
      const tourData = {
        name: tourDraft.name.trim(),
        category: tourDraft.category,
        featured: tourDraft.featured,
        duration: Number(tourDraft.duration),
        maxGroupSize: Number(tourDraft.maxGroupSize),
        difficulty: tourDraft.difficulty,
        price: Number(tourDraft.price),
        summary: tourDraft.summary.trim(),
        description: tourDraft.summary.trim(),
        imageCover: tourDraft.imageCover.trim(),
        startDates,
        startLocation: {
          type: 'Point',
          address: tourDraft.address.trim(),
          description: tourDraft.address.trim(),
          coordinates: [Number(tourDraft.longitude), Number(tourDraft.latitude)]
        }
      };
      if (editingTourId) {
        await apiClient.patch(`/tours/${encodeURIComponent(editingTourId)}`, tourData);
      } else {
        await apiClient.post('/tours', tourData);
      }
      closeTourForm();
      showToast(editingTourId ? 'Tour updated in MongoDB.' : 'Tour saved to MongoDB.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Tour could not be saved.'), 'error');
    } finally {
      setSavingTour(false);
    }
  };

  const cancelBooking = async (booking: AdminBooking) => {
    if (booking.paid || booking.status !== 'pending') {
      showToast('Only unpaid pending bookings can be cancelled.', 'error');
      return;
    }
    if (!window.confirm('Cancel this pending booking?')) return;
    try {
      await apiClient.patch(`/bookings/${encodeURIComponent(booking._id)}`, { status: 'cancelled' });
      showToast('Pending booking cancelled.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Booking could not be cancelled.'), 'error');
    }
  };

  const refundBooking = async (booking: AdminBooking) => {
    if (!window.confirm(`Request a payment-provider refund for booking ${booking.bookingReference || booking._id}?`)) return;
    try {
      await apiClient.post(`/bookings/${encodeURIComponent(booking._id)}/refund`);
      showToast('Refund request submitted to the payment provider.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Refund request could not be submitted.'), 'error');
    }
  };

  const deleteReview = async (review: AdminReview) => {
    if (!window.confirm('Delete this traveller review and recalculate the tour rating?')) return;
    try {
      await apiClient.delete(`/reviews/${encodeURIComponent(review._id)}`);
      showToast('Review deleted.', 'success');
      await loadData();
    } catch (requestError) {
      showToast(getApiErrorMessage(requestError, 'Review could not be deleted.'), 'error');
    }
  };

  const tabs: Array<{ id: Section; label: string; icon: typeof BarChart3; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & roles', icon: Users, count: users.length },
    { id: 'guides', label: 'Guides', icon: Compass, count: users.filter((account) => account.role === 'guide' || account.role === 'lead-guide').length },
    { id: 'tours', label: 'Tours', icon: Compass, count: tours.length },
    { id: 'bookings', label: 'Bookings', icon: Wallet, count: bookings.length },
    { id: 'reviews', label: 'Reviews', icon: MessageSquareText, count: reviews.length }
  ];

  const userCounts = users.reduce<Record<UserRole, number>>((counts, account) => {
    counts[account.role] += 1;
    return counts;
  }, { user: 0, guide: 0, 'lead-guide': 0, admin: 0 });

  return (
    <div className="min-h-screen bg-slate-50 py-6 text-slate-800 transition-colors dark:bg-[#0B0F19] dark:text-slate-100 sm:py-8">
      <aside className="fixed bottom-0 left-0 top-20 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-[#111726] lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white"><Shield className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">Admin panel</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sarthi management</p>
          </div>
        </div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <nav className="space-y-1" aria-label="Admin sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveSection(tab.id); setSearch(''); }}
                aria-pressed={activeSection === tab.id}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  activeSection === tab.id
                    ? 'bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
                {tab.count !== undefined && <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] dark:bg-slate-700">{tab.count}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Administrator</p>
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">Administrator workspace</p>
            <h1 className="mt-1 font-heading text-2xl font-black text-slate-900 dark:text-white">
              {tabs.find((tab) => tab.id === activeSection)?.label || 'Overview'}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Manage your travel platform.</p>
          </div>
          <button type="button" onClick={() => void loadData()} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold hover:bg-slate-100 dark:border-slate-700 dark:bg-[#111726] dark:hover:bg-slate-800">
            <RefreshCw className="h-4 w-4" /> Refresh data
          </button>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Admin sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveSection(tab.id); setSearch(''); }}
                aria-pressed={activeSection === tab.id}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  activeSection === tab.id
                    ? 'border-violet-700 bg-violet-700 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

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
            <LoaderCircle className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-200" aria-label="Loading admin data" />
          </div>
        ) : (
          <>
            {activeSection === 'overview' && (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
                  <Metric label="Total tours" value={stats?.tours ?? tours.length} note="MongoDB catalog records" icon={Compass} />
                  <Metric label="Active listings" value={tours.filter((tour) => !tour.secretTour).length} note="Visible to travellers" icon={Eye} />
                  <Metric label="Bookings" value={stats?.bookings ?? bookings.length} note={`${stats?.paymentCounts.paid || 0} paid`} icon={Wallet} />
                  <Metric label="Tour guides" value={stats?.guides ?? users.filter((account) => account.role === 'guide' || account.role === 'lead-guide').length} note="Guide accounts" icon={Shield} />
                  <Metric label="All users" value={stats?.users ?? users.length} note={`${stats?.activeUsers ?? users.filter((account) => account.active).length} active accounts`} icon={Users} />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Database user distribution</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Counts returned from the protected user collection.</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {([
                        ['Travellers', userCounts.user],
                        ['Guides', userCounts.guide],
                        ['Lead guides', userCounts['lead-guide']],
                        ['Administrators', userCounts.admin]
                      ] as const).map(([label, count]) => (
                        <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                          <strong className="mt-1 block text-2xl font-black text-slate-900 dark:text-white">{count}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Verified revenue</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Totals are based on payment states stored by the backend.</p>
                    <strong className="mt-5 block text-3xl font-black text-slate-900 dark:text-white">
                      ₹{Number(stats?.grossVerifiedPayments || 0).toLocaleString('en-IN')}
                    </strong>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No sample analytics or simulated transactions are included.</p>
                  </section>
                </div>
              </section>
            )}

            {(activeSection === 'users' || activeSection === 'guides') && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{activeSection === 'guides' ? 'Guide accounts' : 'All database users'}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Loaded from MongoDB. Role and account status changes are server-authorized.</p>
                  </div>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} className="input-field max-w-sm" placeholder="Search name, email or role" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-700">
                        <th className="px-3 py-3">Account</th>
                        <th className="px-3 py-3">Role</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Change role</th>
                        <th className="px-3 py-3 text-right">Account access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((account) => {
                        const isCurrentAdmin = account._id === user?.id;
                        const photo = account.photo
                          ? account.photo.startsWith('http') || account.photo.startsWith('/') ? account.photo : `/img/users/${encodeURIComponent(account.photo)}`
                          : '/img/users/default.jpg';
                        return (
                          <tr key={account._id}>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <img src={photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                                <div className="min-w-0">
                                  <strong className="block truncate text-slate-900 dark:text-white">{account.name}</strong>
                                  <span className="block truncate text-slate-500 dark:text-slate-400">{account.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 capitalize text-slate-600 dark:text-slate-300">{account.role.replace('-', ' ')}</td>
                            <td className="px-3 py-3">
                              <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${account.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'}`}>
                                {account.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <select
                                aria-label={`Change role for ${account.name}`}
                                value={account.role}
                                disabled={isCurrentAdmin}
                                onChange={(event) => void changeUser(account, { role: event.target.value as UserRole })}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                              >
                                <option value="user">Traveller</option>
                                <option value="guide">Guide</option>
                                <option value="lead-guide">Lead guide</option>
                                <option value="admin">Administrator</option>
                              </select>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                disabled={isCurrentAdmin}
                                onClick={() => void changeUser(account, { active: !account.active })}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                {account.active ? 'Deactivate' : 'Reactivate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No matching user accounts.</p>}
                </div>
              </section>
            )}

            {activeSection === 'tours' && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111726]">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Tour catalog</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage the published tours and treks stored in MongoDB.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input value={search} onChange={(event) => setSearch(event.target.value)} className="input-field pl-9 sm:w-64" placeholder="Search tours" aria-label="Search tours" />
                    </label>
                    <button type="button" onClick={startTourForm} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-800">
                      <Plus className="h-4 w-4" /> Add tour
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Tour</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Guides</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredTours.map((tour) => (
                        <tr key={tour.id} className="align-middle">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={tour.imageCover} alt="" className="h-11 w-14 rounded-lg object-cover" />
                              <div className="min-w-0">
                                <strong className="block max-w-64 truncate text-sm text-slate-900 dark:text-white">{tour.name}</strong>
                                <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{tour.duration} days · {tour.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                            <span className="inline-flex max-w-48 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{tour.startLocation.description}</span>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200">₹{tour.price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-4">
                            <details className="group relative">
                              <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-center font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                {tour.guides.length} assigned
                              </summary>
                              <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <p className="mb-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">Assign active guides</p>
                                {users.filter((account) => account.active && (account.role === 'guide' || account.role === 'lead-guide')).map((guide) => (
                                  <label key={guide._id} className="flex items-center gap-2 py-1.5 text-xs text-slate-700 dark:text-slate-200">
                                    <input type="checkbox" checked={tour.guides.includes(guide._id)} onChange={(event) => void assignTourGuides(tour, guide._id, event.target.checked)} className="accent-violet-700" />
                                    {guide.name}
                                  </label>
                                ))}
                                {!users.some((account) => account.active && (account.role === 'guide' || account.role === 'lead-guide')) && <p className="text-[11px] text-slate-500">No active guide accounts yet.</p>}
                              </div>
                            </details>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tour.secretTour ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'}`}>
                              {tour.secretTour ? 'Hidden' : 'Published'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button type="button" onClick={() => editTour(tour)} title={`Edit ${tour.name}`} aria-label={`Edit ${tour.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/50 dark:hover:text-violet-300"><Pencil className="h-4 w-4" /></button>
                              <button type="button" onClick={() => void toggleTourVisibility(tour)} title={tour.secretTour ? 'Publish tour' : 'Hide tour'} aria-label={tour.secretTour ? 'Publish tour' : 'Hide tour'} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">{tour.secretTour ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                              <button type="button" onClick={() => void deleteTour(tour)} title={`Delete ${tour.name}`} aria-label={`Delete ${tour.name}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTours.length === 0 && <p className="py-10 text-center text-xs text-slate-500">{search ? 'No tours match your search.' : 'No tours are stored in the database.'}</p>}
                </div>
              </section>
            )}

            {activeSection === 'bookings' && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                <h2 className="mb-5 font-heading text-xl font-bold text-slate-900 dark:text-white">Platform bookings</h2>
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <article key={booking._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <strong className="block text-sm text-slate-900 dark:text-white">{referenceName(booking.tour, 'Tour')}</strong>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {referenceName(booking.user, 'Account')} · {booking.bookingReference || booking._id} · {formatDate(booking.startDate)}
                        </p>
                        <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">{booking.paymentStatus.replace('_', ' ')} · {booking.status}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-sm font-black text-slate-900 dark:text-white">₹{Number(booking.price).toLocaleString('en-IN')}</strong>
                        {booking.paid && booking.paymentStatus === 'paid' ? (
                          <button type="button" onClick={() => void refundBooking(booking)} className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/30">Request refund</button>
                        ) : booking.status === 'pending' && !booking.paid ? (
                          <button type="button" onClick={() => void cancelBooking(booking)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:text-rose-300">Cancel pending</button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                  {bookings.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No bookings are currently stored in the database.</p>}
                </div>
              </section>
            )}

            {activeSection === 'reviews' && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111726]">
                <h2 className="mb-2 font-heading text-xl font-bold text-slate-900 dark:text-white">Traveller reviews</h2>
                <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">Reviews are public records. Admins can remove content; ratings are recalculated by the server.</p>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {reviews.map((review) => (
                    <article key={review._id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-slate-900 dark:text-white">{referenceName(review.tour, 'Tour')}</strong>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-300">★ {review.rating}/5</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">By {referenceName(review.user, 'Traveller')} · {formatDate(review.createdAt)}</p>
                        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{review.review}</p>
                        {review.guideResponse?.text && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300"><strong>Guide reply:</strong> {review.guideResponse.text}</p>}
                      </div>
                      <button type="button" onClick={() => void deleteReview(review)} className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:text-rose-300">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </article>
                  ))}
                  {reviews.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No reviews are currently stored in the database.</p>}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showTourForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeTourForm();
        }}>
          <section role="dialog" aria-modal="true" aria-label={editingTourId ? 'Edit tour' : 'Create tour'} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#111726]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{editingTourId ? 'Edit tour' : 'Create a tour'}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tour content is saved to MongoDB.</p>
              </div>
              <button type="button" onClick={closeTourForm} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={saveTour} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Tour name
                <input className="input-field mt-1" value={tourDraft.name} onChange={(event) => setTourDraft({ ...tourDraft, name: event.target.value })} minLength={10} maxLength={40} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category
                <select className="input-field mt-1" value={tourDraft.category} onChange={(event) => setTourDraft({ ...tourDraft, category: event.target.value })}>
                  <option value="Tour">Tour</option>
                  <option value="Trek">Trek</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Beach">Beach</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Mountain">Mountain</option>
                  <option value="Nature">Nature</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 self-end pb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={tourDraft.featured} onChange={(event) => setTourDraft({ ...tourDraft, featured: event.target.checked })} className="accent-emerald-700" />
                Feature on homepage
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Summary
                <textarea className="input-field mt-1 min-h-20" value={tourDraft.summary} onChange={(event) => setTourDraft({ ...tourDraft, summary: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Cover image URL or backend image filename
                <input className="input-field mt-1" value={tourDraft.imageCover} onChange={(event) => setTourDraft({ ...tourDraft, imageCover: event.target.value })} placeholder="https://... or tour-image.jpeg" required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (days)
                <input className="input-field mt-1" type="number" min={1} value={tourDraft.duration} onChange={(event) => setTourDraft({ ...tourDraft, duration: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Maximum group size
                <input className="input-field mt-1" type="number" min={1} value={tourDraft.maxGroupSize} onChange={(event) => setTourDraft({ ...tourDraft, maxGroupSize: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (₹)
                <input className="input-field mt-1" type="number" min={1} value={tourDraft.price} onChange={(event) => setTourDraft({ ...tourDraft, price: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty
                <select className="input-field mt-1" value={tourDraft.difficulty} onChange={(event) => setTourDraft({ ...tourDraft, difficulty: event.target.value as TourDraft['difficulty'] })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="difficult">Difficult</option>
                </select>
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">First departure date
                <input className="input-field mt-1" type="date" min={new Date().toISOString().slice(0, 10)} value={tourDraft.startDate} onChange={(event) => setTourDraft({ ...tourDraft, startDate: event.target.value })} />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Start location address
                <input className="input-field mt-1" value={tourDraft.address} onChange={(event) => setTourDraft({ ...tourDraft, address: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Longitude
                <input className="input-field mt-1" type="number" step="any" min={-180} max={180} value={tourDraft.longitude} onChange={(event) => setTourDraft({ ...tourDraft, longitude: event.target.value })} required />
              </label>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Latitude
                <input className="input-field mt-1" type="number" step="any" min={-90} max={90} value={tourDraft.latitude} onChange={(event) => setTourDraft({ ...tourDraft, latitude: event.target.value })} required />
              </label>
              <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                <button type="button" onClick={closeTourForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold dark:border-slate-700">Cancel</button>
                <button type="submit" disabled={savingTour} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-800 disabled:opacity-50">
                  {savingTour ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {editingTourId ? 'Save changes' : 'Create tour'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ label: string; value: number; note: string; icon: typeof Users }> = ({ label, value, note, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111726]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <strong className="mt-1 block text-2xl font-black text-slate-900 dark:text-white">{value}</strong>
      </div>
      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
    </div>
    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">{note}</p>
  </div>
);
