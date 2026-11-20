import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { destinations, Destination } from '../../data/destinations';
import { MapPin, ArrowRight, Compass, Search } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';

const destinationSearchOptions = Array.from(new Set(
  destinations.flatMap((destination) => [destination.name, destination.state])
)).map((value) => ({ value }));

export const DestinationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Heritage', 'Beach', 'Nature', 'Adventure', 'Spirituality'];

  const filtered = destinations.filter((dest) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesName = dest.name.toLowerCase().includes(q);
      const matchesState = dest.state.toLowerCase().includes(q);
      if (!matchesName && !matchesState) return false;
    }
    if (selectedCategory !== 'all') {
      const hasCat = dest.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
      if (!hasCat) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-800 dark:bg-[#0B0F19] dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-teal-600 text-xs font-bold uppercase tracking-wider block">
            Encyclopedic Travel Atlas
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Explore Incredible Destinations Across India
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Curated region profiles with weather recommendations, top attractions, and budget guidance.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <LocationAutocomplete
              id="destination-search"
              value={searchTerm}
              onChange={setSearchTerm}
              options={destinationSearchOptions}
              placeholder="Search destination or state..."
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((dest) => (
            <Link
              key={dest.id}
              to={`/destinations/${dest.id}`}
              className="card-hover group flex flex-col overflow-hidden bg-white"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-black/20" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 dark:text-white">
                  {dest.state}
                </span>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-heading text-2xl font-black text-white group-hover:text-teal-300 transition-colors">
                    {dest.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Best Time:</span>
                    <strong className="text-slate-800">{dest.bestTimeToVisit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Budget:</span>
                    <strong className="text-slate-800">{dest.avgBudgetPerDay}</strong>
                  </div>
                </div>

                <div className="mt-5 pt-3 flex items-center justify-between text-xs font-bold text-teal-600">
                  <span>Explore Destination Guide</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

