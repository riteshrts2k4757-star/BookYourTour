import React, { memo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Gauge, 
  AlertTriangle,
  Compass,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SimulationStatus } from '../../types/navigation';

interface SimulationControlsProps {
  status: SimulationStatus;
  speedKmh: number;
  onSpeedChange: (speed: number) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onSimulateOffRoute: () => void;
  canStart: boolean;
  earlyWarningDist: number;
  mainSignalDist: number;
  autoFollow: boolean;
  onToggleAutoFollow: () => void;
  onOpenSettings?: () => void;
}

const SPEED_PRESETS = [
  { label: 'Stop', speed: 0 },
  { label: 'City', speed: 30 },
  { label: 'Standard', speed: 45 },
  { label: 'Highway', speed: 80 },
  { label: 'Fast Sim', speed: 120 },
];

export const SimulationControls = memo<SimulationControlsProps>(({
  status,
  speedKmh,
  onSpeedChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onSimulateOffRoute,
  canStart,
  earlyWarningDist,
  mainSignalDist,
  autoFollow,
  onToggleAutoFollow,
  onOpenSettings
}) => {
  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isOffRoute = status === 'OFF_ROUTE' || status === 'REROUTING';

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-teal-400" />
          <h3 className="font-bold text-sm text-white tracking-wide uppercase">Simulation Controls</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Open Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-emerald-400 animate-pulse' :
              isPaused ? 'bg-amber-400' :
              isOffRoute ? 'bg-rose-500 animate-ping' :
              'bg-slate-500'
            }`} />
            <span className="text-xs font-mono font-bold text-slate-300">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Playback Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {!isRunning && !isPaused ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Sim</span>
          </button>
        ) : isRunning ? (
          <button
            onClick={onPause}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow transition-all"
          >
            <Pause className="w-4 h-4 fill-white" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={onResume}
            className="col-span-2 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={onStop}
          disabled={status === 'IDLE'}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1 border border-slate-700 cursor-pointer transition-all"
        >
          <Square className="w-3.5 h-3.5 fill-slate-300" />
          <span>Stop</span>
        </button>

        <button
          onClick={onReset}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1 border border-slate-700 cursor-pointer transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Speed Slider & Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Simulation Velocity:</span>
          <span className="font-mono font-bold text-teal-400">{speedKmh} km/h</span>
        </div>

        <input
          type="range"
          min="0"
          max="140"
          step="5"
          value={speedKmh}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-teal-500 cursor-pointer"
        />

        <div className="grid grid-cols-5 gap-1 pt-1">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onSpeedChange(p.speed)}
              className={`py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer border ${
                speedKmh === p.speed
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold Indicators & Emergency Actions */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <span>Lead: <b className="text-slate-200">{earlyWarningDist}m</b></span>
          <span>·</span>
          <span>Turn: <b className="text-teal-400">{mainSignalDist}m</b></span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAutoFollow}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center space-x-1 cursor-pointer transition-colors ${
              autoFollow
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Follow</span>
          </button>

          <button
            onClick={onSimulateOffRoute}
            disabled={!isRunning}
            className="px-2 py-1 rounded-lg text-[10px] font-medium bg-rose-950/60 hover:bg-rose-900 disabled:opacity-40 text-rose-300 border border-rose-900 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Off-Route</span>
          </button>
        </div>
      </div>
    </div>
  );
});
SimulationControls.displayName = 'SimulationControls';

