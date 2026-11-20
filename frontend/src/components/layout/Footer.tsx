import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, ArrowRight, Heart, Award, PhoneCall, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast('Thank you for subscribing to Sarthi travel stories!', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid: Newsletter + Value Props */}
        <div className="bg-slate-900 rounded-3xl p-8 mb-16 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-orange-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" /> Travel Curations & Secret Offers
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Get ₹2,500 off your first curated expedition
              </h3>
              <p className="text-slate-300 text-sm mt-2 max-w-xl font-normal leading-relaxed">
                Join 85,000+ conscious explorers receiving our monthly handpicked itineraries, boutique palace discounts, and Himalayan trail guides.
              </p>
            </div>
            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  Join <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-14">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Compass className="h-6 w-6 text-white animate-spin-slow" />
              </div>
              <span className="font-heading text-xl font-black text-white tracking-tight">
                SARTHI <span className="text-emerald-400 font-semibold">Travel</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-sm font-normal">
              India's premier travel discovery and smart booking ecosystem. Certified local tour masters, heritage palace reserves, and real-time NaviBand IoT trail assistance.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-xs font-semibold text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Verified Escapes
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 text-xs font-semibold text-orange-300 border border-orange-500/20 flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-orange-400" /> 24/7 Concierge
              </span>
            </div>
          </div>

          {/* Column 1: Expeditions */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 font-mono text-purple-400">Expeditions</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link to="/tours?category=heritage" className="hover:text-emerald-400 transition">Heritage Circuits</Link></li>
              <li><Link to="/tours?category=trek" className="hover:text-emerald-400 transition">Himalayan Treks</Link></li>
              <li><Link to="/tours?category=nature" className="hover:text-emerald-400 transition">Kerala Backwaters</Link></li>
              <li><Link to="/tours?category=beach" className="hover:text-emerald-400 transition">Goa Coastal Escapes</Link></li>
              <li><Link to="/tours" className="hover:text-emerald-400 transition">All Tour Packages</Link></li>
            </ul>
          </div>

          {/* Column 2: Discover & Transit */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 font-mono text-emerald-400">Bookings</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link to="/hotels" className="hover:text-emerald-400 transition">Hotels & Resorts</Link></li>
              <li><Link to="/flights" className="hover:text-emerald-400 transition">Domestic Flights</Link></li>
              <li><Link to="/trains" className="hover:text-emerald-400 transition">Vande Bharat Trains</Link></li>
              <li><Link to="/buses" className="hover:text-emerald-400 transition">Intercity Buses</Link></li>
              <li><Link to="/road-trips" className="hover:text-emerald-400 transition">Road Trip Planner</Link></li>
              <li><Link to="/naviband" className="hover:text-orange-400 transition text-orange-300 font-bold">NaviBand Smart Band</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4 font-mono text-orange-400">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li><Link to="/destinations" className="hover:text-emerald-400 transition">Destinations Guide</Link></li>
              <li><Link to="/account" className="hover:text-emerald-400 transition">User Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-purple-400 transition">Admin Portal</Link></li>
              <li><Link to="/guide" className="hover:text-orange-400 transition">Guide Workspace</Link></li>
              <li><Link to="/account/wishlist" className="hover:text-emerald-400 transition">Saved Wishlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Sarthi Travel Technologies. Crafted with <Heart className="h-3 w-3 inline text-rose-500 fill-rose-500" /> for incredible journeys.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Currency: <strong className="text-white">INR (₹)</strong></span>
            <span className="text-slate-400">Country: <strong className="text-white">India</strong></span>
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-mono text-[11px]">
              Vite + React TS Frontend
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
