import { TurnDirection, PulseCount } from '../../types/navigation';
import { LedScheduler } from '../../utils/ledScheduler';

export type WristbandPattern = 
  | 'LEFT_TURN'
  | 'RIGHT_TURN'
  | 'STRAIGHT'
  | 'U_TURN'
  | 'ARRIVAL'
  | 'OFF_ROUTE'
  | 'IDLE';

export interface WristbandCommand {
  pattern: WristbandPattern;
  direction?: TurnDirection;
  pulseCount: PulseCount;
  onDurationMs: number;
  offDurationMs: number;
  vibrate: boolean;
  timestamp: number;
}

/**
 * Standard Interface for Haptic Wristband Output
 * Allows seamless swapping between web UI simulation, Web Vibration API, and future ESP32 BLE hardware.
 */
export interface IWristbandOutput {
  sendTurn(direction: 'LEFT' | 'RIGHT', pulses: PulseCount, onMs?: number, offMs?: number): void;
  sendStraight(): void;
  sendUTurn(subDirection?: 'LEFT' | 'RIGHT', pulses?: PulseCount): void;
  sendArrival(): void;
  sendOffRoute(): void;
  stopAll(): void;
  isBusy(): boolean;
}

/**
 * Helper to trigger browser Web Vibration API if supported on device
 */
function triggerBrowserVibration(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }
}

/**
 * Web Simulator Implementation of Wristband Output
 * Controls browser LED matrix, haptic motor vibration animations, and Web Vibration API.
 */
export class SimulatorWristbandOutput implements IWristbandOutput {
  private ledScheduler: LedScheduler;
  private onCommandDispatched?: (cmd: WristbandCommand) => void;

  constructor(
    ledScheduler: LedScheduler,
    onCommandDispatched?: (cmd: WristbandCommand) => void
  ) {
    this.ledScheduler = ledScheduler;
    this.onCommandDispatched = onCommandDispatched;
  }

  public sendTurn(direction: 'LEFT' | 'RIGHT', pulses: PulseCount, onMs = 250, offMs = 200): void {
    this.ledScheduler.triggerTurn(direction, pulses);
    
    // Web Vibration pattern: [vib, pause, vib, pause...]
    const pattern: number[] = [];
    for (let i = 0; i < pulses; i++) {
      pattern.push(onMs);
      if (i < pulses - 1) pattern.push(offMs);
    }
    triggerBrowserVibration(pattern);

    this.notify({
      pattern: direction === 'LEFT' ? 'LEFT_TURN' : 'RIGHT_TURN',
      direction,
      pulseCount: pulses,
      onDurationMs: onMs,
      offDurationMs: offMs,
      vibrate: true,
      timestamp: Date.now()
    });
  }

  public sendStraight(): void {
    this.ledScheduler.setStraight();
    this.notify({
      pattern: 'STRAIGHT',
      direction: 'STRAIGHT',
      pulseCount: 1,
      onDurationMs: 0,
      offDurationMs: 0,
      vibrate: false,
      timestamp: Date.now()
    });
  }

  public sendUTurn(subDirection: 'LEFT' | 'RIGHT' = 'LEFT', pulses: PulseCount = 4): void {
    this.ledScheduler.triggerUTurn(subDirection, pulses);
    
    const pattern: number[] = [];
    for (let i = 0; i < pulses; i++) {
      pattern.push(200);
      if (i < pulses - 1) pattern.push(100);
    }
    triggerBrowserVibration(pattern);

    this.notify({
      pattern: 'U_TURN',
      direction: 'U-TURN',
      pulseCount: pulses,
      onDurationMs: 250,
      offDurationMs: 200,
      vibrate: true,
      timestamp: Date.now()
    });
  }

  public sendArrival(): void {
    this.ledScheduler.setArrival();
    triggerBrowserVibration([200, 100, 200, 100, 400]);
    this.notify({
      pattern: 'ARRIVAL',
      direction: 'ARRIVED',
      pulseCount: 1,
      onDurationMs: 0,
      offDurationMs: 0,
      vibrate: true,
      timestamp: Date.now()
    });
  }

  public sendOffRoute(): void {
    this.ledScheduler.setOffRoute(3);
    triggerBrowserVibration([100, 100, 100, 100, 100]);
    this.notify({
      pattern: 'OFF_ROUTE',
      pulseCount: 3,
      onDurationMs: 200,
      offDurationMs: 150,
      vibrate: true,
      timestamp: Date.now()
    });
  }

  public stopAll(): void {
    this.ledScheduler.turnOffAll();
    triggerBrowserVibration(0); // cancel vibration
    this.notify({
      pattern: 'IDLE',
      pulseCount: 1,
      onDurationMs: 0,
      offDurationMs: 0,
      vibrate: false,
      timestamp: Date.now()
    });
  }

  public isBusy(): boolean {
    return this.ledScheduler.isBusy();
  }

  private notify(cmd: WristbandCommand) {
    if (this.onCommandDispatched) {
      this.onCommandDispatched(cmd);
    }
  }
}

/**
 * Future Physical ESP32 BLE Driver Placeholder
 * Ready for Web Bluetooth API integration (navigator.bluetooth.requestDevice)
 */
export class Esp32BleWristbandOutput implements IWristbandOutput {
  private serviceUuid = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
  private charUuid = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
  private connectedDevice: any = null;

  public async connect(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'NaviBand' }],
          optionalServices: [this.serviceUuid]
        });
        const server = await device.gatt?.connect();
        this.connectedDevice = server;
        return true;
      } catch (e) {
        console.warn('Bluetooth connection cancelled or unavailable', e);
        return false;
      }
    }
    return false;
  }

  public sendTurn(direction: 'LEFT' | 'RIGHT', pulses: PulseCount): void {
    // Protocol frame: [0xAA, direction === 'LEFT' ? 0x01 : 0x02, pulses, 0xFF]
  }

  public sendStraight(): void {}
  public sendUTurn(): void {}
  public sendArrival(): void {}
  public sendOffRoute(): void {}
  public stopAll(): void {}
  public isBusy(): boolean { return false; }
}

