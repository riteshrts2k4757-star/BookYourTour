import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, Compass, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signedInUser = await login(email, password);
      showToast('Welcome back to Sarthi!', 'success');
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      const dashboardPath = signedInUser.role === 'admin'
        ? '/admin'
        : signedInUser.role === 'guide' || signedInUser.role === 'lead-guide'
          ? '/guide'
          : '/account';
      navigate(returnTo || dashboardPath, { replace: true });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sign in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#111726] rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Compass className="h-6 w-6 text-white animate-spin-slow" />
            </div>
            <span className="font-heading font-black text-xl text-slate-900 dark:text-white">SARTHI</span>
          </Link>
          <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-white">
            Welcome to Sarthi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your booked expeditions, wristband sync & wishlist
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to Account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Register Footnote */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};
