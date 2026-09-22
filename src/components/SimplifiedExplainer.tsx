import React, { useState } from 'react';
import { SecurityReport } from '../types';
import { generatePlainEnglishExplanation } from '../utils/simplifiedText';
import {
  MessageSquareQuote,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Flame,
} from 'lucide-react';

interface SimplifiedExplainerProps {
  report: SecurityReport;
  defaultExpanded?: boolean;
}

export const SimplifiedExplainer: React.FC<SimplifiedExplainerProps> = ({
  report,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [showDictionary, setShowDictionary] = useState<boolean>(false);

  const explanation = generatePlainEnglishExplanation(report);
  const score = report.scam_threat_index;
  const isCritical = report.risk_level === 'CRITICAL' || score >= 80;
  const isHigh = !isCritical && (report.risk_level === 'HIGH' || score >= 60);
  const isModerate = !isCritical && !isHigh && (report.risk_level === 'MODERATE' || score >= 30);
  const isLow = !isCritical && !isHigh && !isModerate && (report.risk_level === 'LOW' || (score >= 1 && score < 30));

  const bannerColor = isCritical
    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
    : isHigh
    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100'
    : isModerate
    ? 'border-yellow-300 dark:border-yellow-900 bg-yellow-50/90 dark:bg-yellow-950/40 text-yellow-950 dark:text-yellow-100'
    : isLow
    ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
    : 'border-slate-300 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900 text-slate-900 dark:text-zinc-200';

  const badgeBg = isCritical
    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/90 dark:text-rose-200 border-rose-300 dark:border-rose-700'
    : isHigh
    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/90 dark:text-amber-200 border-amber-300 dark:border-amber-700'
    : isModerate
    ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/90 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
    : isLow
    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/90 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
    : 'bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 border-slate-300 dark:border-zinc-700';

  return (
    <div
      id="simplified-explainer-card"
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${bannerColor}`}
    >
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xs">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs ${
              isCritical
                ? 'bg-rose-100 dark:bg-rose-900/80 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-200'
                : isHigh
                ? 'bg-amber-100 dark:bg-amber-900/80 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                : isModerate
                ? 'bg-yellow-100 dark:bg-yellow-900/80 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
                : isLow
                ? 'bg-emerald-100 dark:bg-emerald-900/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 shadow-2xs">
                Plain English Summary
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shadow-2xs ${badgeBg}`}>
                {explanation.verdict}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
              {explanation.headline}
            </h3>
          </div>
        </div>

        {/* Toggle Expansion */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-zinc-750 transition-colors shadow-2xs"
        >
          <span>{isExpanded ? 'Hide Plain Advice' : 'Read in Plain English'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Simplified Breakdown */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5 bg-white/80 dark:bg-zinc-950/70 border-t border-slate-200/80 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 text-sm leading-relaxed">
          {/* 3 Main Q&A Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: What is happening? */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold">
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>What is happening?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-normal">
                {explanation.whatIsHappening}
              </p>
            </div>

            {/* Card 2: How the trick works */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>How the trick works</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-normal">
                {explanation.theTrick}
              </p>
            </div>

            {/* Card 3: What you risk losing */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                <span>What you risk losing</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-200 leading-relaxed font-normal">
                {explanation.whatYouRiskLosing}
              </p>
            </div>
          </div>

          {/* Action Checklist in Plain Words */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Your Immediate 3-Second Action Plan</span>
              </h4>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">PLAIN ADVICE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(explanation.immediateActions || []).map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scam Words Decoder (Simple Jargon Translator) */}
          {(explanation.jargonTranslations || []).length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDictionary(!showDictionary)}
                className="text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {showDictionary
                    ? 'Hide Plain English Term Translations'
                    : `Translate ${explanation.jargonTranslations.length} technical scam terms into plain English`}
                </span>
                {showDictionary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDictionary && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-150">
                  {explanation.jargonTranslations.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1 shadow-2xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                        &quot;{item.term}&quot; in plain English:
                      </span>
                      <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {item.simpleExplanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
