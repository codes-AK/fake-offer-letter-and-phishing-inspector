import React from 'react';
import { RiskLevel, UrgencyLevel } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX, HelpCircle, Flame, Activity } from 'lucide-react';

interface ThreatMeterProps {
  score: number;
  riskLevel: RiskLevel;
  category: string;
  urgencyLevel?: UrgencyLevel;
  advanceFeeDetected?: boolean;
  identityHarvestingDetected?: boolean;
}

export const ThreatIndexMeter: React.FC<ThreatMeterProps> = ({
  score,
  riskLevel,
  category,
  urgencyLevel,
  advanceFeeDetected,
  identityHarvestingDetected,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  // Gauge angle calculation: -90 degrees (at score 0) to +90 degrees (at score 100)
  const needleAngle = (clampedScore / 100) * 180 - 90;

  const getRiskTheme = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          colorHex: '#e11d48', // rose-600
          textClass: 'text-rose-600 dark:text-rose-400',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          label: 'Critical Risk Threat',
          icon: ShieldX,
          pulse: true,
        };
      case 'HIGH':
        return {
          colorHex: '#d97706', // amber-600
          textClass: 'text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'High Risk Deception',
          icon: AlertTriangle,
          pulse: false,
        };
      case 'MODERATE':
        return {
          colorHex: '#ca8a04', // yellow-600
          textClass: 'text-yellow-600 dark:text-yellow-400',
          badgeBg: 'bg-yellow-50 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          label: 'Moderate Suspicion Tier',
          icon: AlertTriangle,
          pulse: false,
        };
      case 'LOW':
        return {
          colorHex: '#059669', // emerald-600
          textClass: 'text-emerald-600 dark:text-emerald-400',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          label: 'Nominal Authenticity (Low Risk)',
          icon: ShieldCheck,
          pulse: false,
        };
      case 'UNKNOWN':
      default:
        return {
          colorHex: '#64748b', // slate-500
          textClass: 'text-slate-500 dark:text-zinc-400',
          badgeBg: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
          label: 'Inconclusive Input',
          icon: HelpCircle,
          pulse: false,
        };
    }
  };

  const theme = getRiskTheme(riskLevel);
  const Icon = theme.icon;

  return (
    <div
      id="threat-index-speedometer-panel"
      className="relative bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs overflow-hidden transition-colors"
    >
      {/* Top Meta Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Threat Speedometer Gauge</span>
            </span>
            <span className="text-xs text-slate-300 dark:text-zinc-600">•</span>
            <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${theme.badgeBg}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {theme.label}
            </span>

            {urgencyLevel && urgencyLevel !== 'NONE' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                <Flame className="w-3 h-3 text-amber-500" />
                Urgency Pressure: {urgencyLevel}
              </span>
            )}
          </div>
        </div>

        {/* Digital Score Callout */}
        <div className="flex sm:flex-col sm:items-end justify-between items-center sm:text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-bold">
            Risk Score
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl sm:text-5xl font-black tracking-tight"
              style={{ color: theme.colorHex }}
            >
              {clampedScore}
            </span>
            <span className="text-slate-400 dark:text-zinc-500 font-bold text-sm sm:text-base">/100</span>
          </div>
        </div>
      </div>

      {/* Speedometer Gauge Visual Representation */}
      <div className="relative z-10 pt-5 pb-2 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[340px] aspect-[2/1.15] flex items-center justify-center">
          <svg
            viewBox="0 0 240 140"
            className="w-full h-full overflow-visible"
            aria-label={`Threat Speedometer Gauge at ${clampedScore} percent`}
          >
            <defs>
              <linearGradient id="friendlyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="65%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background Outer Arc Track */}
            <path
              d="M 24 120 A 96 96 0 0 1 216 120"
              fill="none"
              className="stroke-slate-200 dark:stroke-zinc-800"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Active Multi-Color Arc */}
            <path
              d="M 24 120 A 96 96 0 0 1 216 120"
              fill="none"
              stroke="url(#friendlyGaugeGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="301.6"
              strokeDashoffset={301.6 - (301.6 * clampedScore) / 100}
              className="transition-all duration-1000 ease-out"
            />

            {/* Major Ticks & Labels */}
            {/* 0 (Safe) */}
            <line x1="24" y1="120" x2="36" y2="120" stroke="#10b981" strokeWidth="2.5" />
            <text x="18" y="134" className="fill-slate-400 dark:fill-zinc-500" fontSize="9" fontWeight="bold" textAnchor="middle">
              0
            </text>

            {/* 30 (Moderate) */}
            <line x1="68" y1="52" x2="76" y2="60" stroke="#eab308" strokeWidth="2" />
            <text x="60" y="46" className="fill-slate-400 dark:fill-zinc-500" fontSize="8" fontWeight="bold" textAnchor="middle">
              30
            </text>

            {/* 60 (High) */}
            <line x1="164" y1="60" x2="172" y2="52" stroke="#f59e0b" strokeWidth="2" />
            <text x="180" y="46" className="fill-slate-400 dark:fill-zinc-500" fontSize="8" fontWeight="bold" textAnchor="middle">
              60
            </text>

            {/* 100 (Critical) */}
            <line x1="204" y1="120" x2="216" y2="120" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="222" y="134" className="fill-slate-400 dark:fill-zinc-500" fontSize="9" fontWeight="bold" textAnchor="middle">
              100
            </text>

            {/* Center Pivot Base */}
            <circle cx="120" cy="120" r="11" className="fill-slate-700 dark:fill-zinc-600" />
            <circle cx="120" cy="120" r="6" fill="#ffffff" />

            {/* Animated Needle */}
            <g
              transform={`rotate(${needleAngle}, 120, 120)`}
              className="transition-transform duration-1000 ease-out"
            >
              <polygon
                points="117,120 123,120 121,38 119,38"
                style={{ fill: theme.colorHex }}
              />
              <circle cx="120" cy="38" r="3.5" style={{ fill: theme.colorHex }} />
            </g>
          </svg>
        </div>

        {/* Severity Scale Legend */}
        <div className="w-full max-w-md grid grid-cols-4 gap-1.5 mt-2 text-center text-[10px] font-semibold">
          <div className="py-1 px-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            0-29 Low
          </div>
          <div className="py-1 px-1 rounded-md bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50">
            30-59 Moderate
          </div>
          <div className="py-1 px-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            60-79 High
          </div>
          <div className="py-1 px-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            80-100 Critical
          </div>
        </div>
      </div>

      {/* Sensor Flags Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${advanceFeeDetected ? 'bg-rose-500' : 'bg-slate-300 dark:bg-zinc-600'}`} />
            Advance Fee: <strong className={advanceFeeDetected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-zinc-400'}>{advanceFeeDetected ? 'DETECTED' : 'None'}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${identityHarvestingDetected ? 'bg-rose-500' : 'bg-slate-300 dark:bg-zinc-600'}`} />
            Harvesting: <strong className={identityHarvestingDetected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-zinc-400'}>{identityHarvestingDetected ? 'DETECTED' : 'None'}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-zinc-500">Dual Heuristic &amp; Gemini Multi-Vector Engine</span>
      </div>
    </div>
  );
};
