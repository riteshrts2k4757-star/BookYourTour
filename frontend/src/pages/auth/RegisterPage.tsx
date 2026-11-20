import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Compass, Lock, Mail, User, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const newUser = await register({ name, email, phone, password, passwordConfirm });
      showToast(`Welcome to Sarthi, ${newUser.name}!`, 'success');
      navigate('/account', { replace: true });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Account registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#111726] rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Compass className="h-6 w-6 text-white animate-spin-slow" />
            </div>
            <span className="font-heading font-black text-xl text-slate-900 dark:text-white">SARTHI</span>
          </Link>
          <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unlock exclusive member rates, tour tracking, and wishlist sync
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3">
            New registrations are created as traveller accounts. Privileged roles require administrator assignment.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="Aarav Sharma"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="aarav@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="+91 98765 43210"
                maxLength={25}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="input-field pl-10 text-xs"
                placeholder="Re-enter your password"
                minLength={8}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Traveller Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
