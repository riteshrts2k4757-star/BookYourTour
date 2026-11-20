import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from '../../utils/leafletFix';
import 'leaflet/dist/leaflet.css';
import { fetchRouteDirections } from '../../services/naviband/navibandApi';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export interface TourStop {
  address?: string;
  description?: string;
  coordinates?: [number, number]; // [lon, lat]
  day?: number;
  photo?: string;
}

interface TourAttractionsMapProps {
  stops: TourStop[];
  onSelectStop?: (stop: TourStop, index: number) => void;
}

// Controller to auto-fit bounds on stops change
const MapBoundsController: React.FC<{ stops: TourStop[]; routeCoords: [number, number][] }> = ({ stops, routeCoords }) => {
  const map = useMap();
  const boundsKey = JSON.stringify({
    stops: stops.map((stop) => stop.coordinates || null),
    route: routeCoords
  });
  const previousBoundsKey = useRef('');

  useEffect(() => {
    const shouldFitBounds = previousBoundsKey.current !== boundsKey;
    const coordinates = JSON.parse(boundsKey) as {
      stops: Array<[number, number] | null>;
      route: [number, number][];
    };
    const bounds = L.latLngBounds([]);
    coordinates.stops.forEach((stop) => {
      if (stop) bounds.extend([stop[1], stop[0]]);
    });
    coordinates.route.forEach(([lat, lon]) => {
      bounds.extend([lat, lon]);
    });

    const container = map.getContainer();
    const updateMapSize = () => {
      if (!container.isConnected || !container.offsetWidth || !container.offsetHeight) return;

      map.invalidateSize({ pan: false });
      if (shouldFitBounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    };

    previousBoundsKey.current = boundsKey;
    const frame = window.requestAnimationFrame(updateMapSize);
    const resizeObserver = new ResizeObserver(updateMapSize);
    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [map, boundsKey]);

  return null;
};

export const TourAttractionsMap: React.FC<TourAttractionsMapProps> = ({ stops, onSelectStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapKey] = useState(() => `tour-map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.min(1, stops.length - 1));
  const [calculating, setCalculating] = useState(false);
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) {
        const leafletEl = container.querySelector('.leaflet-container');
        if (leafletEl && (leafletEl as any)._leaflet_id) {
          (leafletEl as any)._leaflet_id = null;
        }
      }
    };
  }, []);

  const validStops = useMemo(
    () => stops.filter((stop) => stop.coordinates && stop.coordinates.length === 2 && stop.coordinates.every(Number.isFinite)),
    [stops]
  );

  const calculateStopRoute = async () => {
    if (validStops.length < 2 || startIndex === endIndex) return;
    setCalculating(true);
    try {
      const start = validStops[startIndex].coordinates!;
      const end = validStops[endIndex].coordinates!;
      const data = await fetchRouteDirections([start, end]);
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords)) {
        // Convert [lon, lat] to Leaflet [lat, lon]
        const leafletCoords: [number, number][] = coords.map(([lon, lat]) => [lat, lon]);
        setRouteLine(leafletCoords);
        const dist = data?.features?.[0]?.properties?.segments?.[0]?.distance;
        if (dist) {
          setRouteDistance(`${(dist / 1000).toFixed(1)} km`);
        }
      }
    } catch (e) {
      console.error('Stop route calculation error', e);
    } finally {
      setCalculating(false);
    }
  };

  const initialCenter: [number, number] = validStops.length > 0 && validStops[0].coordinates
    ? [validStops[0].coordinates[1], validStops[0].coordinates[0]]
    : [27.1751, 78.0421];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Route Between Stops Selector Bar */}
      {validStops.length > 1 && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Plan Segment:</span>
            <select
              value={startIndex}
              onChange={(e) => setStartIndex(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {validStops.map((stop, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {stop.address || `Stop ${idx + 1}`}
                </option>
              ))}
            </select>

            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />

            <select
              value={endIndex}
              onChange={(e) => setEndIndex(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {validStops.map((stop, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {stop.address || `Stop ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {routeDistance && (
              <span className="font-mono text-teal-400 font-semibold px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                {routeDistance}
              </span>
            )}
            <button
              onClick={calculateStopRoute}
              disabled={calculating || startIndex === endIndex}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Show Route</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Leaflet Map Frame */}
      <div ref={containerRef} className="relative w-full h-[380px] sm:h-[440px]">
        <MapContainer
          key={mapKey}
          center={initialCenter}
          zoom={12}
          dragging={true}
          touchZoom={true}
          zoomControl={false}
          attributionControl={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapBoundsController stops={validStops} routeCoords={routeLine} />

          {/* Polyline connecting stops if calculated */}
          {routeLine.length > 0 && (
            <>
              <Polyline positions={routeLine} color="#064e3b" weight={8} opacity={0.6} />
              <Polyline positions={routeLine} color="#10b981" weight={5} opacity={0.95} />
            </>
          )}

          {/* Markers for each stop */}
          {validStops.map((stop, index) => {
            const [lon, lat] = stop.coordinates!;
            const isOrigin = index === startIndex;
            const isDestination = index === endIndex;
            const markerColor = isOrigin ? '#10b981' : isDestination ? '#ef4444' : '#0d9488';

            const customMarkerIcon = L.divIcon({
              className: 'tour-stop-marker',
              html: `
                <div style="width: 28px; height: 28px; border-radius: 50%; background: ${markerColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                  ${index + 1}
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            return (
              <Marker
                key={index}
                position={[lat, lon]}
                icon={customMarkerIcon}
                eventHandlers={{
                  click: () => onSelectStop && onSelectStop(stop, index)
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 max-w-xs">
                    {stop.photo && (
                      <img src={stop.photo} alt={stop.address} className="w-full h-24 object-cover rounded-md mb-2" />
                    )}
                    <div className="font-bold text-xs">{stop.address || `Stop ${index + 1}`}</div>
                    {stop.day && (
                      <span className="inline-block text-[10px] font-mono font-semibold text-teal-700 mt-0.5">Day {stop.day}</span>
                    )}
                    <p className="text-[11px] text-slate-600 mt-1">{stop.description || 'Tour itinerary attraction'}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

