import React, { memo, useState } from 'react';
import { 
  Zap, 
  CornerUpLeft, 
  CornerUpRight, 
  ArrowUp, 
  RotateCcw, 
  CheckCircle2, 
  Square, 
  PlaySquare,
  Vibrate,
  Radio
} from 'lucide-react';
import { TurnDirection, PulseCount } from '../../types/navigation';

export interface TestScenario {
  id: string;
  name: string;
  instruction: string;
  direction: TurnDirection;
  angle: number;
  pulseCount: PulseCount;
  description: string;
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'straight-road',
    name: 'Straight Road',
    instruction: 'Continue straight on Expressway',
    direction: 'STRAIGHT',
    angle: 0,
    pulseCount: 1,
    description: 'Both Green LEDs ON simultaneously'
  },
  {
    id: 'slight-left',
    name: 'Slight Left Turn',
    instruction: 'Bear slight left onto Heritage Road',
    direction: 'LEFT',
    angle: 115,
    pulseCount: 1,
    description: '1 Pulse (> 90° wide angle)'
  },
  {
    id: 'square-left',
    name: '90° Left Turn',
    instruction: 'Turn left onto Palace Gate',
    direction: 'LEFT',
    angle: 90,
    pulseCount: 2,
    description: '2 Pulses (Exact 90° corner)'
  },
  {
    id: 'sharp-left',
    name: 'Sharp Left Turn',
    instruction: 'Turn sharp left onto Fort Rampart',
    direction: 'LEFT',
    angle: 45,
    pulseCount: 3,
    description: '3 Pulses (< 90° sharp turn)'
  },
  {
    id: 'slight-right',
    name: 'Slight Right Turn',
    instruction: 'Bear slight right onto Riverfront Way',
    direction: 'RIGHT',
    angle: 120,
    pulseCount: 1,
    description: '1 Pulse (> 90° wide angle)'
  },
  {
    id: 'square-right',
    name: '90° Right Turn',
    instruction: 'Turn right onto Market Square',
    direction: 'RIGHT',
    angle: 90,
    pulseCount: 2,
    description: '2 Pulses (Exact 90° corner)'
  },
  {
    id: 'sharp-right',
    name: 'Sharp Right Turn',
    instruction: 'Turn sharp right onto Mountain Pass',
    direction: 'RIGHT',
    angle: 40,
    pulseCount: 3,
    description: '3 Pulses (< 90° sharp turn)'
  },
  {
    id: 'u-turn',
    name: 'U-Turn Maneuver',
    instruction: 'Make a legal U-turn at next divider',
    direction: 'U-TURN',
    angle: 180,
    pulseCount: 4,
    description: '4 Pulses (Dual Red + Directional Green)'
  },
  {
    id: 'destination-arrival',
    name: 'Destination Arrival',
    instruction: 'You have reached your destination!',
    direction: 'ARRIVED',
    angle: 0,
    pulseCount: 1,
    description: 'Arrival mode: Both Green LEDs Lit + Chime'
  }
];

interface LEDTestPanelProps {
  onTestLeftTurn: (pulses: 1 | 2 | 3) => void;
  onTestRightTurn: (pulses: 1 | 2 | 3) => void;
  onTestStraight: () => void;
  onTestUTurn: () => void;
  onTestArrival: () => void;
  onTestStopAll: () => void;
  onTestSingleLed?: (led: 'leftRed' | 'leftGreen' | 'rightGreen' | 'rightRed') => void;
  onRunScenario?: (scenario: TestScenario) => void;
}

