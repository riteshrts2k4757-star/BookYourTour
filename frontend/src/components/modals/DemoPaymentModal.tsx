import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  X,
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';
import { paymentService } from '../../services/mock/bookingService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../services/apiClient';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  itemName: string;
  itemType: string;
  onPaymentSuccess: (transactionId: string) => void | Promise<void>;
  onPaymentFailure: (reason: string) => void;
}

export const DemoPaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  itemName,
  itemType,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState<'card' | 'qr'>('qr');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [processing, setProcessing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'success' | 'declined' | 'expired'>('success');

  // Simulated card form states
  const [cardHolder, setCardHolder] = useState('Aarav Sharma');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('789');

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleSimulatePayment = async (scenario: 'success' | 'declined' | 'expired') => {
    setProcessing(true);
    try {
      const res = await paymentService.simulatePayment({
        amount,
        method,
        scenario
      });

      if (res.success) {
        await onPaymentSuccess(res.transactionId);
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
        onPaymentFailure(res.message);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Payment simulation error');
      showToast(message, 'error');
      onPaymentFailure(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
      >
        {/* Header with Demo Warning */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label="Close demo checkout"
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" /> Secure Demo Checkout Gateway
          </div>
          <h3 className="font-heading text-xl font-bold text-white">
            Confirm & Pay ₹{amount.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
            {itemName} ({itemType})
          </p>

          <div className="mt-4 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>DEMO PAYMENT SYSTEM: No real card or bank funds are ever debited.</span>
          </div>
        </div>

        {/* Tab Controls: QR Code vs Card */}
        <div className="flex border-b border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setMethod('qr')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
              method === 'qr'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="h-4 w-4" /> Demo UPI / QR Scan
          </button>
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors border-b-2 ${
              method === 'card'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-4 w-4" /> Demo Card Payment
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {method === 'qr' ? (
            <div className="flex flex-col items-center text-center">
              {/* Synthetic Safe Demo QR SVG */}
              <div className="relative p-4 rounded-2xl bg-white border-2 border-dashed border-teal-500/40 shadow-inner flex flex-col items-center justify-center">
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="10" fill="#F8FAFC" />
                  {/* Decorative QR Pattern */}
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="#10233F" />
                  <rect x="15" y="15" width="14" height="14" rx="2" fill="white" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#0D9488" />

                  <rect x="66" y="10" width="24" height="24" rx="4" fill="#10233F" />
                  <rect x="71" y="15" width="14" height="14" rx="2" fill="white" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#0D9488" />

                  <rect x="10" y="66" width="24" height="24" rx="4" fill="#10233F" />
                  <rect x="15" y="71" width="14" height="14" rx="2" fill="white" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#0D9488" />

                  {/* Center Demo Watermark Badge */}
                  <circle cx="50" cy="50" r="16" fill="#10233F" />
                  <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fill="#2DD4BF" fontSize="7" fontWeight="bold">
                    DEMO
                  </text>
                  {/* Data blocks */}
                  <rect x="42" y="15" width="6" height="6" fill="#10233F" />
                  <rect x="52" y="22" width="6" height="6" fill="#10233F" />
                  <rect x="42" y="72" width="6" height="6" fill="#10233F" />
                  <rect x="52" y="68" width="6" height="6" fill="#10233F" />
                  <rect x="72" y="44" width="6" height="6" fill="#10233F" />
                  <rect x="22" y="44" width="6" height="6" fill="#10233F" />
                </svg>
                <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  DEMONSTRATION QR ONLY
                </span>
              </div>

              {/* Countdown & Instructions */}
              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-500">
                <Clock className="h-4 w-4 text-amber-500" /> Session active for:{' '}
                <span className="font-mono text-slate-900 dark:text-white font-bold">{formattedTime}</span>
              </div>

              <p className="text-xs text-slate-500 mt-2 max-w-xs">
                Scan with any simulated UPI scanner or click one of the simulation triggers below to complete the workflow.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Demo Card Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-field pl-10 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Lock className="h-3.5 w-3.5 text-teal-600" />
                <span>Simulated TLS 256-bit encryption for demo environment</span>
              </div>
            </div>
          )}

          {/* Test Scenarios Selector Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Select Test Outcome Scenario:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScenario('success')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedScenario === 'success'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                ✓ Success
              </button>
              <button
                type="button"
                onClick={() => setSelectedScenario('declined')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedScenario === 'declined'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                ✕ Decline
              </button>
              <button
                type="button"
                onClick={() => setSelectedScenario('expired')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedScenario === 'expired'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                ⏱ Timeout
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              type="button"
              disabled={processing}
              onClick={() => handleSimulatePayment(selectedScenario)}
              className="w-full btn-primary py-4 text-base font-bold shadow-xl flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Demo Transaction...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>
                    Simulate Payment (
                    {selectedScenario === 'success'
                      ? 'Confirm Booking'
                      : selectedScenario === 'declined'
                      ? 'Test Decline'
                      : 'Test Timeout'}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

