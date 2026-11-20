import React, { useState, useEffect } from 'react';
import { AdaptiveAlertConfig, DEFAULT_ADAPTIVE_CONFIG } from '../../types/navigation';
import { X, Sliders, Volume2, VolumeX, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AdaptiveAlertConfig;
  onSaveConfig: (newConfig: AdaptiveAlertConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [draft, setDraft] = useState<AdaptiveAlertConfig>(config);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(config);
      setErrorMsg(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (errorMsg) return;
    onSaveConfig(draft);
    try {
      localStorage.setItem('naviband_adaptive_settings', JSON.stringify(draft));
    } catch (_) {}
    onClose();
  };

  const handleResetDefaults = () => {
    setDraft(DEFAULT_ADAPTIVE_CONFIG);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">NaviBand Settings</h2>
              <p className="text-xs text-slate-400">Configure speed-adaptive thresholds & haptic audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sound & Audio */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Haptic Audio Synthesizer</span>
              <span className="text-[11px] text-slate-400">Audio chimes matching physical wristband pulses</span>
            </div>
            <button
              onClick={() => setDraft((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                draft.soundEnabled
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {draft.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Lead Times */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Dynamic Lead Times</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block mb-1">Approach Notice: {draft.initialLeadTimeSec}s</label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={draft.initialLeadTimeSec}
                  onChange={(e) => setDraft((p) => ({ ...p, initialLeadTimeSec: Number(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block mb-1">Main Turn Warning: {draft.mainLeadTimeSec}s</label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={draft.mainLeadTimeSec}
                  onChange={(e) => setDraft((p) => ({ ...p, mainLeadTimeSec: Number(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Distances */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Distance Thresholds (Meters)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block mb-1">Min Approach: {draft.minInitialDistanceM}m</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={draft.minInitialDistanceM}
                  onChange={(e) => setDraft((p) => ({ ...p, minInitialDistanceM: Number(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block mb-1">Max Approach: {draft.maxInitialDistanceM}m</label>
                <input
                  type="range"
                  min="120"
                  max="350"
                  step="10"
                  value={draft.maxInitialDistanceM}
                  onChange={(e) => setDraft((p) => ({ ...p, maxInitialDistanceM: Number(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer shadow transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

