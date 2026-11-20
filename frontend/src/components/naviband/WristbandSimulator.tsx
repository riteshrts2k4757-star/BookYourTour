import React, { memo, useState } from 'react';
import { 
  Watch, 
  ArrowUp, 
  CornerUpLeft, 
  CornerUpRight, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  Vibrate, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  ShieldCheck, 
  Activity,
  Zap
} from 'lucide-react';
import { LEDState, TurnDirection, WarningStage } from '../../types/navigation';

export interface WristbandSimulatorProps {
  ledState: LEDState;
  activeDirection: TurnDirection | null;
  activePulseCount: number | null;
  activeInstruction?: string | null;
  distanceToManeuver: number | null;
  warningStage?: WarningStage;
  isDestinationReached: boolean;
  manualOverrideActive: boolean;
  onDurationMs: number;
  offDurationMs: number;
  onTimingChange: (onMs: number, offMs: number) => void;
}

/**
 * Optical LED Lens Component
 */
const OpticalLedLens = memo<{
  isActive: boolean;
  color: 'red' | 'green';
  label: string;
}>(({ isActive, color, label }) => {
  const isGreen = color === 'green';
  
  return (
    <div className="flex flex-col items-center space-y-0.5">
      <div className="relative flex items-center justify-center">
        {isActive && (
          <div 
            className={`absolute -inset-1 rounded-full blur-[5px] transition-opacity duration-200 pointer-events-none ${
              isGreen ? 'bg-emerald-400/80' : 'bg-rose-500/80'
            }`} 
          />
        )}
        
        <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full p-[1.5px] bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 shadow-[0_2px_4px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center relative z-10 transition-transform duration-200 hover:scale-105">
          <div
            className={`w-full h-full rounded-full border transition-all duration-150 flex items-center justify-center relative overflow-hidden ${
              isActive 
                ? isGreen ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 border-rose-200 shadow-[0_0_10px_#ef4444]'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <span className="absolute top-[1px] left-[1.5px] w-[3.5px] h-[2px] rounded-full bg-white/50 blur-[0.2px] pointer-events-none" />
            
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-100 ${
                isActive 
                  ? 'bg-white shadow-[0_0_5px_#ffffff]' 
                  : isGreen ? 'bg-emerald-950/60' : 'bg-rose-950/60'
              }`} 
            />
          </div>
        </div>
      </div>
      
      <span className={`text-[7.5px] sm:text-[8px] font-mono tracking-tight font-bold uppercase transition-colors text-center ${
        isActive 
          ? isGreen ? 'text-emerald-300 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]' : 'text-rose-300 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]'
          : 'text-slate-400'
      }`}>
        {label}
      </span>
    </div>
  );
});
OpticalLedLens.displayName = 'OpticalLedLens';

/**
 * Tactile Haptic Buzzer Capsule
 */
const HapticActuatorCapsule = memo<{
  isVibrating: boolean;
  side: 'LEFT' | 'RIGHT';
}>(({ isVibrating, side }) => {
  return (
    <div className={`relative px-1.5 sm:px-2 py-1.5 rounded-xl border transition-all duration-200 flex flex-col items-center justify-between overflow-hidden w-[64px] sm:w-[72px] h-full ${
      isVibrating
        ? 'bg-emerald-950/70 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
    }`}>
      {isVibrating && (
        <span className="absolute inset-0 rounded-xl border border-emerald-400/40 animate-ping pointer-events-none" />
      )}

      <div className="flex items-center justify-between w-full z-10">
        <div className={`p-1 rounded-md transition-colors ${
          isVibrating ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-800 text-slate-400'
        }`}>
          <Vibrate className={`w-3.5 h-3.5 ${isVibrating ? 'text-emerald-300 animate-bounce' : ''}`} />
        </div>
        <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-wider">
          {side === 'LEFT' ? 'L-MTR' : 'R-MTR'}
        </span>
      </div>

      <div className="w-full flex items-center justify-between mt-1 z-10 px-0.5">
        <span className={`text-[8px] font-mono font-bold leading-none ${
          isVibrating ? 'text-emerald-300 font-extrabold' : 'text-slate-400'
        }`}>
          {isVibrating ? 'BUZZ' : 'IDLE'}
        </span>

        <div className="flex items-end space-x-[2px] h-3">
          <span className={`w-[2px] rounded-full transition-all duration-150 ${
            isVibrating ? 'h-3 bg-emerald-400 animate-pulse' : 'h-1 bg-slate-700'
          }`} />
          <span className={`w-[2px] rounded-full transition-all duration-150 ${
            isVibrating ? 'h-2 bg-emerald-300 animate-pulse' : 'h-1 bg-slate-700'
          }`} />
          <span className={`w-[2px] rounded-full transition-all duration-150 ${
            isVibrating ? 'h-3.5 bg-emerald-400 animate-pulse' : 'h-1 bg-slate-700'
          }`} />
        </div>
      </div>
    </div>
  );
});
HapticActuatorCapsule.displayName = 'HapticActuatorCapsule';

export const WristbandSimulator: React.FC<WristbandSimulatorProps> = ({
  ledState,
  activeDirection,
  activePulseCount,
  activeInstruction,
  distanceToManeuver,
  warningStage,
  isDestinationReached,
  manualOverrideActive,
  onDurationMs,
  offDurationMs,
  onTimingChange,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  // Determine if left or right motor is active
  const isLeftVibrating = ledState.leftGreen || ledState.leftRed;
  const isRightVibrating = ledState.rightGreen || ledState.rightRed;

  // Render direction icon
  const renderDirectionIcon = () => {
    if (isDestinationReached || activeDirection === 'ARRIVED') {
      return <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />;
    }
    if (activeDirection === 'LEFT') {
      return <CornerUpLeft className="w-8 h-8 text-emerald-400 animate-pulse" />;
    }
    if (activeDirection === 'RIGHT') {
      return <CornerUpRight className="w-8 h-8 text-emerald-400 animate-pulse" />;
    }
    if (activeDirection === 'U-TURN') {
      return <RotateCcw className="w-8 h-8 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />;
    }
    return <ArrowUp className="w-8 h-8 text-emerald-400" />;
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Watch className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-semibold text-white tracking-wide">NaviBand 2.0 Hardware HUD</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
            BLE Synced
          </span>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Timing</span>
          {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="mt-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Pulse On: {onDurationMs}ms</label>
            <input 
              type="range" 
              min="100" 
              max="500" 
              step="25"
              value={onDurationMs} 
              onChange={(e) => onTimingChange(Number(e.target.value), offDurationMs)}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Pulse Off: {offDurationMs}ms</label>
            <input 
              type="range" 
              min="50" 
              max="400" 
              step="25"
              value={offDurationMs} 
              onChange={(e) => onTimingChange(onDurationMs, Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>
      )}

      {/* Smartwatch Simulator Face */}
      <div className="mt-4 flex flex-col items-center">
        {/* Watch Chassis */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[40px] bg-gradient-to-b from-slate-800 via-slate-900 to-black p-3.5 shadow-2xl border-2 border-slate-700/80 flex flex-col items-center justify-between">
          
          {/* Top Strap Joint */}
          <div className="absolute -top-3 w-28 h-3 rounded-t-lg bg-slate-800 border-t border-slate-600" />
          
          {/* LED Array Top Section */}
          <div className="w-full flex items-center justify-between px-2 pt-1">
            {/* Left Dual LEDs */}
            <div className="flex space-x-2">
              <OpticalLedLens isActive={ledState.leftRed} color="red" label="L-RED" />
              <OpticalLedLens isActive={ledState.leftGreen} color="green" label="L-GRN" />
            </div>

            {/* Smart Watch Time / Status */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold text-slate-400">SARTHI OS</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-mono text-emerald-400 font-medium">LIVE</span>
              </div>
            </div>

            {/* Right Dual LEDs */}
            <div className="flex space-x-2">
              <OpticalLedLens isActive={ledState.rightGreen} color="green" label="R-GRN" />
              <OpticalLedLens isActive={ledState.rightRed} color="red" label="R-RED" />
            </div>
          </div>

          {/* Central Circular OLED Display Screen */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-black border-4 border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center p-3 text-center overflow-hidden">
            {/* Soft background radial glow */}
            <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
              isLeftVibrating || isRightVibrating ? 'bg-teal-500/10' : 'bg-transparent'
            }`} />

            {/* Direction Icon */}
            <div className="mb-1 transition-transform duration-200">
              {renderDirectionIcon()}
            </div>

            {/* Maneuver Pulse & Instruction */}
            <div className="text-[11px] font-bold text-white tracking-wide truncate max-w-[150px]">
              {activeInstruction || 'Proceed Straight'}
            </div>

            {/* Distance Countdown */}
            {distanceToManeuver !== null && (
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">
                {distanceToManeuver <= 15 ? 'NOW' : `In ${Math.round(distanceToManeuver)}m`}
              </div>
            )}

            {/* Pulse Indicator */}
            {activePulseCount && activePulseCount > 0 && (
              <div className="mt-1 text-[9px] font-mono text-slate-400">
                {activePulseCount} {activePulseCount === 1 ? 'Pulse' : 'Pulses'}
              </div>
            )}
          </div>

          {/* Dual Haptic Actuator Bottom Bar */}
          <div className="w-full flex items-center justify-between px-3 pb-1 h-12">
            <HapticActuatorCapsule isVibrating={isLeftVibrating} side="LEFT" />
            
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-slate-500 uppercase">Haptics</span>
              <Activity className="w-3.5 h-3.5 text-teal-400 mt-0.5" />
            </div>

            <HapticActuatorCapsule isVibrating={isRightVibrating} side="RIGHT" />
          </div>

          {/* Bottom Strap Joint */}
          <div className="absolute -bottom-3 w-28 h-3 rounded-b-lg bg-slate-800 border-b border-slate-600" />
        </div>
      </div>

      {/* Telemetry Summary Strip */}
      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Left Motor</span>
          <span className={`font-mono font-bold text-xs ${isLeftVibrating ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isLeftVibrating ? 'VIBRATING' : 'IDLE'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Turn Signal</span>
          <span className="font-mono font-bold text-teal-300 text-xs">
            {activeDirection || 'NONE'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Right Motor</span>
          <span className={`font-mono font-bold text-xs ${isRightVibrating ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isRightVibrating ? 'VIBRATING' : 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};

