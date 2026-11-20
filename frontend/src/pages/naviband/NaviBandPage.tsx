import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';

import { MapView, MapViewHandle } from '../../components/naviband/MapView';
import { LocationSearch } from '../../components/naviband/LocationSearch';
import { RouteSelector } from '../../components/naviband/RouteSelector';
import { RouteSummary } from '../../components/naviband/RouteSummary';
import { SimulationControls } from '../../components/naviband/SimulationControls';
import { WristbandSimulator } from '../../components/naviband/WristbandSimulator';
import { LEDTestPanel, TestScenario } from '../../components/naviband/LEDTestPanel';
import { NavigationInstruction } from '../../components/naviband/NavigationInstruction';
import { SimulationEventLog } from '../../components/naviband/SimulationEventLog';
import { SettingsPanel } from '../../components/naviband/SettingsPanel';

import { 
  ParsedRoute, 
  ParsedManeuver, 
  LocationPoint, 
  SimulationStatus, 
  LEDState, 
  LogEvent,
  WarningStage,
  RouteAlternative,
  AdaptiveAlertConfig,
  DEFAULT_ADAPTIVE_CONFIG
} from '../../types/navigation';
import { reverseGeocode } from '../../services/naviband/navibandApi';
import { RouteService } from '../../services/naviband/routeService';
import { RouteComparisonEngine } from '../../utils/routeComparison';
import { AdaptiveAlertEngine, ManeuverAlertState } from '../../utils/adaptiveAlertEngine';
import { audioAlerts } from '../../utils/audioAlerts';
import { getPositionAtDistance, formatDistance } from '../../utils/geoUtils';
import { LedScheduler } from '../../utils/ledScheduler';

