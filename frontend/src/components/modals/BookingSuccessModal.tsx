import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Calendar, MapPin, User, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Booking } from '../../data/bookings';

interface BookingSuccessModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ booking, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Celebration Header */}
        <div className="bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-500 text-white p-8 text-center relative overflow-hidden">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Booking Confirmed & Verified
          </span>
          <h2 className="font-heading text-2xl font-black text-white mt-1">
            Pack Your Bags!
          </h2>
          <p className="text-teal-100 text-xs mt-1">
            Your travel reservation has been simulated and saved to your profile.
          </p>
        </div>

        {/* Voucher Ticket Summary */}
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
            {/* Cutout notch circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-r border-slate-200" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-l border-slate-200" />

            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Booking Reference
                </span>
                <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                  {booking.bookingRef}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                PAID
              </span>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Experience / Item:</span>
                <strong className="text-slate-800 text-right max-w-[220px] truncate">{booking.itemName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date of Travel:</span>
                <strong className="text-slate-800">{booking.date}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Travellers:</span>
                <strong className="text-slate-800">{booking.travellers} Passenger(s)</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Total Paid:</span>
                <span className="font-heading text-base font-black text-teal-700">
                  ₹{booking.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 justify-center">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>Digital voucher and receipt sent to registered email</span>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/dashboard/bookings');
              }}
              className="flex-1 btn-primary py-3 text-xs font-bold shadow-md"
            >
              View in My Bookings <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-3 text-xs font-bold"
            >
              Back to Explore
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

