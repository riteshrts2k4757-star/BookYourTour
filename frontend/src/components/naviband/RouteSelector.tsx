import React, { useState } from 'react';
import { RouteAlternative, RouteBadge, SimulationStatus } from '../../types/navigation';
import { Sparkles, Clock, Compass, AlertCircle } from 'lucide-react';

interface RouteSelectorProps {
  alternatives: RouteAlternative[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
  simulationStatus: SimulationStatus;
  onRequestConfirmSwitch?: (pendingIndex: number) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  alternatives,
  selectedIndex,
  onSelectRoute,
  simulationStatus,
  onRequestConfirmSwitch
}) => {
  const [sortBy, setSortBy] = useState<'distance' | 'time' | 'turns'>('distance');
  const [pendingSwitchIndex, setPendingSwitchIndex] = useState<number | null>(null);

  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  const sortedAlternatives = [...alternatives].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceMeters - b.distanceMeters;
    if (sortBy === 'time') return a.durationSeconds - b.durationSeconds;
    if (sortBy === 'turns') return a.turnCount - b.turnCount;
    return a.index - b.index;
  });

  const handleCardClick = (targetIndex: number) => {
    if (targetIndex === selectedIndex) return;

    if (simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED') {
      if (onRequestConfirmSwitch) {
        onRequestConfirmSwitch(targetIndex);
      } else {
        setPendingSwitchIndex(targetIndex);
      }
    } else {
      onSelectRoute(targetIndex);
    }
  };

  const confirmPendingSwitch = () => {
    if (pendingSwitchIndex !== null) {
      onSelectRoute(pendingSwitchIndex);
      setPendingSwitchIndex(null);
    }
  };

  const cancelPendingSwitch = () => {
    setPendingSwitchIndex(null);
  };

  const getBadgeStyle = (badge: RouteBadge) => {
    switch (badge) {
      case 'SHORTEST':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'FASTEST':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'ALTERNATIVE':
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Route Alternatives</h3>
          <span className="text-xs text-slate-400">({alternatives.length} options)</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              sortBy === 'distance' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Distance
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              sortBy === 'time' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Time
          </button>
          <button
            onClick={() => setSortBy('turns')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
              sortBy === 'turns' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Turns
          </button>
        </div>
      </div>

      {pendingSwitchIndex !== null && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Switch active route during navigation? Position will reset.</span>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={confirmPendingSwitch}
              className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold cursor-pointer"
            >
              Switch
            </button>
            <button
              onClick={cancelPendingSwitch}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {sortedAlternatives.map((alt) => {
          const isSelected = alt.index === selectedIndex;
          return (
            <button
              key={alt.id}
              onClick={() => handleCardClick(alt.index)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-teal-950/40 border-teal-500/60 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{alt.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getBadgeStyle(alt.badge)}`}>
                  {alt.badge}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">{alt.distanceKm} km</span>
                <span className="text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{alt.durationMin} min</span>
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>{alt.turnCount} turns</span>
                {alt.distanceDiffKm > 0 && (
                  <span className="text-amber-400">+{alt.distanceDiffKm} km</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

