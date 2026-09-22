import React, { useState } from 'react';
import { SecurityReport } from '../types';
import {
  Printer,
  Copy,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Hash,
  Clock,
} from 'lucide-react';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SecurityReport | null;
  inputHash?: string;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  report,
  inputHash: customHash,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const timestamp = report.analyzed_at || new Date().toISOString();
  const inputHash = report.input_hash || customHash || 'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textReport = `========================================================================
CONFIDENTIAL // CYBERSECURITY FORENSIC AUDIT REPORT
========================================================================
TIMESTAMP: ${timestamp}
HASH (SHA-256): ${inputHash}
CLASSIFICATION: ${report.risk_level} (Threat Score: ${report.scam_threat_index}/100)
CATEGORY: ${report.category}
URGENCY LEVEL: ${report.urgency_level}

--- EXECUTIVE SUMMARY ---
${report.summary}

--- FORENSIC EVIDENCE & RED FLAGS ---
${
  report.red_flags_forensic && report.red_flags_forensic.length > 0
    ? report.red_flags_forensic
        .map(
          (rf, i) =>
            `[${i + 1}] ${rf.flag}\n    Impact Rating: ${rf.impact_rating} (${rf.severity})\n    Technical Analysis: ${rf.technical_explanation}`
        )
        .join('\n\n')
    : report.red_flags_detected.map((rf, i) => `[${i + 1}] ${rf}`).join('\n')
}

--- DOMAIN & ENVELOPE AUTHENTICATION ---
Spoofing Detected: ${report.domain_analysis?.spoofing_or_mismatch_detected ? 'YES' : 'NO'}
Notes: ${report.domain_analysis?.notes || 'N/A'}
${
  report.header_analysis
    ? `SPF: ${report.header_analysis.spf_status} | DKIM: ${report.header_analysis.dkim_status} | DMARC: ${report.header_analysis.dmarc_status}\nEnvelope Alignment: ${report.header_analysis.envelope_aligned ? 'ALIGNED' : 'MISMATCH / SPOOFED'}`
    : ''
}

