import React, { 
  useEffect, 
  useRef, 
  useState, 
  useImperativeHandle, 
  forwardRef, 
  memo 
} from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from '../../utils/leafletFix';
import 'leaflet/dist/leaflet.css';
import { Layers, Crosshair, Maximize2, MapPin, Compass } from 'lucide-react';
import { LocationPoint, ParsedRoute, ParsedManeuver, WarningStage, RouteAlternative } from '../../types/navigation';

export interface MapViewHandle {
  updateCarPosition: (lon: number, lat: number, bearing: number) => void;
  recenterOnCar: () => void;
  fitRouteBounds: () => void;
}

interface MapViewProps {
  route: ParsedRoute | null;
  alternatives?: RouteAlternative[];
  selectedRouteIndex?: number;
  onSelectAlternative?: (index: number) => void;
  startLocation: LocationPoint | null;
  destLocation: LocationPoint | null;
  waypoints?: LocationPoint[];
  upcomingManeuver?: ParsedManeuver | null;
  warningStage?: WarningStage;
  autoFollow: boolean;
  onToggleAutoFollow: () => void;
  selectionMode: 'start' | 'dest' | 'waypoint' | null;
  onMapClick: (coords: [number, number]) => void;
  initialCenter?: [number, number]; // [lat, lon]
}

// Configurable lightweight OpenStreetMap tile layers
const TILE_PROVIDERS = [
  {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    className: '',
    maxZoom: 19
  },
  {
    name: 'OpenStreetMap Humanitarian (HOT)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Tiles &copy; HOT',
    subdomains: 'abc',
    className: '',
    maxZoom: 19
  },
  {
    name: 'OpenStreetMap CartoVoyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    className: '',
    maxZoom: 19
  }
];

