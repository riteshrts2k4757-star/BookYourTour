import { LEDState, TurnDirection } from '../types/navigation';

export type LedChangeCallback = (state: LEDState) => void;
export type PatternCompleteCallback = (pattern: string) => void;

export type SchedulerMode = 
  | 'IDLE' 
  | 'STRAIGHT' 
  | 'INITIAL_WARNING'
  | 'MAIN_WARNING'
  | 'EARLY_WARNING' 
  | 'IMMEDIATE_WARNING' 
  | 'MAINTAIN_TURN' 
  | 'U_TURN' 
  | 'ARRIVAL' 
  | 'OFF_ROUTE' 
  | 'MANUAL_TEST';

export class LedScheduler {
  private activeTimeouts: NodeJS.Timeout[] = [];
  private currentPattern: string | null = null;
  private currentMode: SchedulerMode = 'IDLE';
  private currentLedState: LEDState = {
    leftRed: false,
    leftGreen: false,
    rightRed: false,
    rightGreen: false,
  };
  private onStateChange: LedChangeCallback;
  private onPatternComplete?: PatternCompleteCallback;
  private onDuration: number = 250;
  private offDuration: number = 200;

  constructor(
    onStateChange: LedChangeCallback,
    onPatternComplete?: PatternCompleteCallback,
    onDuration = 250,
    offDuration = 200
  ) {
    this.onStateChange = onStateChange;
    this.onPatternComplete = onPatternComplete;
    this.onDuration = onDuration;
    this.offDuration = offDuration;
  }

  public updateTiming(onDuration: number, offDuration: number) {
    this.onDuration = Math.max(50, onDuration);
    this.offDuration = Math.max(50, offDuration);
  }