export const NaviBandPage: React.FC = () => {
  // Navigation endpoints (Default to Taj Mahal Heritage Circuit)
  const [startLocation, setStartLocation] = useState<LocationPoint | null>({
    label: 'Agra Fort, Agra, Uttar Pradesh',
    coordinates: [78.0211, 27.1795]
  });
  const [destLocation, setDestLocation] = useState<LocationPoint | null>({
    label: 'Taj Mahal, Agra, Uttar Pradesh',
    coordinates: [78.0421, 27.1751]
  });
  const [waypoints, setWaypoints] = useState<LocationPoint[]>([]);

  // Multiple Route State
  const [alternatives, setAlternatives] = useState<RouteAlternative[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [route, setRoute] = useState<ParsedRoute | null>(null);

  // Settings & Adaptive Alert Configuration
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveAlertConfig>(() => {
    try {
      const saved = localStorage.getItem('naviband_adaptive_settings');
      if (saved) return { ...DEFAULT_ADAPTIVE_CONFIG, ...JSON.parse(saved) };
    } catch (_) {}
    return DEFAULT_ADAPTIVE_CONFIG;
  });

  const adaptiveConfigRef = useRef<AdaptiveAlertConfig>(adaptiveConfig);
  useEffect(() => {
    adaptiveConfigRef.current = adaptiveConfig;
    audioAlerts.setSoundEnabled(adaptiveConfig.soundEnabled);
  }, [adaptiveConfig]);

  // Map state
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [selectionMode, setSelectionMode] = useState<'start' | 'dest' | 'waypoint' | null>(null);
  const mapViewRef = useRef<MapViewHandle>(null);

  // Simulation execution state
  const [status, setStatus] = useState<SimulationStatus>('IDLE');
  const [speedKmh, setSpeedKmh] = useState<number>(45);

  // Telemetry State
  const [telemetry, setTelemetry] = useState<{
    progressMeters: number;
    activeStepIndex: number;
    distanceToNextTurn: number;
    warningStage: WarningStage;
    demoScenario: TestScenario | null;
  }>({
    progressMeters: 0,
    activeStepIndex: 0,
    distanceToNextTurn: 0,
    warningStage: 'APPROACHING',
    demoScenario: null,
  });

  // LED and hardware state
  const [ledState, setLedState] = useState<LEDState>({
    leftRed: false,
    leftGreen: false,
    rightRed: false,
    rightGreen: false,
  });
  const [manualOverrideActive, setManualOverrideActive] = useState<boolean>(false);
  const manualOverrideRef = useRef<boolean>(false);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Logs & UI feedback
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Maneuver tracking state
  const trackingStatesRef = useRef<{ [stepId: string]: ManeuverAlertState }>({});

  // Animation frame refs
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

  // Logging helper
  const addLog = useCallback((type: LogEvent['type'], message: string, details?: string) => {
    const newLog: LogEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      details
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 79)]);
  }, []);

  // LED Scheduler instance
  const ledSchedulerRef = useRef<LedScheduler | null>(null);
  if (!ledSchedulerRef.current) {
    ledSchedulerRef.current = new LedScheduler(
      (newLedState) => setLedState(newLedState),
      (pattern) => addLog('pulse', `Haptic pulse sequence concluded: ${pattern}`),
      adaptiveConfig.ledOnDurationMs,
      adaptiveConfig.ledOffDurationMs
    );
  }

  // Handle route fetching
  const calculateRoute = useCallback(async (
    start: LocationPoint,
    dest: LocationPoint,
    routeWaypoints: LocationPoint[] = waypoints
  ) => {
    setIsLoadingRoute(true);
    setRoutingError(null);
    addLog('info', 'Calculating driving route via OpenRouteService...', `${start.label} -> ${dest.label}`);

    try {
      const fetchedRoutes = await RouteService.fetchRoutes([
        start.coordinates,
        ...routeWaypoints.map((waypoint) => waypoint.coordinates),
        dest.coordinates
      ]);
      if (!fetchedRoutes || fetchedRoutes.length === 0) {
        throw new Error('No driving routes returned.');
      }

      const alts = RouteComparisonEngine.buildRouteAlternatives(fetchedRoutes);
      setAlternatives(alts);
      setSelectedRouteIndex(0);

      const activeRoute = alts[0]?.parsedRoute || fetchedRoutes[0];
      setRoute(activeRoute);
      routeRef.current = activeRoute;

      // Reset tracking states
      const newTracking: { [key: string]: ManeuverAlertState } = {};
      activeRoute.steps.forEach((s) => {
        newTracking[s.id] = {
          initialWarningTriggered: false,
          mainWarningTriggered: false,
          maneuverReached: false,
          maneuverCompleted: false,
          stage: 'APPROACHING'
        };
      });
      trackingStatesRef.current = newTracking;

      currentDistanceRef.current = 0;
      setTelemetry({
        progressMeters: 0,
        activeStepIndex: 0,
        distanceToNextTurn: activeRoute.steps[0]?.segmentDistance || 0,
        warningStage: 'APPROACHING',
        demoScenario: null
      });

      setStatus('IDLE');
      ledSchedulerRef.current?.turnOffAll();

      addLog('success', `Route calculated: ${(activeRoute.totalDistanceMeters / 1000).toFixed(1)} km · ${activeRoute.steps.length} maneuvers`);
    } catch (err: any) {
      setRoutingError(err.message || 'Failed to calculate route.');
      addLog('error', `Routing failed: ${err.message}`);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [addLog, waypoints]);

  // Initial calculation on mount
  useEffect(() => {
    if (startLocation && destLocation) {
      calculateRoute(startLocation, destLocation);
    }
  }, [calculateRoute, startLocation, destLocation]);

  // Handle route switching
  const handleSelectAlternative = useCallback((idx: number) => {
    if (!alternatives[idx]) return;
    setSelectedRouteIndex(idx);
    const newRoute = alternatives[idx].parsedRoute;
    setRoute(newRoute);
    routeRef.current = newRoute;

    // Reset tracking
    const newTracking: { [key: string]: ManeuverAlertState } = {};
    newRoute.steps.forEach((s) => {
      newTracking[s.id] = {
        initialWarningTriggered: false,
        mainWarningTriggered: false,
        maneuverReached: false,
        maneuverCompleted: false,
        stage: 'APPROACHING'
      };
    });
    trackingStatesRef.current = newTracking;

    currentDistanceRef.current = 0;
    setTelemetry({
      progressMeters: 0,
      activeStepIndex: 0,
      distanceToNextTurn: newRoute.steps[0]?.segmentDistance || 0,
      warningStage: 'APPROACHING',
      demoScenario: null
    });

    setStatus('IDLE');
    ledSchedulerRef.current?.turnOffAll();
    addLog('info', `Switched to ${alternatives[idx].label} (${alternatives[idx].distanceKm} km)`);
  }, [alternatives, addLog]);

  // Handle simulation animation tick
  const updateSimulationFrame = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaSec = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const currentRoute = routeRef.current;
    if (!currentRoute || statusRef.current !== 'RUNNING') return;

    const speedMps = (speedRef.current * 1000) / 3600;
    currentDistanceRef.current += speedMps * deltaSec;

    const totalDist = currentRoute.totalDistanceMeters;

    // Destination arrival check
    if (currentDistanceRef.current >= totalDist) {
      currentDistanceRef.current = totalDist;
      setStatus('ARRIVED');
      ledSchedulerRef.current?.setArrival();
      audioAlerts.playArrivalChime();
      addLog('success', 'Destination Reached! You have arrived at your destination.');
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      return;
    }

    // Vehicle position on map
    const vehicle = getPositionAtDistance(
      currentRoute.coordinates,
      currentRoute.cumulativeDistances,
      currentDistanceRef.current
    );
    mapViewRef.current?.updateCarPosition(vehicle.coordinates[0], vehicle.coordinates[1], vehicle.bearing);

    // Maneuver threshold evaluation
    const steps = currentRoute.steps;
    let nextStepIdx = steps.findIndex((s) => s.distanceFromStart > currentDistanceRef.current);
    if (nextStepIdx === -1) nextStepIdx = Math.max(0, steps.length - 1);

    const upcomingStep = steps[nextStepIdx];
    let distToTurn = 0;
    let currentStage: WarningStage = 'APPROACHING';

    if (upcomingStep) {
      distToTurn = upcomingStep.distanceFromStart - currentDistanceRef.current;
      const stepState = trackingStatesRef.current[upcomingStep.id] || {
        initialWarningTriggered: false,
        mainWarningTriggered: false,
        maneuverReached: false,
        maneuverCompleted: false,
        stage: 'APPROACHING'
      };

      const thresholds = AdaptiveAlertEngine.calculateThresholds(speedRef.current, adaptiveConfigRef.current);
      const evalResult = AdaptiveAlertEngine.evaluateManeuverStage(distToTurn, stepState, thresholds);
      trackingStatesRef.current[upcomingStep.id] = evalResult.nextState;
      currentStage = evalResult.nextState.stage;

      // Initial approach chime
      if (evalResult.triggerInitialAlert && !manualOverrideRef.current) {
        ledSchedulerRef.current?.triggerInitialApproach(upcomingStep.direction);
        audioAlerts.playInitialApproachChime();
        addLog('warning', `Approach warning: ${upcomingStep.direction} in ${Math.round(distToTurn)}m`, upcomingStep.instruction);
      }

      // Main directional turn vibration
      if (evalResult.triggerMainAlert && !manualOverrideRef.current) {
        if (upcomingStep.isUTurn) {
          ledSchedulerRef.current?.triggerUTurn('LEFT', upcomingStep.pulseCount);
        } else {
          ledSchedulerRef.current?.triggerMainWarning(upcomingStep.direction, upcomingStep.pulseCount);
        }
        audioAlerts.playMainTurnAlert(upcomingStep.pulseCount);
        addLog('turn', `TURN NOW: ${upcomingStep.direction} (${upcomingStep.pulseCount} pulses)`, upcomingStep.instruction);
      }
    }

    setTelemetry((prev) => ({
      ...prev,
      progressMeters: currentDistanceRef.current,
      activeStepIndex: nextStepIdx,
      distanceToNextTurn: distToTurn,
      warningStage: currentStage
    }));

    animFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);
  }, [addLog]);

  // Start / Pause animation loop
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

  // Simulation controls handlers
  const handleStart = () => {
    if (!route) return;
    setStatus('RUNNING');
    addLog('info', 'Simulation started at ' + speedKmh + ' km/h');
  };

  const handlePause = () => {
    setStatus('PAUSED');
    addLog('info', 'Simulation paused');
  };

  const handleResume = () => {
    setStatus('RUNNING');
    addLog('info', 'Simulation resumed');
  };

  const handleStop = () => {
    setStatus('STOPPED');
    ledSchedulerRef.current?.turnOffAll();
    addLog('info', 'Simulation stopped');
  };

  const handleReset = () => {
    setStatus('IDLE');
    currentDistanceRef.current = 0;
    ledSchedulerRef.current?.turnOffAll();

    if (route) {
      const resetTracking: { [key: string]: ManeuverAlertState } = {};
      route.steps.forEach((s) => {
        resetTracking[s.id] = {
          initialWarningTriggered: false,
          mainWarningTriggered: false,
          maneuverReached: false,
          maneuverCompleted: false,
          stage: 'APPROACHING'
        };
      });
      trackingStatesRef.current = resetTracking;

      setTelemetry({
        progressMeters: 0,
        activeStepIndex: 0,
        distanceToNextTurn: route.steps[0]?.segmentDistance || 0,
        warningStage: 'APPROACHING',
        demoScenario: null
      });

      if (route.coordinates.length > 0) {
        mapViewRef.current?.updateCarPosition(route.coordinates[0][0], route.coordinates[0][1], 0);
      }
    }
    addLog('info', 'Simulation reset to origin');
  };

  // Hardware Test Triggers
  const triggerManualTest = (action: () => void, label: string) => {
    manualOverrideRef.current = true;
    setManualOverrideActive(true);
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);

    action();
    addLog('pulse', `Hardware test: ${label}`);

    manualTimeoutRef.current = setTimeout(() => {
      manualOverrideRef.current = false;
      setManualOverrideActive(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Title & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                SARTHI NAVIBAND 2.0
              </span>
              <span className="text-xs text-slate-400">Tactile Smartwatch Navigation & Haptic Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              NaviBand Smart Band Navigation Simulator
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer shadow transition"
            >
              Alert Engine Settings
            </button>
          </div>
        </div>

        {/* Alternative Routes Selector (if multiple exist) */}
        {alternatives.length > 1 && (
          <RouteSelector
            alternatives={alternatives}
            selectedIndex={selectedRouteIndex}
            onSelectRoute={handleSelectAlternative}
            simulationStatus={status}
          />
        )}

        {/* Primary Two-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: 2D Leaflet Interactive Map & Route Summary */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <MapView
              ref={mapViewRef}
              route={route}
              alternatives={alternatives}
              selectedRouteIndex={selectedRouteIndex}
              onSelectAlternative={handleSelectAlternative}
              startLocation={startLocation}
              destLocation={destLocation}
              waypoints={waypoints}
              upcomingManeuver={route?.steps[telemetry.activeStepIndex]}
              warningStage={telemetry.warningStage}
              autoFollow={autoFollow}
              onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
              selectionMode={selectionMode}
              onMapClick={async (coords) => {
                if (selectionMode === 'start') {
                  const label = await reverseGeocode(coords[0], coords[1]);
                  const newLoc: LocationPoint = { label, coordinates: coords };
                  setStartLocation(newLoc);
                  setSelectionMode(null);
                } else if (selectionMode === 'dest') {
                  const label = await reverseGeocode(coords[0], coords[1]);
                  const newLoc: LocationPoint = { label, coordinates: coords };
                  setDestLocation(newLoc);
                  setSelectionMode(null);
                } else if (selectionMode === 'waypoint') {
                  const label = await reverseGeocode(coords[0], coords[1]);
                  const newLoc: LocationPoint = { label, coordinates: coords };
                  const updatedWaypoints = [...waypoints, newLoc];
                  setWaypoints(updatedWaypoints);
                  setSelectionMode(null);
                }
              }}
              initialCenter={startLocation ? [startLocation.coordinates[1], startLocation.coordinates[0]] : [27.1751, 78.0421]}
            />

            {/* Route Summary & Turn List */}
            <RouteSummary route={route} activeStepIndex={telemetry.activeStepIndex} />
          </div>

          {/* Right Panel: Smartwatch Simulator, HUD & Hardware Test Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Active Navigation HUD Instruction */}
            <NavigationInstruction
              status={status}
              currentManeuver={route?.steps[telemetry.activeStepIndex] || null}
              distanceToNextTurn={telemetry.distanceToNextTurn}
              warningStage={telemetry.warningStage}
              currentSpeedKmh={speedKmh}
              distanceTravelledMeters={telemetry.progressMeters}
              remainingDistanceMeters={Math.max(0, (route?.totalDistanceMeters || 0) - telemetry.progressMeters)}
              simulatedEtaSeconds={speedKmh > 0 ? ((route?.totalDistanceMeters || 0) - telemetry.progressMeters) / ((speedKmh * 1000) / 3600) : 0}
              startLabel={startLocation?.label || 'Origin'}
              destLabel={destLocation?.label || 'Destination'}
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
              manualOverrideActive={manualOverrideActive}
              onDurationMs={adaptiveConfig.ledOnDurationMs}
              offDurationMs={adaptiveConfig.ledOffDurationMs}
              onTimingChange={(onMs, offMs) => {
                setAdaptiveConfig((p) => ({ ...p, ledOnDurationMs: onMs, ledOffDurationMs: offMs }));
                ledSchedulerRef.current?.updateTiming(onMs, offMs);
              }}
            />

            {/* Simulation Controls & Velocity */}
            <SimulationControls
              status={status}
              speedKmh={speedKmh}
              onSpeedChange={setSpeedKmh}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onReset={handleReset}
              onSimulateOffRoute={() => {
                setStatus('OFF_ROUTE');
                ledSchedulerRef.current?.setOffRoute(3);
                addLog('error', 'Vehicle went OFF ROUTE — triggering dual red haptic pulses');
              }}
              canStart={!!route}
              earlyWarningDist={AdaptiveAlertEngine.calculateThresholds(speedKmh, adaptiveConfig).initialWarningDistance}
              mainSignalDist={AdaptiveAlertEngine.calculateThresholds(speedKmh, adaptiveConfig).mainWarningDistance}
              autoFollow={autoFollow}
              onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Hardware Vibration Test Panel */}
            <LEDTestPanel
              onTestLeftTurn={(pulses) => triggerManualTest(() => {
                ledSchedulerRef.current?.triggerTurn('LEFT', pulses);
                audioAlerts.playMainTurnAlert(pulses);
              }, `Left turn test (${pulses} pulses)`)}
              onTestRightTurn={(pulses) => triggerManualTest(() => {
                ledSchedulerRef.current?.triggerTurn('RIGHT', pulses);
                audioAlerts.playMainTurnAlert(pulses);
              }, `Right turn test (${pulses} pulses)`)}
              onTestStraight={() => triggerManualTest(() => {
                ledSchedulerRef.current?.setStraight(true);
              }, 'Straight signal test')}
              onTestUTurn={() => triggerManualTest(() => {
                ledSchedulerRef.current?.triggerUTurn('LEFT', 4);
                audioAlerts.playMainTurnAlert(4);
              }, 'U-Turn emergency test')}
              onTestArrival={() => triggerManualTest(() => {
                ledSchedulerRef.current?.setArrival();
                audioAlerts.playArrivalChime();
              }, 'Arrival celebration test')}
              onTestStopAll={() => {
                ledSchedulerRef.current?.turnOffAll();
                addLog('info', 'All motors stopped');
              }}
              onTestSingleLed={(led) => triggerManualTest(() => {
                ledSchedulerRef.current?.triggerSingleLed(led);
              }, `Single LED pin: ${led}`)}
            />

            {/* Origin & Destination Route Planner Box */}
            <LocationSearch
              startLocation={startLocation}
              destLocation={destLocation}
              waypoints={waypoints}
              onRemoveWaypoint={(index) => {
                setWaypoints((currentWaypoints) => currentWaypoints.filter((_, waypointIndex) => waypointIndex !== index));
              }}
              onSetStartLocation={(loc) => {
                setStartLocation(loc);
              }}
              onSetDestLocation={(loc) => {
                setDestLocation(loc);
              }}
              onSwapLocations={() => {
                if (startLocation && destLocation) {
                  const temp = startLocation;
                  setStartLocation(destLocation);
                  setDestLocation(temp);
                }
              }}
              onFindRoute={() => {
                if (startLocation && destLocation) {
                  calculateRoute(startLocation, destLocation, waypoints);
                }
              }}
              isLoadingRoute={isLoadingRoute}
              selectionMode={selectionMode}
              onToggleSelectionMode={(mode) => setSelectionMode(selectionMode === mode ? null : mode)}
              errorMessage={routingError}
            />

            {/* Event Log Feed */}
            <SimulationEventLog logs={logs} onClear={() => setLogs([])} />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={adaptiveConfig}
        onSaveConfig={(newCfg) => {
          setAdaptiveConfig(newCfg);
          ledSchedulerRef.current?.updateTiming(newCfg.ledOnDurationMs, newCfg.ledOffDurationMs);
          addLog('info', 'Alert settings updated');
        }}
      />
    </div>
  );
};
