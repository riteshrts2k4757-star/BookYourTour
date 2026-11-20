import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel, hotels as allHotels, hotelCategories } from '../../data/hotels';
import { HotelCard } from '../../components/cards/HotelCard';
import { Search, Building, SlidersHorizontal, Award } from 'lucide-react';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';

const hotelSearchOptions = Array.from(new Set(
  allHotels.flatMap((hotel) => [hotel.city, hotel.name])
)).map((value) => ({ value }));

export const HotelsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  const initialType = searchParams.get('type') || 'all';

  const [hotelsList, setHotelsList] = useState<Hotel[]>(allHotels);
  const [searchCity, setSearchCity] = useState(initialCity);
  const [selectedType, setSelectedType] = useState(initialType);
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let filtered = [...allHotels];

    if (searchCity) {
      const q = searchCity.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.state.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((h) => h.type.toLowerCase() === selectedType.toLowerCase());
    }

    filtered = filtered.filter((h) => h.price <= maxPrice);

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    }

    setHotelsList(filtered);
    setLoading(false);
  }, [searchCity, selectedType, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider block font-mono">
            Boutique & Luxury Stays
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Discover Verified Hotels & Resorts
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl font-normal">
            From regal palaces in Rajasthan to cliffside wellness sanctuaries and tranquil backwater villas.
          </p>
        </div>

        {/* Property Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              selectedType === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            All Types
          </button>
          {hotelCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                selectedType.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Search & Sort Filter Bar */}
        <div className="bg-white dark:bg-[#111726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center transition-colors">
          {/* City / Name Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <LocationAutocomplete
              id="hotel-search"
              value={searchCity}
              onChange={setSearchCity}
              options={hotelSearchOptions}
              placeholder="Search by hotel name or city (e.g. Jaipur, Goa)..."
              className="input-field pl-10"
            />
          </div>

          {/* Max Price Slider */}
          <div className="px-2">
            <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Budget Up To</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field cursor-pointer"
            >
              <option value="featured">Featured Stays</option>
              <option value="rating">Guest Rating: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{hotelsList.length}</strong> verified properties
          </p>
        </div>

        {/* Hotels Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl skeleton" />
            ))}
          </div>
        ) : hotelsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotelsList.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111726] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Building className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">No properties found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your city filter or expanding your nightly budget limit.
            </p>
            <button
              onClick={() => {
                setSearchCity('');
                setSelectedType('all');
                setMaxPrice(50000);
              }}
              className="mt-4 btn-primary py-2.5 px-6 text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
