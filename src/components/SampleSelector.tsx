import React from 'react';
import { SAMPLE_PRESETS } from '../data/samples';
import { PresetSample, RiskLevel } from '../types';
import { Sparkles } from 'lucide-react';

interface SampleSelectorProps {
  onSelectSample: (sample: PresetSample) => void;
  selectedId?: string;
  disabled?: boolean;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  onSelectSample,
  selectedId,
  disabled,
}) => {
  const getBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800';
      case 'HIGH':
        return 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800';
      case 'MODERATE':
        return 'text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/70 border-yellow-200 dark:border-yellow-800';
      case 'LOW':
        return 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800';
      default:
        return 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Quick Benchmark Scenarios</span>
        </label>
        <span className="text-xs text-slate-400 dark:text-zinc-500">Select a real-world sample to test</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {SAMPLE_PRESETS.map((sample) => {
          const isSelected = selectedId === sample.id;
          return (
            <button
              key={sample.id}
              id={`preset-${sample.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(sample)}
              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 shadow-2xs ${
                isSelected
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                  {sample.category}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold shrink-0 ${getBadgeColor(
                    sample.expectedRisk
                  )}`}
                >
                  {sample.expectedRisk}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 line-clamp-1">
                {sample.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
