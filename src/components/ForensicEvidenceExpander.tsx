import React, { useState } from 'react';
import { ForensicEvidenceItem } from '../types';
import { enrichRedFlags } from '../utils/forensicEnricher';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface ForensicEvidenceExpanderProps {
  redFlags: string[];
  forensicItems?: ForensicEvidenceItem[];
  themeColor?: 'rose' | 'amber' | 'yellow' | 'emerald' | 'zinc';
}

export const ForensicEvidenceExpander: React.FC<ForensicEvidenceExpanderProps> = ({
  redFlags,
  forensicItems,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({
    0: true, // Auto-expand first flag for visibility
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fallback to client-side heuristic enricher if backend didn't supply forensic metadata
  const items: ForensicEvidenceItem[] =
    forensicItems && forensicItems.length > 0
      ? forensicItems
      : enrichRedFlags(redFlags);

  if (!items || items.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
        No active attack signatures or red flags detected.
      </div>
    );
  }

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyEvidence = (item: ForensicEvidenceItem, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[SECURITY EVIDENCE]
Flag: ${item.flag}
Impact: ${item.impact_rating}
Severity: ${item.severity}
Technical Analysis: ${item.technical_explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    items.forEach((_, i) => (all[i] = true));
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  return (
    <div
      id="forensic-evidence-expander"
      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-3.5 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Detected Red Flags &amp; Risk Evidence ({items.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Breakdown of deceptive patterns and their potential safety impact
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-300 font-medium transition-colors border border-slate-200 dark:border-zinc-700"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-300 font-medium transition-colors border border-slate-200 dark:border-zinc-700"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isExpanded = !!expandedIndices[idx];
          const isCritical = item.severity === 'CRITICAL';
          const isHigh = item.severity === 'HIGH';

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700/80'
                  : isHigh
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700/80'
                  : 'bg-slate-50/60 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Clickable Card Header */}
              <div
                onClick={() => toggleExpand(idx)}
                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    ) : isHigh ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                        {item.flag}
                      </span>
                    </div>

                    {/* Forensic Impact Rating Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                            : isHigh
                            ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        <span>Impact: {item.impact_rating}</span>
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {item.severity} Severity
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls: Copy evidence & Accordion arrow */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <button
                    type="button"
                    title="Copy details"
                    onClick={(e) => copyEvidence(item, idx, e)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="p-1 text-slate-400 dark:text-zinc-500"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Technical Explanation Body */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 dark:text-zinc-300 border-t border-slate-200/60 dark:border-zinc-800/80 mt-1">
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                      Why this was flagged:
                    </span>
                    <p className="leading-relaxed">
                      {item.technical_explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
