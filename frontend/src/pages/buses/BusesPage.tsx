import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { busService } from '../../services/mock/transportService';
import { Bus as BusIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';
import { busCities } from '../../data/buses';

const busCityOptions = busCities.map((value) => ({ value }));

export const BusesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [fromCity, setFromCity] = useState(searchParams.get('from') || 'Bengaluru');
  const [toCity, setToCity] = useState(searchParams.get('to') || 'Goa (Panaji)');
  const [loading, setLoading] = useState(true);
  const [providerMessage, setProviderMessage] = useState('Live bus availability is currently unavailable.');

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      const status = await busService.getStatus();
      setProviderMessage(status.message);
      await busService.search({ from: fromCity, to: toCity });
      setLoading(false);
    };

    fetchBuses();
  }, [fromCity, toCity]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Intercity travel</span>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Bus search</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live seat availability will appear after an authorized bus provider is connected.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111726] sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">From city</label>
            <LocationAutocomplete id="bus-origin" value={fromCity} onChange={setFromCity} options={busCityOptions} className="input-field" placeholder="e.g. Bengaluru" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">To city</label>
            <LocationAutocomplete id="bus-destination" value={toCity} onChange={setToCity} options={busCityOptions} className="input-field" placeholder="e.g. Goa (Panaji)" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111726]">
          {loading ? (
            <div className="h-24 rounded-2xl skeleton" />
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <BusIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-slate-900 dark:text-white">Live bus availability is currently unavailable</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{providerMessage}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Connect a verified intercity bus provider and secure gateway before showing live routes.
              </div>
              <div className="mt-6 flex justify-center">
                <button type="button" className="btn-primary">
                  Connect provider
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

