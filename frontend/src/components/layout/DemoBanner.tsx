import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { getApiErrorMessage } from '../../services/apiClient';
import { LogOut, Moon, Shield, Sun, UserRound, Compass } from 'lucide-react';

const roleLabel = (role: string) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'lead-guide') return 'Lead Guide';
  if (role === 'guide') return 'Tour Guide';
  return 'Traveller';
};

const dashboardPath = (role: string) =>
  role === 'admin' ? '/admin' : role === 'guide' || role === 'lead-guide' ? '/guide' : '/account';

export const DemoBanner: React.FC = () => {
  const { user, role, loading, authError, logout } = useAuth();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out successfully.', 'info');
      navigate('/', { replace: true });
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Sign out could not be confirmed by the server.'), 'error');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100">
            <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Sarthi
          </span>
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">Travel workspace</span>
        </Link>

        <div className="ml-auto flex items-center gap-2.5">
          {authError && (
            <span role="status" className="hidden max-w-xs truncate text-[11px] text-amber-700 dark:text-amber-300 sm:inline">
              {authError}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {loading ? (
            <span className="text-xs text-slate-500 dark:text-slate-400" role="status">Checking session...</span>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
              <Link to={dashboardPath(role)} className="flex min-w-0 items-center gap-2" title="Open account dashboard">
                {role === 'admin' ? (
                  <Shield className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-300" />
                ) : (
                  <UserRound className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                )}
                <span className="min-w-0 text-right">
                  <strong className="block max-w-[130px] truncate text-xs text-slate-900 dark:text-white">{user.name}</strong>
                  <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{roleLabel(role)}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-emerald-800"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
