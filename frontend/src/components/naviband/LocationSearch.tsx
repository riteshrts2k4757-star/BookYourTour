import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  Search, 
  MapPin, 
  ArrowUpDown, 
  MousePointerClick, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { searchPlaces, GeocodeItem } from '../../services/naviband/navibandApi';
import { LocationPoint } from '../../types/navigation';

interface LocationSearchProps {
  startLocation: LocationPoint | null;
  destLocation: LocationPoint | null;
  onSetStartLocation: (loc: LocationPoint) => void;
  onSetDestLocation: (loc: LocationPoint) => void;
  onSwapLocations: () => void;
  onFindRoute: () => void;
  isLoadingRoute: boolean;
  selectionMode: 'start' | 'dest' | 'waypoint' | null;
  onToggleSelectionMode: (mode: 'start' | 'dest' | 'waypoint') => void;
  waypoints: LocationPoint[];
  onRemoveWaypoint: (index: number) => void;
  errorMessage: string | null;
}

const PRESET_ROUTES = [
  {
    name: 'Agra Heritage Tour',
    start: { label: 'Agra Fort, Agra, UP', coordinates: [78.0211, 27.1795] as [number, number] },
    dest: { label: 'Taj Mahal, Agra, UP', coordinates: [78.0421, 27.1751] as [number, number] },
  },
  {
    name: 'Delhi Capital Corridor',
    start: { label: 'India Gate, New Delhi', coordinates: [77.2295, 28.6129] as [number, number] },
    dest: { label: 'Red Fort, Old Delhi', coordinates: [77.2410, 28.6562] as [number, number] },
  },
  {
    name: 'Jaipur Pink City Circuit',
    start: { label: 'City Palace, Jaipur', coordinates: [75.8237, 26.9258] as [number, number] },
    dest: { label: 'Hawa Mahal, Jaipur', coordinates: [75.8267, 26.9239] as [number, number] },
  },
  {
    name: 'Goa Coastal Drive',
    start: { label: 'Panaji Church, Goa', coordinates: [73.8278, 15.4989] as [number, number] },
    dest: { label: 'Baga Beach, Calangute, Goa', coordinates: [73.7517, 15.5553] as [number, number] },
  }
];

export const LocationSearch = memo<LocationSearchProps>(({
  startLocation,
  destLocation,
  onSetStartLocation,
  onSetDestLocation,
  onSwapLocations,
  onFindRoute,
  isLoadingRoute,
  selectionMode,
  onToggleSelectionMode,
  waypoints,
  onRemoveWaypoint,
  errorMessage,
}) => {
  const [startQuery, setStartQuery] = useState(startLocation?.label || '');
  const [destQuery, setDestQuery] = useState(destLocation?.label || '');

  const [startSuggestions, setStartSuggestions] = useState<GeocodeItem[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodeItem[]>([]);

  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const startDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const destDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startLocation) setStartQuery(startLocation.label);
  }, [startLocation]);

  useEffect(() => {
    if (destLocation) setDestQuery(destLocation.label);
  }, [destLocation]);

  const handleStartQueryChange = (text: string) => {
    setStartQuery(text);
    if (startDebounceRef.current) clearTimeout(startDebounceRef.current);

    if (text.trim().length < 2) {
      setStartSuggestions([]);
      return;
    }

    startDebounceRef.current = setTimeout(async () => {
      setIsSearchingStart(true);
      try {
        const results = await searchPlaces(text, 5);
        setStartSuggestions(results);
      } catch (err: any) {
        console.error('Start search error:', err.message);
      } finally {
        setIsSearchingStart(false);
      }
    }, 350);
  };

  const handleDestQueryChange = (text: string) => {
    setDestQuery(text);
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);

    if (text.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    destDebounceRef.current = setTimeout(async () => {
      setIsSearchingDest(true);
      try {
        const results = await searchPlaces(text, 5);
        setDestSuggestions(results);
      } catch (err: any) {
        console.error('Dest search error:', err.message);
      } finally {
        setIsSearchingDest(false);
      }
    }, 350);
  };

  const selectStart = (item: GeocodeItem) => {
    onSetStartLocation({ label: item.label, coordinates: item.coordinates });
    setStartQuery(item.label);
    setStartSuggestions([]);
  };

  const selectDest = (item: GeocodeItem) => {
    onSetDestLocation({ label: item.label, coordinates: item.coordinates });
    setDestQuery(item.label);
    setDestSuggestions([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-teal-400" />
          <h3 className="font-bold text-sm text-white">Route Planner</h3>
        </div>
        <div className="flex items-center space-x-1">
          {PRESET_ROUTES.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => {
                onSetStartLocation(p.start);
                onSetDestLocation(p.dest);
              }}
              className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Start Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400" />
            <input
              type="text"
              value={startQuery}
              onChange={(e) => handleStartQueryChange(e.target.value)}
              placeholder="Search origin or click map..."
              className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            {isSearchingStart && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
            )}
          </div>
          <button
            onClick={() => onToggleSelectionMode('start')}
            title="Pick on map"
            className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
              selectionMode === 'start'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Start Suggestions Dropdown */}
        {startSuggestions.length > 0 && (
          <div className="absolute left-0 right-10 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
            {startSuggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => selectStart(item)}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-900 last:border-0 truncate cursor-pointer"
              >
                <div className="font-medium truncate">{item.name || item.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{item.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-1">
        <button
          onClick={onSwapLocations}
          title="Swap Start & Destination"
          className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Destination Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500" />
            <input
              type="text"
              value={destQuery}
              onChange={(e) => handleDestQueryChange(e.target.value)}
              placeholder="Search destination or click map..."
              className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            {isSearchingDest && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
            )}
          </div>
          <button
            onClick={() => onToggleSelectionMode('dest')}
            title="Pick on map"
            className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
              selectionMode === 'dest'
                ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dest Suggestions Dropdown */}
        {destSuggestions.length > 0 && (
          <div className="absolute left-0 right-10 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
            {destSuggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => selectDest(item)}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-900 last:border-0 truncate cursor-pointer"
              >
                <div className="font-medium truncate">{item.name || item.label}</div>
                <div className="text-[10px] text-slate-500 truncate">{item.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {waypoints.length > 0 && (
          <div className="space-y-1.5">
            {waypoints.map((waypoint, index) => (
              <div key={`${waypoint.coordinates.join(',')}-${index}`} className="flex items-center gap-2 rounded-lg bg-slate-950 px-2.5 py-2 text-xs text-slate-300">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="flex-1 truncate">{index + 1}. {waypoint.label}</span>
                <button
                  type="button"
                  onClick={() => onRemoveWaypoint(index)}
                  aria-label={`Remove waypoint ${waypoint.label}`}
                  className="rounded px-1 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => onToggleSelectionMode('waypoint')}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
            selectionMode === 'waypoint'
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
              : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add a stop by clicking the map
        </button>
      </div>

      {/* Calculate Route CTA */}
      <button
        onClick={onFindRoute}
        disabled={isLoadingRoute || !startLocation || !destLocation}
        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow transition-all"
      >
        {isLoadingRoute ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Calculating Route...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calculate Route Directions</span>
          </>
        )}
      </button>
    </div>
  );
});
LocationSearch.displayName = 'LocationSearch';

