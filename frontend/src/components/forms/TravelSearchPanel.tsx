import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Building,
  Plane,
  Train,
  Bus,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRightLeft,
  Navigation,
  Car
} from 'lucide-react';
import { airportList } from '../../data/flights';
import { railwayStations } from '../../data/trains';
import { LocationAutocomplete } from './LocationAutocomplete';
import type { LocationOption } from './LocationAutocomplete';

type SearchTab = 'tours' | 'hotels' | 'flights' | 'trains' | 'buses' | 'road-trips';

interface SearchPanelProps {
  initialTab?: SearchTab;
  compact?: boolean;
}

const travelLocations = Array.from(new Set([
  ...airportList.map((airport) => airport.city),
  ...railwayStations.map((station) => station.name),
  'Agra', 'Bilaspur', 'Chandigarh', 'Leh', 'Manali', 'Rishikesh', 'Shimla', 'Udaipur'
]));
const travelLocationOptions: LocationOption[] = travelLocations.map((value) => ({ value }));
const earliestTravelDate = new Date().toISOString().slice(0, 10);

export const TravelSearchPanel: React.FC<SearchPanelProps> = ({
  initialTab = 'tours',
  compact = false
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);

  // Common Form States
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('Jaipur');
  const [tourDestination, setTourDestination] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [startDate, setStartDate] = useState('2027-02-15');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [tourCategory, setTourCategory] = useState('all');
  const [flightClass, setFlightClass] = useState('Economy');
  const [flightType, setFlightType] = useState<'oneway' | 'roundtrip'>('roundtrip');
  const [busType, setBusType] = useState('all');

  // Swap origin and destination helper
  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'tours') {
      const params = new URLSearchParams({
        destination: tourDestination.trim(),
        category: tourCategory,
        guests
      });
      if (tourDate) params.set('date', tourDate);
      navigate(`/tours?${params.toString()}`);
    } else if (activeTab === 'hotels') {
      navigate(`/hotels?city=${encodeURIComponent(destination)}&guests=${guests}&rooms=${rooms}`);
    } else if (activeTab === 'flights') {
      navigate(`/flights?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&class=${flightClass}&type=${flightType}`);
    } else if (activeTab === 'trains') {
      navigate(`/trains?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`);
    } else if (activeTab === 'buses') {
      navigate(`/buses?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&type=${busType}`);
    } else if (activeTab === 'road-trips') {
      navigate(`/road-trips?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    }
  };

  const tabs = [
    { id: 'tours' as SearchTab, label: 'Tours', icon: Compass },
    { id: 'hotels' as SearchTab, label: 'Hotels & Stays', icon: Building },
    { id: 'flights' as SearchTab, label: 'Flights', icon: Plane },
    { id: 'trains' as SearchTab, label: 'Trains', icon: Train },
    { id: 'buses' as SearchTab, label: 'Buses', icon: Bus },
    { id: 'road-trips' as SearchTab, label: 'Road Trips', icon: Car }
  ];
  return (
    <div className={`w-full rounded-[1.75rem] border border-white/70 bg-white/95 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.42)] backdrop-blur-xl transition-colors dark:border-slate-700/80 dark:bg-[#111726]/95 ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
      {/* Category Tabs */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-3 scrollbar-hide dark:border-slate-800 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flight Sub-Tabs (One Way / Round Trip) */}
      {activeTab === 'flights' && (
        <div className="flex items-center gap-4 mb-4 text-xs font-bold text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="flightType"
              checked={flightType === 'roundtrip'}
              onChange={() => setFlightType('roundtrip')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            Round Trip
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="flightType"
              checked={flightType === 'oneway'}
              onChange={() => setFlightType('oneway')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            One Way
          </label>
        </div>
      )}

      {/* Main Search Input Form */}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Tours Search Fields */}
          {activeTab === 'tours' && (
            <>
              <div className="lg:col-span-4 relative">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-tour-destination"
                    value={tourDestination}
                    onChange={setTourDestination}
                    options={travelLocationOptions}
                    placeholder="Where do you want to explore?"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="travel-tour-date" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Travel date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <input
                    id="travel-tour-date"
                    type="date"
                    value={tourDate}
                    min={earliestTravelDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="travel-tour-guests" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Travelers
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <select id="travel-tour-guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="input-field pl-10">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((count) => (
                      <option key={count} value={count}>{count} {count === 1 ? 'traveler' : 'travelers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="travel-tour-category" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  id="travel-tour-category"
                  value={tourCategory}
                  onChange={(e) => setTourCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All trips</option>
                  <option value="trek">Trekking</option>
                  <option value="adventure">Adventure</option>
                  <option value="nature">Nature</option>
                  <option value="beach">Beach</option>
                  <option value="heritage">Heritage</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
            </>
          )}

          {/* Hotels Search Fields */}
          {activeTab === 'hotels' && (
            <>
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  City, Resort or Property
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-hotel-destination"
                    value={destination}
                    onChange={setDestination}
                    options={travelLocationOptions}
                    placeholder="e.g. Jaipur, Goa, Udaipur"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Check-in Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 Adult</option>
                    <option value="2">2 Adults</option>
                    <option value="3">3 Adults</option>
                    <option value="4">4+ Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Rooms
                  </label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3+ Rooms</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Flights Search Fields */}
          {activeTab === 'flights' && (
            <>
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  From (City/Airport)
                </label>
                <div className="relative">
                  <Plane className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500 rotate-45" />
                  <LocationAutocomplete
                    id="travel-flight-origin"
                    value={origin}
                    onChange={setOrigin}
                    options={travelLocationOptions}
                    placeholder="Departure city"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div className="lg:col-span-1 flex justify-center -my-2 lg:my-0">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white transition shadow-sm"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  To (City/Airport)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-flight-destination"
                    value={destination}
                    onChange={setDestination}
                    options={travelLocationOptions}
                    placeholder="Arrival city"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Class & Cabin
                </label>
                <select
                  value={flightClass}
                  onChange={(e) => setFlightClass(e.target.value)}
                  className="input-field"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business Class</option>
                </select>
              </div>
            </>
          )}

          {/* Trains Search Fields */}
          {activeTab === 'trains' && (
            <>
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Source Station
                </label>
                <div className="relative">
                  <Train className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-train-origin"
                    value={origin}
                    onChange={setOrigin}
                    options={travelLocationOptions}
                    placeholder="e.g. New Delhi NDLS"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white transition shadow-sm"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Destination Station
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-train-destination"
                    value={destination}
                    onChange={setDestination}
                    options={travelLocationOptions}
                    placeholder="e.g. Varanasi Jn BSB"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Journey Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          )}

          {/* Buses Search Fields */}
          {activeTab === 'buses' && (
            <>
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  From City
                </label>
                <div className="relative">
                  <Bus className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-bus-origin"
                    value={origin}
                    onChange={setOrigin}
                    options={travelLocationOptions}
                    placeholder="Boarding City"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white transition shadow-sm"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  To City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-bus-destination"
                    value={destination}
                    onChange={setDestination}
                    options={travelLocationOptions}
                    placeholder="Dropping City"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bus Preference
                </label>
                <select
                  value={busType}
                  onChange={(e) => setBusType(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All AC / Volvo / Sleeper</option>
                  <option value="sleeper">AC Sleeper (2+1)</option>
                  <option value="seater">Luxury Seater</option>
                </select>
              </div>
            </>
          )}

          {/* Road Trips Search Fields */}
          {activeTab === 'road-trips' && (
            <>
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Start Point
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-roadtrip-origin"
                    value={origin}
                    onChange={setOrigin}
                    options={travelLocationOptions}
                    placeholder="e.g. New Delhi"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white transition shadow-sm"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Final Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500" />
                  <LocationAutocomplete
                    id="travel-roadtrip-destination"
                    value={destination}
                    onChange={setDestination}
                    options={travelLocationOptions}
                    placeholder="e.g. Leh, Ladakh"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select className="input-field">
                  <option>SUV / 4x4 (Recommended)</option>
                  <option>Sedan / Hatchback</option>
                  <option>Motorbike / Royal Enfield</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Search Button */}
          <div className="lg:col-span-2 flex flex-col justify-end mt-2 lg:mt-0">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

