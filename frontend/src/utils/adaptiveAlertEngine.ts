import { AdaptiveAlertConfig, DEFAULT_ADAPTIVE_CONFIG, WarningStage } from '../types/navigation';

export interface CalculatedWarningThresholds {
  initialWarningDistance: number;
  mainWarningDistance: number;
  speedMps: number;
}

export interface ManeuverAlertState {
  initialWarningTriggered: boolean;
  mainWarningTriggered: boolean;
  maneuverReached: boolean;
  maneuverCompleted: boolean;
  stage: WarningStage;
}

/**
 * AdaptiveAlertEngine
 * Computes dynamic speed-dependent alert distances and manages turn warning state transitions
 */
export class AdaptiveAlertEngine {
  /**
   * Calculate speed-adaptive warning distances based on current vehicle speed and config
   * @param speedKmh Vehicle speed in km/h
   * @param config Adaptive alert configuration
   */
  public static calculateThresholds(
    speedKmh: number,
    config: AdaptiveAlertConfig = DEFAULT_ADAPTIVE_CONFIG
  ): CalculatedWarningThresholds {
    const validSpeed = Math.max(0, speedKmh);
    const speedMps = validSpeed / 3.6;

    // Initial approach warning distance
    const rawInitial = speedMps * config.initialLeadTimeSec;
    const initialWarningDistance = Math.max(
      config.minInitialDistanceM,
      Math.min(config.maxInitialDistanceM, Math.round(rawInitial))
    );

    // Main directional vibration distance
    const rawMain = speedMps * config.mainLeadTimeSec;
    let mainWarningDistance = Math.max(
      config.minMainDistanceM,
      Math.min(config.maxMainDistanceM, Math.round(rawMain))
    );

    // Safety constraint: main warning distance must remain strictly below initial warning distance
    if (mainWarningDistance >= initialWarningDistance) {
      mainWarningDistance = Math.max(config.minMainDistanceM, initialWarningDistance - 15);
    }

    return {
      initialWarningDistance,
      mainWarningDistance,
      speedMps
    };
  }

  /**
   * Evaluate a maneuver's alert state given the current distance to that maneuver
   * @param distanceToManeuver Distance in meters from vehicle to maneuver waypoint
   * @param currentState Current tracked flags for this maneuver
   * @param thresholds Current dynamic thresholds
   */
  public static evaluateManeuverStage(
    distanceToManeuver: number,
    currentState: ManeuverAlertState,
    thresholds: CalculatedWarningThresholds
  ): {
    nextState: ManeuverAlertState;
    triggerInitialAlert: boolean;
    triggerMainAlert: boolean;
    isReached: boolean;
    isCompleted: boolean;
  } {
    const { initialWarningDistance, mainWarningDistance } = thresholds;
    const nextState: ManeuverAlertState = { ...currentState };

    let triggerInitialAlert = false;
    let triggerMainAlert = false;
    let isReached = false;
    let isCompleted = false;

    // Completed: vehicle has passed the maneuver waypoint by >10m
    if (distanceToManeuver < -10) {
      nextState.maneuverCompleted = true;
      nextState.stage = 'COMPLETED';
      isCompleted = true;
      return { nextState, triggerInitialAlert, triggerMainAlert, isReached, isCompleted };
    }

    // Reached / In Intersection: within 10m
    if (distanceToManeuver <= 10 && distanceToManeuver >= -10) {
      if (!nextState.maneuverReached) {
        nextState.maneuverReached = true;
        isReached = true;
      }
      nextState.stage = 'MANEUVER_REACHED';
      return { nextState, triggerInitialAlert, triggerMainAlert, isReached, isCompleted };
    }

    // Stage B: Main Directional Vibration Zone
    if (distanceToManeuver <= mainWarningDistance) {
      if (!nextState.mainWarningTriggered) {
        nextState.mainWarningTriggered = true;
        nextState.initialWarningTriggered = true; // Auto-mark initial if skipped due to speed jump
        nextState.stage = 'MAIN_WARNING';
        triggerMainAlert = true;
      }
      return { nextState, triggerInitialAlert, triggerMainAlert, isReached, isCompleted };
    }

    // Stage A: Initial Approach Warning Zone
    if (distanceToManeuver <= initialWarningDistance) {
      if (!nextState.initialWarningTriggered) {
        nextState.initialWarningTriggered = true;
        nextState.stage = 'INITIAL_WARNING';
        triggerInitialAlert = true;
      }
      return { nextState, triggerInitialAlert, triggerMainAlert, isReached, isCompleted };
    }

    // Approaching (before initial warning distance)
    nextState.stage = 'APPROACHING';
    return { nextState, triggerInitialAlert, triggerMainAlert, isReached, isCompleted };
  }
}

