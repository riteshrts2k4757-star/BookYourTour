import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plane, ArrowRight, ShieldCheck } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';
import { airportList } from '../../data/flights';
import { readTransportSearchResponse } from '../../services/transportResponse';

const airportOptions = airportList.map(({ city, code, airport }) => ({
  value: city,
  label: `${code} · ${airport}`
}));
const defaultJourneyDate = new Date().toISOString().slice(0, 10);

type FlightResult = {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  from: { airport: string; city: string; code: string };
  to: { airport: string; city: string; code: string };
  departureTime: string;
  arrivalTime: string;
  status: string;
  duration: string;
  travelClass: string;
  price: number;
  available: string;
};

export const FlightsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [fromCity, setFromCity] = useState(searchParams.get('from') || 'New Delhi');
  const [toCity, setToCity] = useState(searchParams.get('to') || 'Mumbai');
  const [flightClass, setFlightClass] = useState(searchParams.get('class') || 'Economy');
  const [journeyDate, setJourneyDate] = useState(defaultJourneyDate);
  const [searchCriteria, setSearchCriteria] = useState(() => ({
    from: searchParams.get('from') || 'New Delhi',
    to: searchParams.get('to') || 'Mumbai',
    date: defaultJourneyDate
  }));
  const [flightsList, setFlightsList] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerMessage, setProviderMessage] = useState('Loading live AviationStack flight data...');

  useEffect(() => {
    const controller = new AbortController();
    const fetchFlights = async () => {
      const from = searchCriteria.from.trim();
      const to = searchCriteria.to.trim();
      if (!from || !to) {
        setFlightsList([]);
        setProviderMessage('Enter both a departure and destination city to search.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = `/api/v1/transport/flights/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(searchCriteria.date)}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await readTransportSearchResponse<{ flights?: FlightResult[]; message?: string }>(response);

        const flights = data?.data?.flights || [];
        setFlightsList(flights);
        setProviderMessage(data?.data?.message || 'Live AviationStack flight results are available.');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setFlightsList([]);
        setProviderMessage(error instanceof Error ? error.message : 'AviationStack is unavailable right now.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timer = window.setTimeout(() => {
      void fetchFlights();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchCriteria]);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const from = fromCity.trim();
    const to = toCity.trim();
    if (!from || !to) {
      setFlightsList([]);
      setProviderMessage('Enter both a departure and destination city to search.');
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
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Air travel</span>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Flight search</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live results are fetched through the secure backend using your AviationStack key.
          </p>
        </div>

        <form onSubmit={submitSearch} className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111726] sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Departure city</label>
            <LocationAutocomplete id="flight-origin" value={fromCity} onChange={setFromCity} options={airportOptions} className="input-field" placeholder="e.g. New Delhi" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Destination city</label>
            <LocationAutocomplete id="flight-destination" value={toCity} onChange={setToCity} options={airportOptions} className="input-field" placeholder="e.g. Mumbai" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Cabin class</label>
            <select value={flightClass} onChange={(e) => setFlightClass(e.target.value)} className="input-field">
              <option>Economy</option>
              <option>Premium Economy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Flight date</label>
            <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full justify-center">Search flights</button>
          </div>
        </form>

        <div className="space-y-5">
          {loading ? (
            <div className="h-40 rounded-2xl skeleton" />
          ) : flightsList.length > 0 ? (
            flightsList.map((flight) => (
              <div key={flight.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111726]">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Plane className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        {flight.airline} <span className="text-blue-700">{flight.flightNumber}</span>
                      </h3>
                      <p className="text-xs text-slate-500">{flight.airlineCode} • {flight.travelClass}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {flight.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || flight.departureTime}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{flight.from.airport}</div>
                    <div className="text-xs text-slate-500">{flight.from.code || 'Source'}</div>
                  </div>

                  <div className="text-center text-sm text-slate-500">
                    <div>{flight.duration}</div>
                    <div className="mx-auto my-2 h-px w-24 bg-slate-200" />
                    <div>{flight.available}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || flight.arrivalTime}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{flight.to.airport}</div>
                    <div className="text-xs text-slate-500">{flight.to.code || 'Destination'}</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">Cabin:</span> {flight.travelClass}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                    <ShieldCheck className="h-4 w-4" />
                    {flight.available}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111726]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Plane className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-heading text-2xl font-bold text-slate-900 dark:text-white">No live flight data returned</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{providerMessage}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                AviationStack flight data will appear here once the route responds.
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

