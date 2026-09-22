import React from 'react';
import { X, ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle, ShieldX } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskTierCriteriaModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-800 dark:text-zinc-100 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                Threat Risk Scoring Criteria
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Evaluation guidelines used to compute the 0-100 risk score
              </p>
            </div>
          </div>
          <button
            id="close-criteria-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3.5 text-sm leading-relaxed">
          {/* Critical */}
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/60 dark:bg-rose-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                <ShieldX className="w-4 h-4" />
                Critical Risk (80 - 100)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                80 - 100
              </span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed">
              Direct advance-fee requests (pay via wire, crypto, or check deposit for supplies), unverified communication apps (Telegram, WhatsApp), extreme wage promises, high-urgency threats, or spoofed sender domains.
            </p>
          </div>

          {/* High */}
          <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/60 dark:bg-amber-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" />
                High Risk (60 - 79)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                60 - 79
              </span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed">
              Pressure tactics, premature requests for personal details (SSN, ID scans, banking info before interview), deceptive link redirections, or missing verifiable records.
            </p>
          </div>

          {/* Moderate */}
          <div className="p-3.5 rounded-xl border border-yellow-200 dark:border-yellow-900/70 bg-yellow-50/60 dark:bg-yellow-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" />
                Moderate Risk (30 - 59)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 font-bold border border-yellow-200 dark:border-yellow-800">
                30 - 59
              </span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed">
              Formatting inconsistencies, generic greetings, unverified business claims, but lacking explicit financial extortion or credential harvesting.
            </p>
          </div>

          {/* Low */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4" />
                Low Risk (1 - 29)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                1 - 29
              </span>
            </div>
            <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed">
              Standard corporate outreach, consistent contact information, verified domain records, and no requests for money or suspicious links.
            </p>
          </div>

          {/* Unknown */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4" />
                Unknown / Inconclusive (0)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 font-bold">
                0
              </span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
              Empty, conversational, or non-contextual text that does not provide enough information for automated analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
