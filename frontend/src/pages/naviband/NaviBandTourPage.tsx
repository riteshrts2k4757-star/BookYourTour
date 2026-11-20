import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Watch, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Compass, 
  Gauge, 
  Sparkles,
  Camera,
  Layers,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import { tourService } from '../../services/mock/tourService';
import { Tour } from '../../data/tours';
import { MapView, MapViewHandle } from '../../components/naviband/MapView';
import { WristbandSimulator } from '../../components/naviband/WristbandSimulator';
import { NavigationInstruction } from '../../components/naviband/NavigationInstruction';
import { SimulationControls } from '../../components/naviband/SimulationControls';
import { LEDTestPanel } from '../../components/naviband/LEDTestPanel';
import { 
  LocationPoint, 
  ParsedRoute, 
  SimulationStatus, 
  LEDState, 
  WarningStage,
  DEFAULT_ADAPTIVE_CONFIG,
  AdaptiveAlertConfig
} from '../../types/navigation';
import { fetchRouteDirections } from '../../services/naviband/navibandApi';
import { parseOrsRouteResponse } from '../../utils/turnClassifier';
import { AdaptiveAlertEngine } from '../../utils/adaptiveAlertEngine';
import { audioAlerts } from '../../utils/audioAlerts';
import { getPositionAtDistance, formatDistance } from '../../utils/geoUtils';
import { LedScheduler } from '../../utils/ledScheduler';
import { SimulatorWristbandOutput } from '../../services/naviband/wristbandOutput';