export const LEDTestPanel: React.FC<LEDTestPanelProps> = memo(({
  onTestLeftTurn,
  onTestRightTurn,
  onTestStraight,
  onTestUTurn,
  onTestArrival,
  onTestStopAll,
  onTestSingleLed,
  onRunScenario
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'scenarios' | 'individual'>('quick');

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header with Subtabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Hardware Vibration Lab</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'quick' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Test
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'scenarios' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scenarios
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'individual' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pins
          </button>
        </div>
      </div>

      {/* Tab: Quick Test */}
      {activeTab === 'quick' && (
        <div className="mt-3 space-y-3">
          {/* Left Motor Column */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <CornerUpLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Left Haptic Motor</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Left Wrist Feedback</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onTestLeftTurn(1)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">1 Pulse</span>
                <span className="text-[9px] text-slate-400">Wide (&gt;90°)</span>
              </button>
              <button
                onClick={() => onTestLeftTurn(2)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">2 Pulses</span>
                <span className="text-[9px] text-slate-400">Square (90°)</span>
              </button>
              <button
                onClick={() => onTestLeftTurn(3)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">3 Pulses</span>
                <span className="text-[9px] text-slate-400">Sharp (&lt;90°)</span>
              </button>
            </div>
          </div>

          {/* Right Motor Column */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <CornerUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Right Haptic Motor</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Right Wrist Feedback</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onTestRightTurn(1)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">1 Pulse</span>
                <span className="text-[9px] text-slate-400">Wide (&gt;90°)</span>
              </button>
              <button
                onClick={() => onTestRightTurn(2)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">2 Pulses</span>
                <span className="text-[9px] text-slate-400">Square (90°)</span>
              </button>
              <button
                onClick={() => onTestRightTurn(3)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <span className="font-bold text-emerald-400">3 Pulses</span>
                <span className="text-[9px] text-slate-400">Sharp (&lt;90°)</span>
              </button>
            </div>
          </div>

          {/* Dual Motor Actions */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1.5">Dual Motor & Emergency Signals</span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onTestStraight}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                <span>Straight</span>
              </button>
              <button
                onClick={onTestUTurn}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-medium border border-rose-900/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
                <span>U-Turn</span>
              </button>
              <button
                onClick={onTestArrival}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium border border-emerald-900/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                <span>Arrival</span>
              </button>
              <button
                onClick={onTestStopAll}
                className="px-2 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs font-medium border border-rose-800 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <Square className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
                <span>Stop All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Real World Scenarios */}
      {activeTab === 'scenarios' && (
        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
          {TEST_SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white">{sc.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                    {sc.pulseCount} {sc.pulseCount === 1 ? 'Pulse' : 'Pulses'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{sc.description}</p>
              </div>
              <button
                onClick={() => {
                  if (onRunScenario) onRunScenario(sc);
                  else if (sc.direction === 'LEFT') onTestLeftTurn(sc.pulseCount as any);
                  else if (sc.direction === 'RIGHT') onTestRightTurn(sc.pulseCount as any);
                  else if (sc.direction === 'U-TURN') onTestUTurn();
                  else if (sc.direction === 'ARRIVED') onTestArrival();
                  else onTestStraight();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow"
              >
                <PlaySquare className="w-3 h-3" />
                <span>Test</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Individual LED Pins */}
      {activeTab === 'individual' && onTestSingleLed && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onTestSingleLed('leftRed')}
            className="p-3 rounded-xl bg-slate-950 border border-rose-900/60 hover:border-rose-500 text-rose-300 font-mono text-center cursor-pointer"
          >
            GPIO 12: Left Red
          </button>
          <button
            onClick={() => onTestSingleLed('leftGreen')}
            className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60 hover:border-emerald-500 text-emerald-300 font-mono text-center cursor-pointer"
          >
            GPIO 14: Left Green
          </button>
          <button
            onClick={() => onTestSingleLed('rightGreen')}
            className="p-3 rounded-xl bg-slate-950 border border-emerald-900/60 hover:border-emerald-500 text-emerald-300 font-mono text-center cursor-pointer"
          >
            GPIO 27: Right Green
          </button>
          <button
            onClick={() => onTestSingleLed('rightRed')}
            className="p-3 rounded-xl bg-slate-950 border border-rose-900/60 hover:border-rose-500 text-rose-300 font-mono text-center cursor-pointer"
          >
            GPIO 26: Right Red
          </button>
        </div>
      )}
    </div>
  );
});
LEDTestPanel.displayName = 'LEDTestPanel';

