import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roadTripService, RoadTripPlan } from '../../services/mock/roadTripService';
import { useToast } from '../../context/ToastContext';
import { LocationAutocomplete } from '../../components/forms/LocationAutocomplete';
import {
  Car,
  MapPin,
  Plus,
  Trash2,
  Navigation,
  Fuel,
  Coins,
  Clock,
  ArrowRight,
  Share2,
  Bookmark,
  Compass,
  AlertCircle
} from 'lucide-react';

const roadTripLocations = [
  'Agra', 'Bengaluru', 'Bilaspur', 'Chandigarh', 'Dehradun', 'Delhi', 'Goa',
  'Jaipur', 'Leh', 'Manali', 'Mumbai', 'Rishikesh', 'Shimla', 'Srinagar', 'Udaipur'
].map((value) => ({ value }));

export const RoadTripsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [origin, setOrigin] = useState(searchParams.get('origin') || 'New Delhi');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Manali');
  const [stops, setStops] = useState<string[]>(['Chandigarh', 'Bilaspur']);
  const [newStopInput, setNewStopInput] = useState('');

  const [fuelPrice, setFuelPrice] = useState(102);
  const [mileage, setMileage] = useState(14);

  const [currentPlan, setCurrentPlan] = useState<RoadTripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<RoadTripPlan[]>([]);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const trips = await roadTripService.getSavedTrips();
      setSavedTrips(trips);
      if (trips.length > 0) {
        setCurrentPlan(trips[0]);
      }
    };
    init();
  }, []);

  const handleAddStop = () => {
    if (!newStopInput.trim()) return;
    setStops([...stops, newStopInput.trim()]);
    setNewStopInput('');
  };

  const handleRemoveStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    const plan = await roadTripService.calculateTrip({
      origin,
      destination,
      stops,
      fuelPricePerLitre: fuelPrice,
      mileageKmPerLitre: mileage
    });
    setCurrentPlan(plan);
    setCalculating(false);
    showToast('Optimal highway route calculated!', 'success');
  };

  const handleSaveTrip = async () => {
    if (!currentPlan) return;
    await roadTripService.saveTrip(currentPlan);
    const trips = await roadTripService.getSavedTrips();
    setSavedTrips(trips);
    showToast('Road trip saved to your local itinerary library!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-teal-600 text-xs font-bold uppercase tracking-wider block">
            Highway & Mountain Navigation
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Interactive Road Trip Planner
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Build custom multi-stop itineraries, estimate fuel costs, uncover scenic vantage halts, and send directly to NaviBand.
          </p>
        </div>

        {/* Builder & Route Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Form: Itinerary Builder */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 dark:border-slate-800 dark:bg-[#111726]">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="h-5 w-5 text-teal-600" /> Route Configurator
            </h3>

            <form onSubmit={handleCalculateRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origin City / Landmark</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-teal-600" />
                  <LocationAutocomplete
                    id="roadtrip-origin"
                    value={origin}
                    onChange={setOrigin}
                    options={roadTripLocations}
                    className="input-field pl-10 text-xs"
                    placeholder="Choose or enter a start point"
                    required
                  />
                </div>
              </div>

              {/* Waypoints list */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intermediate Waypoints</label>
                <div className="space-y-2 mb-2">
                  {stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <span className="h-5 w-5 rounded-full bg-navy-800 text-white text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate">{stop}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <LocationAutocomplete
                    id="roadtrip-stop"
                    value={newStopInput}
                    onChange={setNewStopInput}
                    options={roadTripLocations}
                    placeholder="Add halt (e.g. Murthal, Bilaspur)..."
                    className="input-field text-xs py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-teal-600" />
                  <LocationAutocomplete
                    id="roadtrip-destination"
                    value={destination}
                    onChange={setDestination}
                    options={roadTripLocations}
                    className="input-field pl-10 text-xs"
                    placeholder="Choose or enter a destination"
                    required
                  />
                </div>
              </div>

              {/* Fuel & Mileage Config */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fuel Price (₹/L)</label>
                  <input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mileage (km/L)</label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full btn-primary py-3 text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                {calculating ? 'Optimizing Expressway Path...' : 'Calculate Optimal Itinerary'}
              </button>
            </form>
          </div>

          {/* Right Summary: Plan Details & Interactive Map Simulation */}
          <div className="lg:col-span-7 space-y-6">
            {currentPlan && (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center dark:border-slate-800 dark:bg-[#111726]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Distance</span>
                    <strong className="font-heading text-xl font-black text-slate-900 dark:text-white mt-1 block">
                      {currentPlan.totalDistanceKm} km
                    </strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center dark:border-slate-800 dark:bg-[#111726]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Drive Duration</span>
                    <strong className="font-heading text-xl font-black text-slate-900 dark:text-white mt-1 block">
                      {currentPlan.totalDurationHours} hrs
                    </strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center dark:border-slate-800 dark:bg-[#111726]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Est. Fuel Cost</span>
                    <strong className="font-heading text-xl font-black text-teal-700 mt-1 block">
                      ₹{currentPlan.fuelEstimateInr.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center dark:border-slate-800 dark:bg-[#111726]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Highway Tolls</span>
                    <strong className="font-heading text-xl font-black text-teal-700 dark:text-teal-300 mt-1 block">
                      ₹{currentPlan.tollEstimateInr.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Simulated Route Visualization Canvas */}
                <div className="bg-gradient-to-tr from-slate-900 to-navy-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                      <h4 className="font-heading font-bold text-sm text-teal-300">Live Route Blueprint</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTrip}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Bookmark className="h-3.5 w-3.5 text-teal-400" /> Save Trip
                      </button>
                    </div>
                  </div>

                  {/* Route Visual Path */}
                  <div className="py-6 flex items-center justify-between relative px-4">
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-teal-500 z-0" />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        A
                      </div>
                      <span className="text-[11px] font-bold mt-2 truncate max-w-[80px]">{currentPlan.origin}</span>
                    </div>

                    {currentPlan.stops.map((st, i) => (
                      <div key={i} className="relative z-10 flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-[10px] shadow-md">
                          {i + 1}
                        </div>
                        <span className="text-[10px] font-medium mt-2 truncate max-w-[80px] text-slate-300">{st}</span>
                      </div>
                    ))}

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        B
                      </div>
                      <span className="text-[11px] font-bold mt-2 truncate max-w-[80px]">{currentPlan.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Turn-by-Turn Directions List */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-[#111726]">
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-4">
                    Turn-by-Turn Navigation Steps ({currentPlan.steps.length})
                  </h4>
                  <div className="space-y-3">
                    {currentPlan.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        <span className="font-mono text-[10px] font-bold text-teal-700 mt-0.5 bg-teal-50 px-1.5 py-0.5 rounded">
                          STEP {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{step.instruction}</p>
                          <div className="flex gap-4 text-[11px] text-slate-400 mt-1">
                            <span>Dist: {step.distance}</span>
                            <span>Time: {step.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