  public clear() {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];
    this.currentPattern = null;
  }

  public turnOffAll() {
    this.clear();
    this.currentMode = 'IDLE';
    this.emitState({
      leftRed: false,
      leftGreen: false,
      rightRed: false,
      rightGreen: false,
    });
  }

  public setStraight(force = false) {
    // Prevent lower-priority straight signal from wiping out an active turn alert
    if (!force && this.isTurnWarningActive()) {
      return;
    }

    this.clear();
    this.currentMode = 'STRAIGHT';
    this.currentPattern = 'STRAIGHT';
    this.emitState({
      leftRed: false,
      leftGreen: true,
      rightRed: false,
      rightGreen: true,
    });
  }

  public setArrival() {
    this.clear();
    this.currentMode = 'ARRIVAL';
    this.currentPattern = 'ARRIVAL';
    this.emitState({
      leftRed: false,
      leftGreen: true,
      rightRed: false,
      rightGreen: true,
    });
  }

  public setOffRoute(pulses = 3) {
    this.clear();
    this.currentMode = 'OFF_ROUTE';
    this.currentPattern = 'OFF_ROUTE';
    this.schedulePulses(
      pulses,
      () => ({ leftRed: true, leftGreen: false, rightRed: true, rightGreen: false }),
      () => ({ leftRed: false, leftGreen: false, rightRed: false, rightGreen: false }),
      'OFF_ROUTE',
      this.onDuration,
      this.offDuration
    );
  }

  /**
   * Stage A — Initial Approach Warning:
   * Exactly 1 short vibration pulse notifying the rider that a maneuver is approaching
   * Directional green LED only (or both red for U-turn), 150ms pulse
   */
  public triggerInitialApproach(
    direction: TurnDirection,
    patternLabel?: string
  ) {
    this.clear();
    this.currentMode = 'INITIAL_WARNING';
    const label = patternLabel || `INITIAL_APPROACH_${direction}_1_PULSE`;
    this.currentPattern = label;

    const onState: LEDState = {
      leftRed: direction === 'U-TURN',
      leftGreen: direction === 'LEFT' || direction === 'STRAIGHT' || direction === 'ARRIVED',
      rightRed: direction === 'U-TURN',
      rightGreen: direction === 'RIGHT' || direction === 'STRAIGHT' || direction === 'ARRIVED',
    };

    const offState: LEDState = {
      leftRed: false,
      leftGreen: false,
      rightRed: false,
      rightGreen: false,
    };

    // Exactly 1 short pulse (150ms on, then off)
    const initialPulseDuration = Math.min(180, Math.max(100, Math.round(this.onDuration * 0.6)));
    this.schedulePulses(1, () => onState, () => offState, label, initialPulseDuration, this.offDuration);
  }

  /**
   * Stage B — Main Directional Warning:
   * Full directional pulse sequence (1, 2, 3, or 4 pulses) close to the turn
   */
  public triggerMainWarning(
    direction: TurnDirection,
    pulses: number,
    patternLabel?: string
  ) {
    this.clear();
    this.currentMode = 'MAIN_WARNING';
    const label = patternLabel || `MAIN_WARNING_${direction}_${pulses}_PULSES`;
    this.currentPattern = label;

    const onState: LEDState = {
      leftRed: direction === 'U-TURN',
      leftGreen: direction === 'LEFT' || direction === 'STRAIGHT' || direction === 'ARRIVED',
      rightRed: direction === 'U-TURN',
      rightGreen: direction === 'RIGHT' || direction === 'STRAIGHT' || direction === 'ARRIVED',
    };

    const offState: LEDState = {
      leftRed: false,
      leftGreen: false,
      rightRed: false,
      rightGreen: false,
    };

    this.schedulePulses(pulses, () => onState, () => offState, label, this.onDuration, this.offDuration);
  }

  public triggerTurn(direction: TurnDirection, pulses: number, patternLabel?: string) {
    this.triggerMainWarning(direction, pulses, patternLabel);
  }

  public triggerUTurn(subDirection: 'LEFT' | 'RIGHT' = 'LEFT', pulses = 4) {
    this.clear();
    this.currentMode = 'U_TURN';
    const label = `U_TURN_${subDirection}_${pulses}_PULSES`;
    this.currentPattern = label;

    const onState: LEDState = {
      leftRed: true,
      leftGreen: subDirection === 'LEFT',
      rightRed: true,
      rightGreen: subDirection === 'RIGHT',
    };

    const offState: LEDState = {
      leftRed: false,
      leftGreen: false,
      rightRed: false,
      rightGreen: false,
    };

    this.schedulePulses(pulses, () => onState, () => offState, label, this.onDuration, this.offDuration);
  }

  public triggerSingleLed(led: 'leftRed' | 'leftGreen' | 'rightGreen' | 'rightRed') {
    this.clear();
    this.currentMode = 'MANUAL_TEST';
    this.emitState({
      leftRed: led === 'leftRed',
      leftGreen: led === 'leftGreen',
      rightRed: led === 'rightRed',
      rightGreen: led === 'rightGreen',
    });
  }

  public getCurrentState(): LEDState {
    return { ...this.currentLedState };
  }

  public getCurrentPattern(): string | null {
    return this.currentPattern;
  }

  public getCurrentMode(): SchedulerMode {
    return this.currentMode;
  }

  public isTurnWarningActive(): boolean {
    return (
      this.currentMode === 'INITIAL_WARNING' ||
      this.currentMode === 'MAIN_WARNING' ||
      this.currentMode === 'EARLY_WARNING' ||
      this.currentMode === 'IMMEDIATE_WARNING' ||
      this.currentMode === 'U_TURN'
    );
  }

  public isBusy(): boolean {
    return this.activeTimeouts.length > 0;
  }

  private schedulePulses(
    count: number,
    getOnState: () => LEDState,
    getOffState: () => LEDState,
    patternName: string,
    onMs = this.onDuration,
    offMs = this.offDuration
  ) {
    let accumulatedTime = 0;

    for (let i = 0; i < count; i++) {
      // Turn ON
      const tOn = setTimeout(() => {
        this.emitState(getOnState());
      }, accumulatedTime);
      this.activeTimeouts.push(tOn);

      accumulatedTime += onMs;

      // Turn OFF
      const isLastPulse = i === count - 1;
      const tOff = setTimeout(() => {
        this.emitState(getOffState());
        if (isLastPulse) {
          this.currentPattern = null;
          this.currentMode = 'IDLE';
          if (this.onPatternComplete) {
            this.onPatternComplete(patternName);
          }
        }
      }, accumulatedTime);
      this.activeTimeouts.push(tOff);

      accumulatedTime += offMs;
    }
  }

  private emitState(state: LEDState) {
    this.currentLedState = { ...state };
    this.onStateChange(this.currentLedState);
  }
}

