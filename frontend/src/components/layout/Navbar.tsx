import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { getApiErrorMessage } from '../../services/apiClient';
import {
  Bus,
  Car,
  ChevronDown,
  Globe2,
  Heart,
  Hotel,
  LogOut,
  Menu,
  Moon,
  Plane,
  Search,
  Shield,
  Sun,
  Train,
  UserRound,
  Watch,
  X
} from 'lucide-react';

const primaryLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/tours', label: 'Tours & Treks' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/hotels', label: 'Hotels' },
  { to: '/naviband', label: 'NaviBand' }
];

const additionalLinks = [
  { to: '/flights', label: 'Flights', icon: Plane },
  { to: '/trains', label: 'Trains', icon: Train },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/road-trips', label: 'Road trips', icon: Car }
];

const dashboardPath = (role: string) =>
  role === 'admin' ? '/admin' : role === 'guide' || role === 'lead-guide' ? '/guide' : '/account';

export const Navbar: React.FC = () => {
  const { user, role, logout, loading, authError } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('INR (₹)');
  const isHome = pathname === '/';
  const headerSurface = isHome
    ? 'border-white/30 bg-white/80 dark:border-white/10 dark:bg-slate-950/75'
    : 'border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-[#0B0F19]/90';

  const closeNavigation = () => {
    setMobileDrawerOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    closeNavigation();
    logout()
      .then(() => showToast('Signed out successfully.', 'info'))
      .catch((error) => showToast(getApiErrorMessage(error, 'Sign out could not be confirmed by the server.'), 'error'))
      .finally(() => navigate('/', { replace: true }));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/tours?q=${encodeURIComponent(query)}`);
    setSearchQuery('');
    closeNavigation();
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  return (
    <>
      <header className={`fixed inset-x-0 top-3 z-50 mx-auto hidden h-16 w-[calc(100%-3rem)] max-w-[1440px] items-center gap-6 rounded-full border px-5 text-slate-800 shadow-lg backdrop-blur-xl dark:text-slate-100 xl:flex ${headerSurface}`}>
        <Link to="/" onClick={closeNavigation} className="flex shrink-0 items-center gap-3" aria-label="Sarthi home">
          <img src="/sarthi-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
          <span className="font-heading text-lg font-extrabold tracking-[0.12em] text-slate-900 dark:text-white">SARTHI</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1" aria-label="Main navigation">
          {primaryLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : false} onClick={closeNavigation} className={linkStyle}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {loading && !user && <span role="status" className="hidden text-[11px] text-slate-500 2xl:inline">Checking session…</span>}
          {authError && <span role="status" className="hidden max-w-40 truncate text-[11px] text-amber-700 2xl:inline dark:text-amber-300">{authError}</span>}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => { setMoreOpen((open) => !open); setAccountOpen(false); }}
              aria-expanded={moreOpen}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              More <ChevronDown className="h-4 w-4" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#111726]">
                {additionalLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={closeNavigation} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    <Icon className="h-4 w-4 text-violet-600 dark:text-violet-300" /> {label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-slate-200 px-3 pt-3 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Globe2 className="h-4 w-4" />
                    Currency
                    <select
                      aria-label="Currency display preference"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => { setAccountOpen((open) => !open); setMoreOpen(false); }}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <img src={user.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                <span className="max-w-28 truncate text-xs font-bold">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#111726]">
                  <Link to={dashboardPath(role)} onClick={closeNavigation} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
                    {role === 'admin' ? <Shield className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                    {role === 'admin' ? 'Admin dashboard' : role === 'guide' || role === 'lead-guide' ? 'Guide dashboard' : 'My account'}
                  </Link>
                  {role === 'user' && (
                    <>
                      <Link to="/account/bookings" onClick={closeNavigation} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Hotel className="h-4 w-4" /> My bookings
                      </Link>
                      <Link to="/account/wishlist" onClick={closeNavigation} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Heart className="h-4 w-4" /> Saved tours
                      </Link>
                    </>
                  )}
                  <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-slate-200 px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-300 dark:hover:bg-rose-950/40">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" onClick={closeNavigation} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Log in</Link>
              <Link to="/register" onClick={closeNavigation} className="rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800">Create account</Link>
            </>
          )}
        </div>
      </header>

      <div className={`fixed inset-x-0 top-3 z-50 mx-auto flex h-14 w-[calc(100%-1.5rem)] max-w-[1440px] items-center justify-between rounded-full border px-3 text-slate-800 shadow-lg backdrop-blur-xl dark:text-white xl:hidden ${headerSurface}`}>
        <Link to="/" onClick={closeNavigation} className="flex items-center gap-2.5" aria-label="Sarthi home">
          <img src="/sarthi-mark.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-heading text-sm font-extrabold tracking-[0.12em]">SARTHI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to={user ? '/account/wishlist' : '/login'} aria-label="Saved tours" className="relative rounded-lg border border-slate-200 p-2 text-rose-600 dark:border-slate-700">
            <Heart className="h-4 w-4" />
            {!!user?.wishlist?.length && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[9px] font-bold text-white">{user.wishlist.length}</span>}
          </Link>
          <button type="button" onClick={() => setMobileDrawerOpen((open) => !open)} aria-label={mobileDrawerOpen ? 'Close menu' : 'Open menu'} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
            {mobileDrawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileDrawerOpen && <button type="button" aria-label="Close navigation menu" className="fixed inset-0 z-40 bg-black/50 xl:hidden" onClick={closeNavigation} />}
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col border-l border-slate-200 bg-white text-slate-800 shadow-2xl transition-transform dark:border-slate-800 dark:bg-[#0B0F19] dark:text-slate-100 xl:hidden ${mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <span className="font-heading text-sm font-black tracking-wide">EXPLORE SARTHI</span>
          <button type="button" onClick={() => setMobileDrawerOpen(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSearch} className="relative border-b border-slate-200 p-4 dark:border-slate-800">
          <Search className="absolute left-7 top-7 h-4 w-4 text-slate-400" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tours and treks" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900" />
        </form>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Mobile navigation">
          {[...primaryLinks, ...additionalLinks].map((item) => (
            <NavLink key={item.to} to={item.to} end={'end' in item ? item.end : false} onClick={closeNavigation} className={({ isActive }) => `block rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              {item.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to={dashboardPath(role)} onClick={closeNavigation} className={({ isActive }) => `mt-3 block rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              {role === 'admin' ? 'Admin dashboard' : role === 'guide' || role === 'lead-guide' ? 'Guide dashboard' : 'My account'}
            </NavLink>
          )}
          <Link to="/naviband" onClick={closeNavigation} className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Watch className="h-4 w-4" /> NaviBand smart navigation
          </Link>
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {authError && <p role="status" className="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{authError}</p>}
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img src={user.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user.name}</p>
                  <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{role.replace('-', ' ')}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} aria-label="Sign out" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"><LogOut className="h-4 w-4" /></button>
            </div>
          ) : loading ? (
            <p role="status" className="text-center text-xs text-slate-500">Checking session…</p>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" onClick={closeNavigation} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-bold dark:border-slate-700">Log in</Link>
              <Link to="/register" onClick={closeNavigation} className="flex-1 rounded-lg bg-violet-700 py-2.5 text-center text-sm font-bold text-white">Create account</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