export const NaviBandTourPage: React.FC = () => {
  const { tourId, checkpointId } = useParams<{ tourId: string; checkpointId?: string }>();
  const navigate = useNavigate();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  // Checkpoints in current tour route
  const [checkpoints, setCheckpoints] = useState<LocationPoint[]>([]);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [visitedCheckpoints, setVisitedCheckpoints] = useState<string[]>([]);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [arrivedCheckpoint, setArrivedCheckpoint] = useState<LocationPoint | null>(null);

  // Route calculation
  const [route, setRoute] = useState<ParsedRoute | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Simulation execution state
  const [status, setStatus] = useState<SimulationStatus>('IDLE');
  const [speedKmh, setSpeedKmh] = useState(50);
  const [autoFollow, setAutoFollow] = useState(true);

  // Telemetry
  const [telemetry, setTelemetry] = useState<{
    progressMeters: number;
    activeStepIndex: number;
    distanceToNextTurn: number;
    warningStage: WarningStage;
  }>({
    progressMeters: 0,
    activeStepIndex: 0,
    distanceToNextTurn: 0,
    warningStage: 'APPROACHING'
  });

  // LED & Hardware State
  const [ledState, setLedState] = useState<LEDState>({
    leftRed: false,
    leftGreen: false,
    rightRed: false,
    rightGreen: false
  });

  // Custom Stop input
  const [newStopName, setNewStopName] = useState('');

  const mapViewRef = useRef<MapViewHandle>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const currentDistanceRef = useRef<number>(0);
  const speedRef = useRef<number>(speedKmh);
  const routeRef = useRef<ParsedRoute | null>(null);
  const statusRef = useRef<SimulationStatus>(status);

  useEffect(() => {
    speedRef.current = speedKmh;
  }, [speedKmh]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  // LED Scheduler & Hardware Output
  const ledSchedulerRef = useRef<LedScheduler | null>(null);
  const wristbandOutputRef = useRef<SimulatorWristbandOutput | null>(null);

  if (!ledSchedulerRef.current) {
    ledSchedulerRef.current = new LedScheduler(
      (state) => setLedState(state),
      () => {},
      250,
      200
    );
    wristbandOutputRef.current = new SimulatorWristbandOutput(ledSchedulerRef.current);
  }

  // Build initial checkpoints: Airport -> Hotel -> Attractions -> Return
  const buildInitialCheckpoints = useCallback((tourData: Tour): LocationPoint[] => {
    const list: LocationPoint[] = [];

    // 1. Airport Arrival
    if (tourData.airport) {
      list.push({
        label: tourData.airport.name,
        coordinates: tourData.airport.coordinates,
        type: 'airport',
        description: 'Flight landing, greeting, and luxury transfer pickup.'
      });
    }

    // 2. Hotel Check-in
    if (tourData.hotel) {
      list.push({
        label: tourData.hotel.name,
        coordinates: tourData.hotel.coordinates,
        type: 'hotel',
        description: 'Check-in, welcome refreshments, and luggage handover.'
      });
    }

    // 3. Tour Attractions
    tourData.locations.forEach((loc, idx) => {
      list.push({
        label: loc.description,
        coordinates: loc.coordinates,
        photo: loc.photo || tourData.images[idx % tourData.images.length],
        type: 'attraction',
        day: loc.day,
        description: `Day ${loc.day} guided exploration and cultural immersion.`
      });
    });

    // 4. Return to Airport / Hub
    if (tourData.airport) {
      list.push({
        label: `${tourData.airport.name} (Departure Hub)`,
        coordinates: tourData.airport.coordinates,
        type: 'airport',
        description: 'Expedition farewell, luggage assistance, and boarding gates.'
      });
    }

    return list;
  }, []);

  // Compute Full Multi-Waypoint Route
  const recalculateTourRoute = useCallback(async (points: LocationPoint[]) => {
    if (points.length < 2) return;
    setCalculatingRoute(true);

    try {
      const coords = points.map((p) => p.coordinates);
      const geojson = await fetchRouteDirections(coords);
      const parsed = parseOrsRouteResponse(geojson);

      setRoute(parsed);
      routeRef.current = parsed;
      currentDistanceRef.current = 0;

      setTelemetry({
        progressMeters: 0,
        activeStepIndex: 0,
        distanceToNextTurn: parsed.steps[0]?.segmentDistance || 0,
        warningStage: 'APPROACHING'
      });

      setStatus('IDLE');
      ledSchedulerRef.current?.turnOffAll();

      if (parsed.coordinates.length > 0) {
        mapViewRef.current?.updateCarPosition(parsed.coordinates[0][0], parsed.coordinates[0][1], 0);
      }
    } catch (e) {
      console.error('Route calculation failed:', e);
    } finally {
      setCalculatingRoute(false);
    }
  }, []);

  // Load tour on mount
  useEffect(() => {
    const load = async () => {
      if (!tourId) return;
      setLoading(true);
      const data = await tourService.getById(tourId);
      if (data) {
        setTour(data);
        const pts = buildInitialCheckpoints(data);
        setCheckpoints(pts);
        await recalculateTourRoute(pts);
      }
      setLoading(false);
    };
    load();
  }, [tourId, buildInitialCheckpoints, recalculateTourRoute]);

  // Reorder checkpoints
  const moveCheckpoint = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= checkpoints.length) return;

    const updated = [...checkpoints];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setCheckpoints(updated);
    recalculateTourRoute(updated);
  };

  // Remove checkpoint
  const removeCheckpoint = (index: number) => {
    if (checkpoints.length <= 2) return;
    const updated = checkpoints.filter((_, i) => i !== index);
    setCheckpoints(updated);
    recalculateTourRoute(updated);
  };

  // Add custom checkpoint
  const handleAddCustomStop = () => {
    if (!newStopName.trim()) return;
    // Offset slightly from previous stop
    const lastCoord = checkpoints[checkpoints.length - 1]?.coordinates || [78.0421, 27.1751];
    const newCoord: [number, number] = [
      lastCoord[0] + (Math.random() - 0.5) * 0.04,
      lastCoord[1] + (Math.random() - 0.5) * 0.04
    ];

    const newPoint: LocationPoint = {
      label: newStopName.trim(),
      coordinates: newCoord,
      type: 'stop',
      description: 'Custom traveler requested checkpoint stop'
    };

    const updated = [...checkpoints.slice(0, -1), newPoint, checkpoints[checkpoints.length - 1]];
    setCheckpoints(updated);
    setNewStopName('');
    recalculateTourRoute(updated);
  };

  // Simulation loop
  const updateSimulationFrame = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaSec = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const currentRoute = routeRef.current;
    if (!currentRoute || statusRef.current !== 'RUNNING') return;

    const speedMps = (speedRef.current * 1000) / 3600;
    currentDistanceRef.current += speedMps * deltaSec;

    const totalDist = currentRoute.totalDistanceMeters;

    // Checkpoint arrival check
    const currentVehicle = getPositionAtDistance(
      currentRoute.coordinates,
      currentRoute.cumulativeDistances,
      currentDistanceRef.current
    );

    mapViewRef.current?.updateCarPosition(
      currentVehicle.coordinates[0],
      currentVehicle.coordinates[1],
      currentVehicle.bearing
    );

    // Check if reached destination
    if (currentDistanceRef.current >= totalDist) {
      currentDistanceRef.current = totalDist;
      setStatus('ARRIVED');
      wristbandOutputRef.current?.sendArrival();
      audioAlerts.playArrivalChime();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      return;
    }

    // Step guidance
    const steps = currentRoute.steps;
    let nextStepIdx = steps.findIndex((s) => s.distanceFromStart > currentDistanceRef.current);
    if (nextStepIdx === -1) nextStepIdx = Math.max(0, steps.length - 1);
    const upcomingStep = steps[nextStepIdx];

    let distToTurn = 0;
    let currentStage: WarningStage = 'APPROACHING';

    if (upcomingStep) {
      distToTurn = upcomingStep.distanceFromStart - currentDistanceRef.current;
      const thresholds = AdaptiveAlertEngine.calculateThresholds(speedRef.current, DEFAULT_ADAPTIVE_CONFIG);

      if (distToTurn <= thresholds.mainWarningDistance && distToTurn > -10) {
        currentStage = 'MAIN_WARNING';
        if (upcomingStep.isUTurn) {
          wristbandOutputRef.current?.sendUTurn('LEFT', upcomingStep.pulseCount);
        } else {
          wristbandOutputRef.current?.sendTurn(upcomingStep.direction as any, upcomingStep.pulseCount);
        }
        audioAlerts.playMainTurnAlert(upcomingStep.pulseCount);
      } else if (distToTurn <= thresholds.initialWarningDistance) {
        currentStage = 'INITIAL_WARNING';
        audioAlerts.playInitialApproachChime();
      }
    }

    setTelemetry({
      progressMeters: currentDistanceRef.current,
      activeStepIndex: nextStepIdx,
      distanceToNextTurn: distToTurn,
      warningStage: currentStage
    });

    animFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);
  }, []);

  useEffect(() => {
    if (status === 'RUNNING') {
      lastTimeRef.current = performance.now();
      animFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);
    } else {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [status, updateSimulationFrame]);

  // Trigger arrival modal for a specific checkpoint
  const triggerCheckpointArrival = (point: LocationPoint) => {
    setArrivedCheckpoint(point);
    setShowArrivalModal(true);
    wristbandOutputRef.current?.sendArrival();
    audioAlerts.playArrivalChime();
    confetti({ particleCount: 60, spread: 60 });
  };

  const markCheckpointVisited = (pointLabel: string) => {
    if (!visitedCheckpoints.includes(pointLabel)) {
      setVisitedCheckpoints([...visitedCheckpoints, pointLabel]);
    }
    setShowArrivalModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Synthesizing Tour NaviBand Expedition...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <h2 className="text-xl font-bold">Tour Expedition Not Found</h2>
        <Link to="/tours" className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold">
          Back to Tours
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Link to={`/tours/${tour.id}`} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Tour Details</span>
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400 font-mono">Live Navigation Mode</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
              <span>{tour.name}</span>
              <span className="text-xs font-normal font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                NaviBand Active
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">Total Waypoints: <b className="text-white">{checkpoints.length}</b></span>
            <span className="text-xs text-slate-400">Visited: <b className="text-teal-400">{visitedCheckpoints.length}</b></span>
          </div>
        </div>

        {/* Primary Two-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: 2D Leaflet Interactive Map & Checkpoints Manager */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Map View */}
            <MapView
              ref={mapViewRef}
              route={route}
              startLocation={checkpoints[0] || null}
              destLocation={checkpoints[checkpoints.length - 1] || null}
              upcomingManeuver={route?.steps[telemetry.activeStepIndex]}
              warningStage={telemetry.warningStage}
              autoFollow={autoFollow}
              onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
              selectionMode={null}
              onMapClick={() => {}}
              initialCenter={checkpoints[0] ? [checkpoints[0].coordinates[1], checkpoints[0].coordinates[0]] : [27.1751, 78.0421]}
            />

            {/* Checkpoint Itinerary Reordering Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <h3 className="font-bold text-sm text-white">Tour Checkpoints & Custom Stops</h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Airport ➔ Hotel ➔ Attractions ➔ Return
                </span>
              </div>

              {/* Checkpoint Item List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {checkpoints.map((pt, idx) => {
                  const isVisited = visitedCheckpoints.includes(pt.label);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isVisited
                          ? 'bg-teal-950/20 border-teal-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          pt.type === 'airport' ? 'bg-indigo-600 text-white' :
                          pt.type === 'hotel' ? 'bg-amber-600 text-white' :
                          'bg-teal-600 text-white'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-white truncate">{pt.label}</span>
                            {isVisited && (
                              <span className="text-[10px] font-mono font-bold text-teal-400 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Visited
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{pt.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 ml-3">
                        {/* Arrival Preview Button */}
                        <button
                          onClick={() => triggerCheckpointArrival(pt)}
                          title="Preview Checkpoint Arrival"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Up */}
                        <button
                          onClick={() => moveCheckpoint(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer transition"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => moveCheckpoint(idx, 'down')}
                          disabled={idx === checkpoints.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer transition"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove custom stop */}
                        {checkpoints.length > 2 && (
                          <button
                            onClick={() => removeCheckpoint(idx)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Stop Input */}
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder="Add custom attraction or dining waypoint..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleAddCustomStop}
                  disabled={!newStopName.trim()}
                  className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Smartwatch Simulator & HUD */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Maneuver HUD */}
            <NavigationInstruction
              status={status}
              currentManeuver={route?.steps[telemetry.activeStepIndex] || null}
              distanceToNextTurn={telemetry.distanceToNextTurn}
              warningStage={telemetry.warningStage}
              currentSpeedKmh={speedKmh}
              distanceTravelledMeters={telemetry.progressMeters}
              remainingDistanceMeters={Math.max(0, (route?.totalDistanceMeters || 0) - telemetry.progressMeters)}
              simulatedEtaSeconds={speedKmh > 0 ? ((route?.totalDistanceMeters || 0) - telemetry.progressMeters) / ((speedKmh * 1000) / 3600) : 0}
              startLabel={checkpoints[0]?.label || 'Airport'}
              destLabel={checkpoints[checkpoints.length - 1]?.label || 'Departure Hub'}
            />

            {/* Smartwatch Simulator Chassis */}
            <WristbandSimulator
              ledState={ledState}
              activeDirection={route?.steps[telemetry.activeStepIndex]?.direction || null}
              activePulseCount={route?.steps[telemetry.activeStepIndex]?.pulseCount || null}
              activeInstruction={route?.steps[telemetry.activeStepIndex]?.instruction || null}
              distanceToManeuver={telemetry.distanceToNextTurn}
              warningStage={telemetry.warningStage}
              isDestinationReached={status === 'ARRIVED'}
              manualOverrideActive={false}
              onDurationMs={250}
              offDurationMs={200}
              onTimingChange={(onMs, offMs) => {
                ledSchedulerRef.current?.updateTiming(onMs, offMs);
              }}
            />

            {/* Simulation Controls */}
            <SimulationControls
              status={status}
              speedKmh={speedKmh}
              onSpeedChange={setSpeedKmh}
              onStart={() => {
                if (route) setStatus('RUNNING');
              }}
              onPause={() => setStatus('PAUSED')}
              onResume={() => setStatus('RUNNING')}
              onStop={() => {
                setStatus('STOPPED');
                ledSchedulerRef.current?.turnOffAll();
              }}
              onReset={() => {
                setStatus('IDLE');
                currentDistanceRef.current = 0;
                ledSchedulerRef.current?.turnOffAll();
                if (route?.coordinates?.length) {
                  mapViewRef.current?.updateCarPosition(route.coordinates[0][0], route.coordinates[0][1], 0);
                }
              }}
              onSimulateOffRoute={() => {
                setStatus('OFF_ROUTE');
                wristbandOutputRef.current?.sendOffRoute();
              }}
              canStart={!!route}
              earlyWarningDist={150}
              mainSignalDist={50}
              autoFollow={autoFollow}
              onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
            />

            {/* Hardware Vibration Test Panel */}
            <LEDTestPanel
              onTestLeftTurn={(pulses) => {
                wristbandOutputRef.current?.sendTurn('LEFT', pulses);
                audioAlerts.playMainTurnAlert(pulses);
              }}
              onTestRightTurn={(pulses) => {
                wristbandOutputRef.current?.sendTurn('RIGHT', pulses);
                audioAlerts.playMainTurnAlert(pulses);
              }}
              onTestStraight={() => wristbandOutputRef.current?.sendStraight()}
              onTestUTurn={() => {
                wristbandOutputRef.current?.sendUTurn('LEFT', 4);
                audioAlerts.playMainTurnAlert(4);
              }}
              onTestArrival={() => {
                wristbandOutputRef.current?.sendArrival();
                audioAlerts.playArrivalChime();
              }}
              onTestStopAll={() => wristbandOutputRef.current?.stopAll()}
            />
          </div>
        </div>
      </div>

      {/* Checkpoint Arrival Experience Modal */}
      {showArrivalModal && arrivedCheckpoint && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            {/* Checkpoint Photo */}
            <div className="relative h-48 w-full bg-slate-950">
              <img
                src={arrivedCheckpoint.photo || tour.imageCover}
                alt={arrivedCheckpoint.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-teal-500/90 text-slate-950 text-xs font-bold flex items-center gap-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checkpoint Arrived</span>
              </div>
            </div>

            {/* Checkpoint Details */}
            <div className="p-5 space-y-3">
              <h3 className="text-lg font-bold text-white">{arrivedCheckpoint.label}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{arrivedCheckpoint.description}</p>
              
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-teal-300 flex items-center gap-2">
                <Watch className="w-4 h-4 text-teal-400 shrink-0" />
                <span>NaviBand double-pulse arrival signal broadcasted to wrist.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowArrivalModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                Close
              </button>
              <button
                onClick={() => markCheckpointVisited(arrivedCheckpoint.label)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Mark Visited & Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

