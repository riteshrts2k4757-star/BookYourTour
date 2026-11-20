import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinations } from '../../data/destinations';
import { tours } from '../../data/tours';
import { hotels } from '../../data/hotels';
import { TourCard } from '../../components/cards/TourCard';
import { HotelCard } from '../../components/cards/HotelCard';
import { MapPin, Calendar, Wallet, Compass, Building, ArrowRight } from 'lucide-react';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Destination Not Found</h2>
        <Link to="/destinations" className="mt-4 inline-block btn-primary text-xs font-bold py-2 px-5">
          Back to Destinations
        </Link>
      </div>
    );
  }

  // Related tours & hotels
  const relatedTours = tours.filter((t) =>
    t.name.toLowerCase().includes(destination.name.toLowerCase()) ||
    t.startLocation.description.toLowerCase().includes(destination.name.toLowerCase())
  );

  const relatedHotels = hotels.filter((h) =>
    h.city.toLowerCase().includes(destination.name.toLowerCase()) ||
    h.state.toLowerCase().includes(destination.state.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="relative h-[420px] bg-slate-900 text-white flex items-end">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/40 to-black/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 uppercase tracking-widest mb-2">
            <MapPin className="h-4 w-4" /> {destination.state}, India
          </div>
          <h1 className="font-heading text-4xl sm:text-6xl font-black text-white">
            {destination.name}
          </h1>
          <p className="text-slate-200 text-base sm:text-xl mt-2 max-w-2xl font-medium">
            {destination.tagline}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Quick Facts Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Best Visiting Season</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">{destination.bestTimeToVisit}</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Daily Budget</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">{destination.avgBudgetPerDay}</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-coral-50 text-coral-600 flex items-center justify-center shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ideal Travel Style</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">{destination.categories.join(', ')}</strong>
            </div>
          </div>
        </div>

        {/* Overview & Key Attractions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
                About {destination.name}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {destination.description}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Famous For</h4>
                <div className="flex flex-wrap gap-2">
                  {destination.popularFor.map((item, idx) => (
                    <span key={idx} className="badge-navy text-xs py-1 px-3">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-2">
              Signature Sights & Landmarks
            </h3>
            {destination.attractions.map((att, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">
                  {att.type}
                </span>
                <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1">{att.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{att.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tours in this Region */}
        {relatedTours.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                Featured Tour Circuits in {destination.name}
              </h3>
              <Link to={`/tours?destination=${encodeURIComponent(destination.name)}`} className="text-xs font-bold text-teal-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedTours.slice(0, 3).map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        )}

        {/* Related Stays in this Region */}
        {relatedHotels.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                Top Hotels & Resorts in {destination.name}
              </h3>
              <Link to={`/hotels?city=${encodeURIComponent(destination.name)}`} className="text-xs font-bold text-teal-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedHotels.slice(0, 3).map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

