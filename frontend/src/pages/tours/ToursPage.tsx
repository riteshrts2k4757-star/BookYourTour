import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Tour } from '../../data/tours';
import { TourCard } from '../../components/cards/TourCard';
import { Search } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';
import { tourService } from '../../services/mock/tourService';
import { getApiErrorMessage } from '../../services/apiClient';

const earliestTravelDate = new Date().toISOString().slice(0, 10);

export const ToursPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || searchParams.get('destination') || '';
  const initialDate = searchParams.get('date') || '';
  const initialGuests = searchParams.get('guests') || '';

  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [travelDate, setTravelDate] = useState(initialDate);
  const [travellers, setTravellers] = useState(initialGuests);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    tourService.getAll()
      .then((tours) => {
        if (!active) return;
        setAllTours(tours);
        setLoadError('');
      })
      .catch((error) => {
        if (active) setLoadError(getApiErrorMessage(error, 'Tours could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toursList = useMemo(() => {
    let filtered = [...allTours];

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.startLocation.description.toLowerCase().includes(q) ||
          t.locations.some((location) => location.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((t) => t.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    if (travelDate) {
      filtered = filtered.filter((tour) => tour.startDates.includes(travelDate));
    }

    if (travellers) {
      filtered = filtered.filter((tour) => tour.maxGroupSize >= Number(travellers));
    }

    filtered = filtered.filter((tour) => (tour.priceDiscount || tour.price) <= maxPrice);

    // Sort order
    if (sortBy === 'featured') {
      filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.priceDiscount || a.price) - (b.priceDiscount || b.price));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.priceDiscount || b.price) - (a.priceDiscount || a.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    }

    return filtered;
  }, [allTours, searchTerm, selectedCategory, selectedDifficulty, travelDate, travellers, sortBy, maxPrice]);

  const tourCategories = Array.from(new Set(allTours.map((tour) => tour.category)));
  const visibleTours = toursList.slice(0, visibleCount);
  const tourSearchOptions = Array.from(new Set(
    allTours.flatMap((tour) => [tour.name, tour.startLocation.description])
  )).map((value) => ({ value }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider block font-mono">
            All-Inclusive Packages
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Explore Curated India Tour Circuits
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl font-normal">
            Handcrafted expeditions with certified local docents, heritage stays, and real-time NaviBand smart navigation.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setVisibleCount(6);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            All Themes
          </button>
          {tourCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] opacity-75 font-normal">({allTours.filter((tour) => tour.category === cat).length})</span>
            </button>
          ))}
        </div>

        {/* Controls Bar: Search + Filters */}
        <div className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 grid grid-cols-1 gap-4 items-center transition-colors md:grid-cols-2 lg:grid-cols-8">
          {/* Search Box */}
          <div className="relative md:col-span-2 lg:col-span-2">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <LocationAutocomplete
              id="tour-search"
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value);
                setVisibleCount(6);
              }}
              options={tourSearchOptions}
              placeholder="Search by tour name, city or state..."
              className="input-field pl-10"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setVisibleCount(6);
              }}
              className="input-field cursor-pointer"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="easy">Easy (Family Friendly)</option>
              <option value="medium">Medium (Moderate Trek)</option>
              <option value="difficult">Difficult (High Altitude)</option>
            </select>
          </div>

          <div>
            <label htmlFor="tour-travel-date" className="sr-only">Travel date</label>
            <input
              id="tour-travel-date"
              type="date"
              min={earliestTravelDate}
              value={travelDate}
              onChange={(event) => {
                setTravelDate(event.target.value);
                setVisibleCount(6);
              }}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="tour-travellers" className="sr-only">Number of travelers</label>
            <select
              id="tour-travellers"
              value={travellers}
              onChange={(event) => {
                setTravellers(event.target.value);
                setVisibleCount(6);
              }}
              className="input-field"
            >
              <option value="">Any group size</option>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                <option key={count} value={count}>{count} {count === 1 ? 'traveler' : 'travelers'}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as typeof sortBy);
                setVisibleCount(6);
              }}
              className="input-field cursor-pointer"
            >
              <option value="featured">Sort by Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <label className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 lg:col-span-2">
            <span className="shrink-0">Up to ₹{maxPrice.toLocaleString('en-IN')}</span>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(Number(event.target.value));
                setVisibleCount(6);
              }}
              aria-label="Maximum tour price"
              className="w-full accent-emerald-600"
            />
          </label>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{visibleTours.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{toursList.length}</strong> available tour{toursList.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Tour Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl skeleton" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {loadError}
          </div>
        ) : toursList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111726] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">No matching tours found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing categories, or expanding the price range.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setTravelDate('');
                setTravellers('');
                setMaxPrice(50000);
                setVisibleCount(6);
              }}
              className="mt-4 btn-primary py-2.5 px-6 text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
        {!loading && !loadError && toursList.length > 6 && (
          <div className="mt-8 flex justify-center gap-3">
            {visibleCount < toursList.length && (
              <button
                onClick={() => setVisibleCount((count) => Math.min(count + 6, toursList.length))}
                className="btn-primary py-3 px-8 text-sm font-bold"
              >
                Show more tours
              </button>
            )}
            {visibleCount > 6 && (
              <button
                onClick={() => {
                  setVisibleCount(6);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary py-3 px-8 text-sm font-bold"
              >
                Show fewer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
