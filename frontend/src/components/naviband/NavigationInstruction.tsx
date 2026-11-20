import React, { memo } from 'react';
import { 
  CornerUpLeft, 
  CornerUpRight, 
  ArrowUp, 
  RotateCcw, 
  MapPin, 
  Clock, 
  Gauge, 
  CheckCircle2,
} from 'lucide-react';
import { TurnDirection, ParsedManeuver, SimulationStatus, WarningStage } from '../../types/navigation';
import { formatDistance, formatDuration } from '../../utils/geoUtils';

interface NavigationInstructionProps {
  status: SimulationStatus;
  currentManeuver: ParsedManeuver | null;
  distanceToNextTurn: number;
  warningStage?: WarningStage;
  earlyWarningDist?: number;
  mainSignalDist?: number;
  currentSpeedKmh: number;
  distanceTravelledMeters: number;
  remainingDistanceMeters: number;
  simulatedEtaSeconds: number;
  startLabel: string;
  destLabel: string;
}

export const NavigationInstruction = memo<NavigationInstructionProps>(({
  status,
  currentManeuver,
  distanceToNextTurn,
  warningStage = 'APPROACHING',
  earlyWarningDist = 150,
  mainSignalDist = 50,
  currentSpeedKmh,
  distanceTravelledMeters,
  remainingDistanceMeters,
  simulatedEtaSeconds,
  startLabel,
  destLabel,
}) => {
  const totalDistance = distanceTravelledMeters + remainingDistanceMeters;
  const progressPercent = totalDistance > 0 
    ? Math.min(100, Math.max(0, Math.round((distanceTravelledMeters / totalDistance) * 100))) 
    : 0;

  const isMainWarning = warningStage === 'MAIN_WARNING' || warningStage === 'IMMEDIATE_WARNING' || (
    distanceToNextTurn <= mainSignalDist && 
    currentManeuver && 
    currentManeuver.direction !== 'STRAIGHT' && 
    currentManeuver.direction !== 'ARRIVED'
  );

  const isInitialWarning = warningStage === 'INITIAL_WARNING' || warningStage === 'EARLY_WARNING' || (
    distanceToNextTurn <= earlyWarningDist && 
    distanceToNextTurn > mainSignalDist && 
    currentManeuver && 
    currentManeuver.direction !== 'STRAIGHT' && 
    currentManeuver.direction !== 'ARRIVED'
  );

  const getManeuverIcon = (dir?: TurnDirection) => {
    switch (dir) {
      case 'LEFT':
        return <CornerUpLeft className={`w-8 h-8 text-teal-400 ${isMainWarning ? 'animate-bounce text-cyan-300' : isInitialWarning ? 'animate-pulse' : ''}`} />;
      case 'RIGHT':
        return <CornerUpRight className={`w-8 h-8 text-teal-400 ${isMainWarning ? 'animate-bounce text-cyan-300' : isInitialWarning ? 'animate-pulse' : ''}`} />;
      case 'U-TURN':
        return <RotateCcw className="w-8 h-8 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'ARRIVED':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />;
      case 'STRAIGHT':
      default:
        return <ArrowUp className="w-8 h-8 text-teal-400" />;
    }
  };

  const getManeuverBannerTitle = () => {
    if (status === 'ARRIVED') return 'DESTINATION REACHED!';
    if (status === 'OFF_ROUTE' || status === 'REROUTING') return 'OFF ROUTE — RECALCULATING...';
    if (!currentManeuver || currentManeuver.direction === 'STRAIGHT') return 'CONTINUE STRAIGHT';

    const dir = currentManeuver.direction;
    const dist = Math.round(Math.max(0, distanceToNextTurn));

    if (isMainWarning) {
      if (dir === 'LEFT') return 'TURN LEFT NOW';
      if (dir === 'RIGHT') return 'TURN RIGHT NOW';
      if (dir === 'U-TURN') return 'MAKE U-TURN NOW';
      return `TURN ${dir} NOW`;
    }

    if (isInitialWarning) {
      return `IN ${dist}m: PREPARE TO TURN ${dir}`;
    }

    return `IN ${dist}m: TURN ${dir}`;
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Top Banner with Maneuver Instruction */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
          {getManeuverIcon(currentManeuver?.direction)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
              isMainWarning 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : isInitialWarning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
            }`}>
              {getManeuverBannerTitle()}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white mt-1 truncate">
            {currentManeuver?.instruction || 'Follow route to destination'}
          </h3>
          <p className="text-[11px] text-slate-400 truncate">
            {currentManeuver?.roadName || 'Main Corridor'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>{formatDistance(distanceTravelledMeters)}</span>
          <span className="text-teal-400 font-bold">{progressPercent}%</span>
          <span>{formatDistance(remainingDistanceMeters)} left</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="flex items-center justify-center space-x-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-200">{Math.round(currentSpeedKmh)} km/h</span>
        </div>
        <div className="flex items-center justify-center space-x-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-200">{formatDuration(simulatedEtaSeconds)}</span>
        </div>
        <div className="flex items-center justify-center space-x-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-200 truncate max-w-[80px]" title={destLabel}>
            {destLabel.split(',')[0]}
          </span>
        </div>
      </div>
    </div>
  );
});
NavigationInstruction.displayName = 'NavigationInstruction';

