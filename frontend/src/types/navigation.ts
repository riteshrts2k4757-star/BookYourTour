export type TurnDirection = 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'U-TURN' | 'ARRIVED';

export type PulseCount = 1 | 2 | 3 | 4;

export type WarningStage = 
  | 'NONE'
  | 'APPROACHING' 
  | 'INITIAL_WARNING' 
  | 'MAIN_WARNING' 
  | 'EARLY_WARNING' 
  | 'IMMEDIATE_WARNING' 
  | 'MAINTAIN_TURN' 
  | 'MANEUVER_REACHED'
  | 'REACHED' 
  | 'COMPLETED';

export interface OrsManeuver {
  location: [number, number]; // [lon, lat]
  bearing_before: number;
  bearing_after: number;
}

export interface OrsStep {
  distance: number; // meters
  duration: number; // seconds
  type: number; // ORS action code
  instruction: string;
  name: string;
  way_points: [number, number]; // [startIndex, endIndex]
  maneuver?: OrsManeuver;
}

export interface ParsedManeuver {
  id: string;
  index: number;
  direction: TurnDirection;
  instruction: string;
  roadName: string;
  distanceFromStart: number; // meters along route
  segmentDistance: number; // meters in this step
  angle: number; // corner angle in degrees (0 - 180)
  signedAngle: number; // signed angle (-180 to 180, negative is left, positive is right)
  pulseCount: PulseCount;
  coordinates: [number, number]; // [lon, lat]
  isUTurn: boolean;
  initialWarningTriggered?: boolean;
  mainWarningTriggered?: boolean;
  earlyWarningTriggered?: boolean; // legacy alias
  immediateWarningTriggered?: boolean; // legacy alias
  maneuverReached?: boolean;
  maneuverCompleted?: boolean;
  warningStage?: WarningStage;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // Array of [lon, lat]
}

export interface ParsedRoute {
  id?: string;
  coordinates: [number, number][]; // [lon, lat]
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  steps: ParsedManeuver[];
  cumulativeDistances: number[]; // distance from start to coordinate i
}

export type RouteBadge = 'SHORTEST' | 'FASTEST' | 'ALTERNATIVE';

export interface RouteAlternative {
  id: string;
  index: number;
  label: string;
  badge: RouteBadge;
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMin: number;
  distanceDiffKm: number;
  durationDiffMin: number;
  turnCount: number;
  parsedRoute: ParsedRoute;
  color: string;
  outlineColor: string;
}

export interface LocationPoint {
  label: string;
  coordinates: [number, number]; // [lon, lat]
  photo?: string;
  description?: string;
  type?: 'airport' | 'hotel' | 'attraction' | 'stop';
  day?: number;
}

export interface LEDState {
  leftRed: boolean;
  leftGreen: boolean;
  rightRed: boolean;
  rightGreen: boolean;
}

export type SimulationStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ARRIVED' | 'STOPPED' | 'OFF_ROUTE' | 'REROUTING';

export interface LogEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'turn' | 'error' | 'pulse';
  message: string;
  details?: string;
}

export interface SimulationConfig {
  speedKmh: number;
  earlyWarningDistance: number; // e.g. 150m
  mainSignalDistance: number; // e.g. 50m
  ledOnDurationMs: number; // e.g. 250ms
  ledOffDurationMs: number; // e.g. 200ms
  autoFollowMap: boolean;
}

export interface AdaptiveAlertConfig {
  initialLeadTimeSec: number; // default 10s
  mainLeadTimeSec: number; // default 3s
  minInitialDistanceM: number; // default 60m
  maxInitialDistanceM: number; // default 200m
  minMainDistanceM: number; // default 15m
  maxMainDistanceM: number; // default 60m
  ledOnDurationMs: number; // default 250ms
  ledOffDurationMs: number; // default 200ms
  soundEnabled: boolean;
  autoFollowMap: boolean;
  theme: 'dark' | 'light';
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveAlertConfig = {
  initialLeadTimeSec: 10,
  mainLeadTimeSec: 3,
  minInitialDistanceM: 60,
  maxInitialDistanceM: 200,
  minMainDistanceM: 15,
  maxMainDistanceM: 60,
  ledOnDurationMs: 250,
  ledOffDurationMs: 200,
  soundEnabled: true,
  autoFollowMap: true,
  theme: 'dark'
};

