import React, { useState, memo } from 'react';
import { 
  Milestone, 
  Clock, 
  CornerUpLeft, 
  CornerUpRight, 
  ArrowUp, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  ListFilter 
} from 'lucide-react';
import { ParsedRoute, TurnDirection } from '../../types/navigation';
import { formatDistance, formatDuration } from '../../utils/geoUtils';

interface RouteSummaryProps {
  route: ParsedRoute | null;
  activeStepIndex: number;
}

export const RouteSummary = memo<RouteSummaryProps>(({ route, activeStepIndex }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  if (!route) return null;

  const getDirectionIcon = (dir: TurnDirection, size = 14) => {
    switch (dir) {
      case 'LEFT':
        return <CornerUpLeft size={size} className="text-teal-400" />;
      case 'RIGHT':
        return <CornerUpRight size={size} className="text-cyan-400" />;
      case 'U-TURN':
        return <RotateCcw size={size} className="text-rose-400" />;
      case 'STRAIGHT':
      default:
        return <ArrowUp size={size} className="text-emerald-300" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
      {/* Route Quick Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Milestone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Distance</span>
            <span className="text-xs font-bold text-white">
              {formatDistance(route.totalDistanceMeters)}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Est. Time</span>
            <span className="text-xs font-bold text-white">
              {formatDuration(route.totalDurationSeconds)}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ListFilter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Maneuvers</span>
            <span className="text-xs font-bold text-white">
              {route.steps.length} Steps
            </span>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Instruction Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full py-2 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Turn-by-Turn Steps & Vibration Plan ({route.steps.length})
          </span>
          {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showInstructions && (
          <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {route.steps.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  className={`p-2 rounded-xl text-xs border flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-teal-500/15 border-teal-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-1 rounded bg-slate-900 shrink-0">
                      {getDirectionIcon(step.direction)}
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate">{step.instruction}</div>
                      <div className="text-[10px] text-slate-500 truncate">{step.roadName}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[10px] ml-2">
                    <span className="text-teal-400 font-bold block">
                      {step.pulseCount} {step.pulseCount === 1 ? 'Pulse' : 'Pulses'}
                    </span>
                    <span className="text-slate-500">{formatDistance(step.segmentDistance)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
RouteSummary.displayName = 'RouteSummary';

