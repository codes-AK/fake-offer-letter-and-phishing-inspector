import React from 'react';
import { ShieldCheck, ShieldAlert, BookOpen, FileText, Sun, Moon, Bot, Sparkles } from 'lucide-react';
import { RiskLevel } from '../types';

interface HeaderProps {
  onOpenCriteria: () => void;
  onExportReport?: () => void;
  onOpenChat: () => void;
  hasReport?: boolean;
  aiStatus: 'online' | 'ready' | 'evaluating';
  currentRiskLevel?: RiskLevel;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCriteria,
  onExportReport,
  onOpenChat,
  hasReport,
  aiStatus,
  currentRiskLevel,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  const getRiskBadge = () => {
    switch (currentRiskLevel) {
      case 'CRITICAL':
        return isLight
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : 'bg-rose-950/60 text-rose-300 border-rose-800';
      case 'HIGH':
        return isLight
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'MODERATE':
        return isLight
          ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
          : 'bg-yellow-950/60 text-yellow-300 border-yellow-800';
      case 'LOW':
        return isLight
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      default:
        return isLight
          ? 'bg-slate-100 text-slate-700 border-slate-200'
          : 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getShieldIconClass = () => {
    switch (currentRiskLevel) {
      case 'CRITICAL':
        return 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/20';
      case 'HIGH':
        return 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/20';
      case 'LOW':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20';
      default:
        return 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/20';
    }
  };

  return (
    <header className="border-b border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${getShieldIconClass()}`}
          >
            {currentRiskLevel === 'CRITICAL' || currentRiskLevel === 'HIGH' ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg tracking-tight">
                CyberSafe Fraud Shield
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                AI Defense
              </span>
              {currentRiskLevel && (
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadge()}`}>
                  {currentRiskLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:block">
              Intelligent phishing, job scam &amp; email spoofing detection
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Advisor Chat Button */}
          <button
            id="open-ai-advisor-btn"
            type="button"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold shadow-2xs transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Advisor</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-xs text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus === 'evaluating'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-[11px]">
              {aiStatus === 'evaluating' ? 'Analyzing...' : 'Ready'}
            </span>
          </div>

          {/* Export Report Button */}
          {hasReport && onExportReport && (
            <button
              id="export-forensic-report-btn"
              type="button"
              onClick={onExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-750 text-xs font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="hidden md:inline">Export Report</span>
            </button>
          )}

          {/* Risk Criteria Matrix Button */}
          <button
            id="view-risk-criteria-btn"
            type="button"
            onClick={onOpenCriteria}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-750 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Risk Criteria</span>
          </button>

          {/* User-friendly Theme Toggle */}
          <button
            id="toggle-theme-btn"
            type="button"
            onClick={onToggleTheme}
            title={isLight ? 'Switch to Dark Theme' : 'Switch to Friendly Light Theme'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors shadow-2xs"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