// Inner Controller component that has access to the Leaflet map instance
const LeafletController: React.FC<{
  route: ParsedRoute | null;
  alternatives?: RouteAlternative[];
  selectedRouteIndex?: number;
  onSelectAlternative?: (index: number) => void;
  startLocation: LocationPoint | null;
  destLocation: LocationPoint | null;
  waypoints?: LocationPoint[];
  upcomingManeuver?: ParsedManeuver | null;
  warningStage?: WarningStage;
  autoFollow: boolean;
  selectionMode: 'start' | 'dest' | 'waypoint' | null;
  onMapClick: (coords: [number, number]) => void;
  imperativeRef: React.Ref<MapViewHandle>;
}> = ({
  route,
  alternatives,
  selectedRouteIndex = 0,
  onSelectAlternative,
  startLocation,
  destLocation,
  waypoints = [],
  upcomingManeuver,
  warningStage,
  autoFollow,
  selectionMode,
  onMapClick,
  imperativeRef
}) => {
  const map = useMap();

  const carMarkerRef = useRef<L.Marker | null>(null);
  const carElementRef = useRef<HTMLDivElement | null>(null);
  const routeLayersRef = useRef<L.Layer[]>([]);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  const maneuverMarkerRef = useRef<L.CircleMarker | null>(null);

  const lastPanTimeRef = useRef<number>(0);
  const currentCarLatLngRef = useRef<L.LatLng | null>(null);

  // Invalidate map size on initial mount and resize to prevent grey tiles
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  // Map click handler for picking start or destination
  useMapEvents({
    click(e) {
      if (selectionMode) {
        onMapClick([e.latlng.lng, e.latlng.lat]);
      }
    }
  });

  // Expose imperative methods for high-frequency car movement
  useImperativeHandle(imperativeRef, () => ({
    updateCarPosition(lon: number, lat: number, bearing: number) {
      const latlng = L.latLng(lat, lon);
      currentCarLatLngRef.current = latlng;

      if (!carMarkerRef.current) {
        // Create lightweight 2D SVG directional vehicle icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'vehicle-marker-container';
        iconDiv.style.width = '36px';
        iconDiv.style.height = '36px';
        iconDiv.style.display = 'flex';
        iconDiv.style.alignItems = 'center';
        iconDiv.style.justifyContent = 'center';
        iconDiv.style.transform = `rotate(${bearing}deg)`;

        iconDiv.innerHTML = `
          <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#06b6d4" fill-opacity="0.25" stroke="#22d3ee" stroke-width="2"/>
              <path d="M16 4L25 25L16 20L7 25L16 4Z" fill="#10b981" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>
          </div>
        `;

        carElementRef.current = iconDiv;

        const customIcon = L.divIcon({
          html: iconDiv,
          className: 'leaflet-vehicle-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        carMarkerRef.current = L.marker(latlng, {
          icon: customIcon,
          zIndexOffset: 1000
        }).addTo(map);
      } else {
        // Direct marker coordinate update
        carMarkerRef.current.setLatLng(latlng);

        // Direct DOM rotation update
        if (carElementRef.current) {
          carElementRef.current.style.transform = `rotate(${bearing}deg)`;
        }
      }

      // Smooth throttled auto-follow
      if (autoFollow) {
        const now = performance.now();
        if (now - lastPanTimeRef.current > 750) {
          const mapCenter = map.getCenter();
          if (map.distance(latlng, mapCenter) > 25) {
            map.panTo(latlng, { animate: true, duration: 0.5 });
            lastPanTimeRef.current = now;
          }
        }
      }
    },

    recenterOnCar() {
      if (currentCarLatLngRef.current) {
        map.setView(currentCarLatLngRef.current, Math.max(map.getZoom(), 15), { animate: true });
      } else if (startLocation) {
        map.setView([startLocation.coordinates[1], startLocation.coordinates[0]], 15, { animate: true });
      }
    },

    fitRouteBounds() {
      const activeLayer = routeLayersRef.current[routeLayersRef.current.length - 1];
      if (activeLayer && 'getBounds' in activeLayer) {
        map.fitBounds((activeLayer as L.Polyline).getBounds(), { padding: [50, 50], maxZoom: 16 });
      }
    }
  }), [map, autoFollow, startLocation]);

  // Handle Multiple Route Polylines rendering
  useEffect(() => {
    // Clean old route layers
    routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
    routeLayersRef.current = [];

    const bounds = L.latLngBounds([]);

    // Case 1: Multiple alternatives available
    if (alternatives && alternatives.length > 0) {
      // First draw unselected alternative routes in the background
      alternatives.forEach((alt) => {
        if (alt.index === selectedRouteIndex) return;

        const coords: L.LatLngExpression[] = alt.parsedRoute.coordinates.map(([lon, lat]) => [lat, lon]);
        coords.forEach((c) => bounds.extend(c));

        const altPolyline = L.polyline(coords, {
          color: alt.color || '#64748b',
          weight: 4,
          opacity: 0.55,
          dashArray: '6, 6',
          lineCap: 'round',
          lineJoin: 'round',
          className: 'cursor-pointer'
        }).addTo(map);

        altPolyline.bindTooltip(
          `<b>${alt.label} (${alt.badge})</b><br/>${alt.distanceKm} km · ${alt.durationMin} min`,
          { sticky: true }
        );

        altPolyline.on('click', () => {
          if (onSelectAlternative) {
            onSelectAlternative(alt.index);
          }
        });

        routeLayersRef.current.push(altPolyline);
      });

      // Now draw the SELECTED route prominently on top
      const selectedAlt = alternatives[selectedRouteIndex] || alternatives[0];
      if (selectedAlt && selectedAlt.parsedRoute.coordinates.length > 0) {
        const coords: L.LatLngExpression[] = selectedAlt.parsedRoute.coordinates.map(([lon, lat]) => [lat, lon]);
        coords.forEach((c) => bounds.extend(c));

        // Outline
        const outline = L.polyline(coords, {
          color: selectedAlt.outlineColor || '#064e3b',
          weight: 9,
          opacity: 0.7,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // Core line
        const line = L.polyline(coords, {
          color: selectedAlt.color || '#10b981',
          weight: 6,
          opacity: 0.98,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        line.bindTooltip(`<b>${selectedAlt.label} (ACTIVE)</b><br/>${selectedAlt.distanceKm} km · ${selectedAlt.durationMin} min`, {
          sticky: true
        });

        routeLayersRef.current.push(outline);
        routeLayersRef.current.push(line);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    } else if (route && route.coordinates.length > 0) {
      // Case 2: Single route fallback
      const latlngs: L.LatLngExpression[] = route.coordinates.map(([lon, lat]) => [lat, lon]);

      const outline = L.polyline(latlngs, {
        color: '#064e3b',
        weight: 9,
        opacity: 0.7,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      const line = L.polyline(latlngs, {
        color: '#10b981',
        weight: 6,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routeLayersRef.current.push(outline);
      routeLayersRef.current.push(line);

      map.fitBounds(line.getBounds(), { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, alternatives, selectedRouteIndex, route, onSelectAlternative]);

  // Handle Start & Destination Markers
  useEffect(() => {
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (startLocation) {
      const [lon, lat] = startLocation.coordinates;
      const startIcon = L.divIcon({
        className: 'start-pin-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              A
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      startMarkerRef.current = L.marker([lat, lon], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Start Point:</b><br/>${startLocation.label}`);
    }

    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
    if (destLocation) {
      const [lon, lat] = destLocation.coordinates;
      const destIcon = L.divIcon({
        className: 'dest-pin-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #ef4444; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              B
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      destMarkerRef.current = L.marker([lat, lon], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destination:</b><br/>${destLocation.label}`);
    }
  }, [map, startLocation, destLocation]);

  useEffect(() => {
    waypointMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    waypointMarkersRef.current = waypoints.map((waypoint, index) => {
      const [lon, lat] = waypoint.coordinates;
      const icon = L.divIcon({
        className: 'waypoint-pin-marker',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:#0891b2;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:bold;">${index + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const popup = L.DomUtil.create('div');
      popup.textContent = `Stop ${index + 1}: ${waypoint.label}`;
      return L.marker([lat, lon], { icon }).addTo(map).bindPopup(popup);
    });

    return () => {
      waypointMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      waypointMarkersRef.current = [];
    };
  }, [map, waypoints]);

  // Handle Upcoming Maneuver Waypoint Highlight
  useEffect(() => {
    if (maneuverMarkerRef.current) {
      map.removeLayer(maneuverMarkerRef.current);
      maneuverMarkerRef.current = null;
    }

    if (
      upcomingManeuver &&
      upcomingManeuver.coordinates &&
      upcomingManeuver.coordinates.length === 2 &&
      upcomingManeuver.direction !== 'STRAIGHT' &&
      upcomingManeuver.direction !== 'ARRIVED' &&
      (warningStage === 'INITIAL_WARNING' ||
       warningStage === 'MAIN_WARNING' ||
       warningStage === 'EARLY_WARNING' ||
       warningStage === 'IMMEDIATE_WARNING' ||
       warningStage === 'MAINTAIN_TURN')
    ) {
      const [lon, lat] = upcomingManeuver.coordinates;
      const isUrgent = warningStage === 'MAIN_WARNING' || warningStage === 'IMMEDIATE_WARNING' || warningStage === 'MAINTAIN_TURN';

      const circle = L.circleMarker([lat, lon], {
        radius: isUrgent ? 14 : 10,
        color: isUrgent ? '#22d3ee' : '#f59e0b',
        fillColor: isUrgent ? '#06b6d4' : '#fbbf24',
        fillOpacity: 0.55,
        weight: isUrgent ? 3 : 2,
        className: 'maneuver-highlight-marker'
      }).addTo(map);

      circle.bindTooltip(`<b>${upcomingManeuver.instruction}</b>`, {
        permanent: false,
        direction: 'top'
      });

      maneuverMarkerRef.current = circle;
    }
  }, [map, upcomingManeuver, warningStage]);

  useEffect(() => {
    return () => {
      if (carMarkerRef.current) map.removeLayer(carMarkerRef.current);
      routeLayersRef.current.forEach((layer) => map.removeLayer(layer));
      if (startMarkerRef.current) map.removeLayer(startMarkerRef.current);
      if (destMarkerRef.current) map.removeLayer(destMarkerRef.current);
      waypointMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      if (maneuverMarkerRef.current) map.removeLayer(maneuverMarkerRef.current);
    };
  }, [map]);

  return null;
};

// Main MapView Component
export const MapView = memo(forwardRef<MapViewHandle, MapViewProps>(({
  route,
  alternatives,
  selectedRouteIndex = 0,
  onSelectAlternative,
  startLocation,
  destLocation,
  waypoints = [],
  upcomingManeuver,
  warningStage,
  autoFollow,
  onToggleAutoFollow,
  selectionMode,
  onMapClick,
  initialCenter = [27.1751, 78.0421], // Agra / Taj Mahal default
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapKey] = useState(() => `naviband-map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const [activeTileIndex, setActiveTileIndex] = useState(0);
  const [showTileSelector, setShowTileSelector] = useState(false);

  useEffect(() => {
    const mapContainer = containerRef.current;
    return () => {
      if (mapContainer) {
        const leafletEl = mapContainer.querySelector('.leaflet-container');
        if (leafletEl && (leafletEl as any)._leaflet_id) {
          (leafletEl as any)._leaflet_id = null;
        }
      }
    };
  }, []);

  const activeProvider = TILE_PROVIDERS[activeTileIndex];

  const handleRecenter = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.recenterOnCar();
    }
  };

  const handleFitRoute = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.fitRouteBounds();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[460px] sm:h-[530px] lg:h-[590px] xl:h-[620px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900">
      
      {/* Selection Mode Notice Banner */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/60 shadow-xl backdrop-blur-md flex items-center space-x-2 text-cyan-200 text-xs sm:text-sm font-medium animate-bounce pointer-events-none">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Click anywhere on the map to set <b>{selectionMode === 'start' ? 'Starting Point' : selectionMode === 'dest' ? 'Destination' : 'a route stop'}</b></span>
        </div>
      )}

      {/* React-Leaflet 2D Map Container */}
      <MapContainer
        key={mapKey}
        center={initialCenter}
        zoom={12}
        zoomControl={false}
        attributionControl={true}
        preferCanvas={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          key={activeProvider.name}
          url={activeProvider.url}
          attribution={activeProvider.attribution}
          subdomains={activeProvider.subdomains}
          maxZoom={activeProvider.maxZoom}
          className={activeProvider.className}
        />

        <LeafletController
          route={route}
          alternatives={alternatives}
          selectedRouteIndex={selectedRouteIndex}
          onSelectAlternative={onSelectAlternative}
          startLocation={startLocation}
          destLocation={destLocation}
          waypoints={waypoints}
          upcomingManeuver={upcomingManeuver}
          warningStage={warningStage}
          autoFollow={autoFollow}
          selectionMode={selectionMode}
          onMapClick={onMapClick}
          imperativeRef={ref}
        />
      </MapContainer>

      {/* Map Floating Tools */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col space-y-2">
        {(route || (alternatives && alternatives.length > 0)) && (
          <button
            onClick={handleFitRoute}
            title="Fit Full Route"
            className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg border border-slate-700 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleRecenter}
          title="Recenter on Vehicle / Start"
          className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg border border-slate-700 cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleAutoFollow}
          title={autoFollow ? 'Disable Auto Follow' : 'Enable Auto Follow'}
          className={`p-2.5 rounded-xl transition-all shadow-lg border cursor-pointer ${
            autoFollow
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
          }`}
        >
          <Compass className={`w-4 h-4 ${autoFollow ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTileSelector(!showTileSelector)}
            title="Map Style"
            className="p-2.5 rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg border border-slate-700 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showTileSelector && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-900/95 border border-slate-700 p-1.5 shadow-2xl z-50">
              <span className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1 block">Map Style</span>
              {TILE_PROVIDERS.map((provider, idx) => (
                <button
                  key={provider.name}
                  onClick={() => {
                    setActiveTileIndex(idx);
                    setShowTileSelector(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTileIndex === idx
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-[11px] font-mono text-slate-300 border border-slate-700 shadow-lg pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="font-semibold text-emerald-300">Active Route</span>
        </div>
        {alternatives && alternatives.length > 1 && (
          <>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 bg-indigo-400 rounded-full border border-dashed border-indigo-300" />
              <span>Alternatives</span>
            </div>
          </>
        )}
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Vehicle</span>
        </div>
      </div>
    </div>
  );
}));