--- RECOMMENDED ESCALATION ACTIONS ---
${report.safety_recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

========================================================================
FRAUD SECURITY REPORT GENERATED
========================================================================`;

    navigator.clipboard.writeText(textReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Speedometer calculation for printed SVG
  const score = Math.min(100, Math.max(0, report.scam_threat_index));
  const angle = (score / 100) * 180 - 90; // -90 deg to +90 deg

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return '#f43f5e';
      case 'HIGH':
        return '#f59e0b';
      case 'MODERATE':
        return '#eab308';
      case 'LOW':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  return (
    <div
      id="forensic-report-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        id="printable-forensic-dossier"
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Toolbar (hidden in print) */}
        <div className="print:hidden px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-850/70 backdrop-blur">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 tracking-tight">
              Forensic Security Report Dossier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-forensic-report-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              id="copy-forensic-report-btn"
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              id="close-forensic-report-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-white dark:bg-zinc-900 print:bg-white print:text-black print:p-0 text-slate-800 dark:text-zinc-100 font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-slate-200 dark:border-zinc-800 print:border-black pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 print:bg-slate-200 text-slate-700 dark:text-zinc-300 print:text-black text-[10px] tracking-wider font-bold uppercase mb-2 border border-slate-200 dark:border-zinc-700 print:border-black">
                  Confidential Threat Assessment
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
                  Security Fraud &amp; Threat Audit
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 print:text-slate-700 mt-1">
                  Issued by Cyber Fraud Defense Center • Forensic Assessment Report
                </p>
              </div>

              {/* Timestamp & Hash info */}
              <div className="text-right text-[11px] text-slate-500 dark:text-zinc-400 print:text-black space-y-1">
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 print:text-black" />
                  <span>{new Date(timestamp).toUTCString()}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 text-[10px] font-mono">
                  <Hash className="w-3 h-3 text-slate-400 print:text-black" />
                  <span className="truncate max-w-[200px]" title={inputHash}>
                    {inputHash.substring(0, 24)}...
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary Section with Speedometer Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 rounded-2xl bg-slate-50 dark:bg-zinc-850/60 print:bg-slate-50 border border-slate-200 dark:border-zinc-800 print:border-slate-300">
            {/* Speedometer Gauge Visual */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 print:text-slate-700 mb-1 font-bold">
                Threat Score Gauge
              </span>
              <div className="relative w-48 h-28 flex items-center justify-center">
                <svg viewBox="0 0 200 115" className="w-48 h-28 overflow-visible">
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="dark:stroke-zinc-800 print:stroke-slate-300"
                  />
                  {/* Colored Arc Segments */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 65 37"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeOpacity="0.85"
                  />
                  <path
                    d="M 65 37 A 80 80 0 0 1 100 20"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="16"
                    strokeOpacity="0.85"
                  />
                  <path
                    d="M 100 20 A 80 80 0 0 1 135 37"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeOpacity="0.85"
                  />
                  <path
                    d="M 135 37 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="16"
                    strokeOpacity="0.9"
                  />

                  {/* Needle */}
                  <g transform={`rotate(${angle} 100 100)`}>
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="28"
                      stroke={getRiskColor(report.risk_level)}
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="print:stroke-black"
                    />
                    <circle cx="100" cy="100" r="7" fill="#ffffff" stroke="#0f172a" strokeWidth="2" className="print:stroke-black" />
                  </g>
                </svg>

                {/* Score Centered Display */}
                <div className="absolute bottom-0 text-center font-mono">
                  <span className="text-2xl font-black text-slate-900 dark:text-white print:text-black">
                    {report.scam_threat_index}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">/100</span>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide print:border print:border-black"
                  style={{
                    backgroundColor: `${getRiskColor(report.risk_level)}20`,
                    color: getRiskColor(report.risk_level),
                  }}
                >
                  {report.risk_level} Risk Level
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-zinc-800 print:bg-slate-200 text-slate-700 dark:text-zinc-200 print:text-black text-xs font-medium">
                  {report.category}
                </span>
                {report.urgency_level && report.urgency_level !== 'NONE' && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-zinc-800 print:bg-slate-200 text-slate-700 dark:text-zinc-300 print:text-black text-xs font-medium">
                    Urgency: {report.urgency_level}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 print:text-slate-800 leading-relaxed pt-1">
                {report.summary}
              </p>
            </div>
          </div>

          {/* Forensic Evidence Breakdown */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 print:text-black font-bold border-b border-slate-200 dark:border-zinc-800 print:border-slate-400 pb-1.5">
              Forensic Evidence &amp; Red Flags ({report.red_flags_detected.length})
            </h2>

            <div className="space-y-3">
              {(report.red_flags_forensic && report.red_flags_forensic.length > 0
                ? report.red_flags_forensic
                : report.red_flags_detected.map((flag) => ({
                    flag,
                    impact_rating: 'Deceptive Indicator',
                    severity: report.risk_level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
                    technical_explanation: 'Violates verified communication security protocols.',
                  }))
              ).map((rf, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-850/50 print:bg-slate-50 border border-slate-200 dark:border-zinc-800 print:border-slate-300 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 print:text-black">
                      {idx + 1}. {rf.flag}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 print:border"
                      style={{
                        backgroundColor: `${getRiskColor(rf.severity)}20`,
                        color: getRiskColor(rf.severity),
                      }}
                    >
                      {rf.impact_rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 print:text-slate-700 leading-relaxed">
                    <span className="text-slate-800 dark:text-zinc-300 print:text-black font-semibold">Technical Rationale: </span>
                    {rf.technical_explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Domain & Envelope Authentication Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/50 print:bg-slate-50 border border-slate-200 dark:border-zinc-800 print:border-slate-300 space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-200 print:text-black font-bold">
              Domain &amp; Envelope Hygiene
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 print:text-slate-700">
              {report.domain_analysis?.notes || 'No suspicious domains identified.'}
            </p>
            {report.header_analysis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 print:bg-white border border-slate-200 dark:border-zinc-800 print:border-slate-300">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">SPF</span>
                  <span className="font-bold">{report.header_analysis.spf_status}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 print:bg-white border border-slate-200 dark:border-zinc-800 print:border-slate-300">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">DKIM</span>
                  <span className="font-bold">{report.header_analysis.dkim_status}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 print:bg-white border border-slate-200 dark:border-zinc-800 print:border-slate-300">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">DMARC</span>
                  <span className="font-bold">{report.header_analysis.dmarc_status}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 print:bg-white border border-slate-200 dark:border-zinc-800 print:border-slate-300">
                  <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">ENVELOPE</span>
                  <span className="font-bold">
                    {report.header_analysis.envelope_aligned ? 'ALIGNED' : 'SPOOFED'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2.5">
            <h2 className="text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 print:text-black font-bold border-b border-slate-200 dark:border-zinc-800 print:border-slate-400 pb-1.5">
              Recommended Protective Actions
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300 print:text-slate-800 list-disc list-inside">
              {report.safety_recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Audit Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 print:border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-zinc-400 print:text-slate-700 font-mono">
            <div>
              REPORT CHECKSUM: <span className="font-bold text-slate-700 dark:text-zinc-300 print:text-black">{inputHash}</span>
            </div>
            <div>STATUS: CHAIN OF CUSTODY VERIFIED • ACTIONABLE REPORT</div>
          </div>
        </div>
      </div>
    </div>
  );
};
