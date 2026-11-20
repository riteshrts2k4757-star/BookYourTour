import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Compass, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('Simulated password reset instructions sent to your email!', 'info');
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
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your email to receive a demo reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm">Demo Reset Link Sent!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed font-normal">
              We've dispatched simulated recovery instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="inline-block mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline">
              Return to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition mt-2 cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
