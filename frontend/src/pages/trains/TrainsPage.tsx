import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Train as TrainIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';
import { railwayStations } from '../../data/trains';
import { readTransportSearchResponse } from '../../services/transportResponse';

const stationOptions = railwayStations.map(({ name, code }) => ({
  value: name,
  label: code
}));
const defaultJourneyDate = new Date().toISOString().slice(0, 10);

type RailResult = {
  id: string;
  number: string;
  name: string;
  from: { station: string; code: string };
  to: { station: string; code: string };
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: Array<{ id: string; type: string; name: string; fare: number; available: string | number }>;
  runningDays: string[];
  status: string;
};

export const TrainsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [fromStation, setFromStation] = useState(searchParams.get('from') || 'New Delhi');
  const [toStation, setToStation] = useState(searchParams.get('to') || 'Varanasi');
  const [journeyDate, setJourneyDate] = useState(defaultJourneyDate);
  const [searchCriteria, setSearchCriteria] = useState(() => ({
    from: searchParams.get('from') || 'New Delhi',
    to: searchParams.get('to') || 'Varanasi',
    date: defaultJourneyDate
  }));
  const [trainsList, setTrainsList] = useState<RailResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerMessage, setProviderMessage] = useState('Loading live QRail train data...');

  useEffect(() => {
    const controller = new AbortController();
    const fetchTrains = async () => {
      const from = searchCriteria.from.trim();
      const to = searchCriteria.to.trim();
      if (!from || !to) {
        setTrainsList([]);
        setProviderMessage('Enter both a source and destination station to search.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = `/api/v1/transport/trains/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(searchCriteria.date)}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await readTransportSearchResponse<{ trains?: RailResult[]; message?: string }>(response);

        const trains = data?.data?.trains || [];
        setTrainsList(trains);
        setProviderMessage(data?.data?.message || 'Live QRail train results are available.');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setTrainsList([]);
        setProviderMessage(error instanceof Error ? error.message : 'QRail is unavailable right now.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void fetchTrains();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchCriteria]);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const from = fromStation.trim();
    const to = toStation.trim();
    if (!from || !to) {
      setTrainsList([]);
      setProviderMessage('Enter both a source and destination station to search.');
      setLoading(false);
      return;
    }

    setSearchCriteria({
      from,
      to,
      date: journeyDate
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Indian rail</span>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Train search</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live results are fetched through the secure backend using the configured QRail API key.
          </p>
        </div>

        <form onSubmit={submitSearch} className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111726] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Source station</label>
            <LocationAutocomplete id="train-origin" value={fromStation} onChange={setFromStation} options={stationOptions} className="input-field" placeholder="e.g. New Delhi" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Destination station</label>
            <LocationAutocomplete id="train-destination" value={toStation} onChange={setToStation} options={stationOptions} className="input-field" placeholder="e.g. Varanasi Jn" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Journey date</label>
            <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center">Search trains</button>
          </div>
        </form>

        <div className="space-y-5">
          {loading ? (
            <div className="h-40 rounded-2xl skeleton" />
          ) : trainsList.length > 0 ? (
            trainsList.map((train) => (
              <div key={train.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111726]">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                      <TrainIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {train.name} <span className="text-teal-700">#{train.number}</span>
                      </h3>
                      <p className="text-xs text-slate-500">Runs: {train.runningDays.join(', ')}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {train.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{train.departureTime}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{train.from.station}</div>
                    <div className="text-xs text-slate-500">{train.from.code || 'Source'}</div>
                  </div>

                  <div className="text-center text-sm text-slate-500">
                    <div>{train.duration}</div>
                    <div className="mx-auto my-2 h-px w-24 bg-slate-200" />
                    <div>{train.distance}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{train.arrivalTime}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{train.to.station}</div>
                    <div className="text-xs text-slate-500">{train.to.code || 'Destination'}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Class availability</div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {train.classes.map((cls) => (
                      <div key={cls.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{cls.type}</span>
                          <span className="text-sm font-bold text-teal-700">₹{Number(cls.fare || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">{cls.name}</div>
                        <div className="mt-2 text-xs font-semibold text-emerald-700">Available: {cls.available}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111726]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <TrainIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-slate-900 dark:text-white">No live train data returned</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{providerMessage}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                QRail data will appear here once the API responds for this route.
              </div>
              <div className="mt-6 flex justify-center">
                <button type="button" className="btn-primary" onClick={() => submitSearch()}>
                  Search again
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

