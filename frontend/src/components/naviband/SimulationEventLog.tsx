import React, { memo, useRef, useEffect } from 'react';
import { Terminal, Trash2, ShieldAlert } from 'lucide-react';
import { LogEvent } from '../../types/navigation';

interface SimulationEventLogProps {
  logs: LogEvent[];
  onClear: () => void;
}

export const SimulationEventLog: React.FC<SimulationEventLogProps> = memo(({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEvent['type']) => {
    switch (type) {
      case 'turn':
        return 'text-teal-400 font-semibold';
      case 'warning':
        return 'text-amber-400';
      case 'pulse':
        return 'text-cyan-300';
      case 'error':
        return 'text-rose-400 font-bold';
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'info':
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-200">Hardware & Telemetry Log</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {logs.length}
          </span>
        </div>
        <button
          onClick={onClear}
          title="Clear log"
          className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="mt-2 h-44 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <span>Awaiting simulation telemetry...</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 py-0.5 border-b border-slate-800/40">
              <span className="text-slate-600 shrink-0 select-none">{log.timestamp}</span>
              <span className={`flex-1 break-words ${getLogColor(log.type)}`}>
                {log.message}
                {log.details && (
                  <span className="text-slate-500 ml-1 block text-[10px]">{log.details}</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
SimulationEventLog.displayName = 'SimulationEventLog';

