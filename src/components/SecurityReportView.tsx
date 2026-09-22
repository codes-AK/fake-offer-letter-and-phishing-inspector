import React, { useState } from 'react';
import { SecurityReport, RiskLevel } from '../types';
import { ThreatIndexMeter } from './ThreatIndexMeter';
import { ForensicEvidenceExpander } from './ForensicEvidenceExpander';
import { EmailHeadersInspector } from './EmailHeadersInspector';
import { EscalationMatrix } from './EscalationMatrix';
import { SECURITY_REPORT_JSON_SCHEMA } from '../data/schema';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Code2,
  FileText,
  Copy,
  Check,
  Download,
  Globe,
  Radio,
  ListChecks,
  Printer,
  FileJson,
  CheckCircle2,
  Circle,
  ExternalLink,
  Lock,
  HelpCircle,
  Flame,
  ShieldX,
  Shield,
} from 'lucide-react';

interface SecurityReportViewProps {
  report: SecurityReport;
  rawJsonString: string;
  onExportReport?: () => void;
}

export const SecurityReportView: React.FC<SecurityReportViewProps> = ({
  report,
  rawJsonString,
  onExportReport,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'json' | 'schema'>('report');
  const [copied, setCopied] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([rawJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${report.risk_level.toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSteps = report.verification_steps?.length || 0;
  const completedStepsCount = Object.values(checkedSteps).filter(Boolean).length;

  const score = report.scam_threat_index;
  const riskLevel = report.risk_level;

  const isCritical = riskLevel === 'CRITICAL' || score >= 80;
  const isHigh = !isCritical && (riskLevel === 'HIGH' || score >= 60);
  const isModerate = !isCritical && !isHigh && (riskLevel === 'MODERATE' || score >= 30);
  const isLow = !isCritical && !isHigh && !isModerate && (riskLevel === 'LOW' || (score >= 1 && score < 30));
  const isUnknown = riskLevel === 'UNKNOWN' || score === 0;

  return (
    <div className="space-y-6">
      {/* View Mode Toggle Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800 print:hidden">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="tab-analyst-report"
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              Security Report {isCritical ? '(Critical)' : isLow ? '(Verified Safe)' : ''}
            </span>
          </button>

          <button
            id="tab-raw-json"
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Output</span>
          </button>

          <button
            id="tab-schema-spec"
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Schema Details</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="print-dossier-btn"
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-medium transition-colors shadow-2xs"
            title="Print or save PDF report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            id="copy-json-btn"
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-medium transition-colors shadow-2xs"
            title="Copy structured JSON report to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            id="download-json-btn"
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-medium transition-colors shadow-2xs"
            title="Download JSON report artifact"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 1. CRITICAL THREAT LAYOUT (Score 80-100 / CRITICAL)                       */}
          {/* ========================================================================= */}
          {isCritical && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Critical Threat Breach Header Banner */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-700 dark:text-rose-200 shrink-0">
                    <ShieldX className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-rose-800 dark:text-rose-400">
                        Critical Threat Detected
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold">
                        Score: {report.scam_threat_index}/100
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-100 mt-0.5">
                      High-confidence malicious pattern: Advance-fee scam, credential theft, or unauthorized lure.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shrink-0 text-center shadow-xs">
                  Do Not Respond
                </div>
              </div>

              {/* Split Hero: Threat Gauge (Left) + Emergency Protective Protocol (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5">
                  <ThreatIndexMeter
                    score={report.scam_threat_index}
                    riskLevel={report.risk_level}
                    category={report.category}
                    urgencyLevel={report.urgency_level}
                    advanceFeeDetected={report.advance_fee_detected}
                    identityHarvestingDetected={report.identity_harvesting_detected}
                  />
                </div>

                {/* Emergency Recommendations */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-100 dark:border-rose-900/40">
                      <h3 className="text-xs uppercase tracking-wider text-rose-800 dark:text-rose-400 font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        Immediate Protective Actions
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                        Priority Actions
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {report.safety_recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-rose-100 flex items-start gap-2.5 leading-relaxed bg-rose-50/50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/50"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span className="font-medium">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Warning on money transfers */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Never deposit unexpected cashier checks or wire funds to unverified third parties.</span>
                  </div>
                </div>
              </div>

              {/* Forensic Evidence Expander */}
              <ForensicEvidenceExpander
                redFlags={report.red_flags_detected}
                forensicItems={report.red_flags_forensic}
                themeColor="rose"
              />

              {/* Email Headers Analyzer */}
              {report.header_analysis && (
                <EmailHeadersInspector headerAnalysis={report.header_analysis} />
              )}

              {/* Escalation Matrix */}
              <EscalationMatrix report={report} />

              {/* Shadow Channels & Manipulation Tactics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Suspicious Communication Channels */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Flagged Communication Channels
                  </h3>
                  {report.suspicious_channels && report.suspicious_channels.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        Scammers redirect victims to external channels to evade platform protections:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {report.suspicious_channels.map((chan, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold"
                          >
                            ⚠️ {chan}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-zinc-500">No off-platform communication channels flagged.</p>
                  )}
                </div>

                {/* Tactics Identified */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Deceptive Tactics &amp; Manipulation
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {report.tactics_identified.map((tactic, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
                      >
                        {tactic}
                      </span>
                    ))}
                  </div>
                  {report.urgency_level && report.urgency_level !== 'NONE' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Urgency Rating: {report.urgency_level}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Domain Spoofing Analysis & Executive Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Domain Analysis */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Domain &amp; Infrastructure Intelligence
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-zinc-400">Domain Spoofing / Mismatch:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          report.domain_analysis?.spoofing_or_mismatch_detected
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {report.domain_analysis?.spoofing_or_mismatch_detected
                          ? 'Spoofing Detected'
                          : 'Clean'}
                      </span>
                    </div>
                    {report.domain_analysis?.identified_domains?.length > 0 && (
                      <div>
                        {report.domain_analysis.identified_domains.map((d, i) => (
                          <span key={i} className="inline-block px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 mr-1 mb-1 font-mono text-[11px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-600 dark:text-zinc-400 text-xs">{report.domain_analysis?.notes}</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Security Assessment Summary
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed mb-3">
                    {report.summary}
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                    Conclusion: Multiple fraudulent indicators discovered. Do not proceed with this inquiry.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. HIGH RISK LAYOUT (Score 60-79 / HIGH)                                  */}
          {/* ========================================================================= */}
          {isHigh && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* High Hazard Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-200 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-400">
                        High Risk Phishing or Scam Alert
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                        Score: {report.scam_threat_index}/100
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mt-0.5">
                      Sensitive credentials or financial redirection attempt detected. Cease communication.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shrink-0 text-center shadow-xs">
                  High Risk
                </div>
              </div>

              {/* Threat Index Meter */}
              <ThreatIndexMeter
                score={report.scam_threat_index}
                riskLevel={report.risk_level}
                category={report.category}
                urgencyLevel={report.urgency_level}
                advanceFeeDetected={report.advance_fee_detected}
                identityHarvestingDetected={report.identity_harvesting_detected}
              />

              {/* 60/40 Grid: Left (Attack Forensics) / Right (Containment & Checklist) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-5">
                  <ForensicEvidenceExpander
                    redFlags={report.red_flags_detected}
                    forensicItems={report.red_flags_forensic}
                    themeColor="amber"
                  />

                  {/* Domain & URL Intelligence */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Domain &amp; Routing Verification
                    </h3>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-zinc-400">Lookalike / Spoofing:</span>
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {report.domain_analysis?.spoofing_or_mismatch_detected ? 'Confirmed' : 'None Detected'}
                        </span>
                      </div>
                      {report.domain_analysis?.identified_domains?.length > 0 && (
                        <div>
                          {report.domain_analysis.identified_domains.map((d, i) => (
                            <span key={i} className="inline-block px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 mr-1 mb-1 font-mono text-[11px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-slate-600 dark:text-zinc-400 text-xs">{report.domain_analysis?.notes}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Executive Summary
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>
                </div>

                {/* Right: Containment Steps, Tactics & Verification */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Protective Steps
                    </h3>
                    <ul className="space-y-2">
                      {report.safety_recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Deception Vectors
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {report.tactics_identified.map((tactic, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs">
                          {tactic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Verification Checklist
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                        {completedStepsCount}/{totalSteps}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {report.verification_steps.map((step, idx) => {
                        const isChecked = !!checkedSteps[idx];
                        return (
                          <li
                            key={idx}
                            onClick={() => toggleStep(idx)}
                            className={`text-xs p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                              isChecked
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 line-through'
                                : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-850'
                            }`}
                          >
                            <button type="button" className="mt-0.5 text-slate-400 hover:text-emerald-600">
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                            </button>
                            <span className="leading-relaxed select-none">{step}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {report.header_analysis && (
                <EmailHeadersInspector headerAnalysis={report.header_analysis} />
              )}

              <EscalationMatrix report={report} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MODERATE RISK LAYOUT (Score 30-59 / MODERATE)                          */}
          {/* ========================================================================= */}
          {isModerate && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-700 text-yellow-950 dark:text-yellow-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-800 dark:text-yellow-200 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-yellow-800 dark:text-yellow-400">
                        Moderate Risk Advisory
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 font-bold">
                        Score: {report.scam_threat_index}/100
                      </span>
                    </div>
                    <p className="text-sm font-medium text-yellow-950 dark:text-yellow-100 mt-0.5">
                      Suspicious anomalies detected alongside plausible markers. Verify before proceeding.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-yellow-600 text-white text-xs font-bold shrink-0 text-center shadow-xs">
                  Manual Verification Needed
                </div>
              </div>

              <ThreatIndexMeter
                score={report.scam_threat_index}
                riskLevel={report.risk_level}
                category={report.category}
                urgencyLevel={report.urgency_level}
                advanceFeeDetected={report.advance_fee_detected}
                identityHarvestingDetected={report.identity_harvesting_detected}
              />

              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Analysis Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-zinc-200 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Side-by-Side: Red flags vs Positive indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ForensicEvidenceExpander
                  redFlags={report.red_flags_detected}
                  forensicItems={report.red_flags_forensic}
                  themeColor="yellow"
                />

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Plausible Trust Elements ({report.positive_indicators.length})
                  </h3>
                  {report.positive_indicators.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No verifiable positive indicators detected.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {report.positive_indicators.map((indicator, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <span>{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Recommended Verification Steps
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                      {completedStepsCount}/{totalSteps} Verified
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {report.verification_steps.map((step, idx) => {
                      const isChecked = !!checkedSteps[idx];
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`text-xs p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 line-through'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <button type="button" className="mt-0.5 text-slate-400 hover:text-emerald-600">
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                          <span className="leading-relaxed select-none">{step}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    Safety Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {report.safety_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {report.header_analysis && (
                <EmailHeadersInspector headerAnalysis={report.header_analysis} />
              )}

              <EscalationMatrix report={report} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. LOW RISK LAYOUT (Score 1-29 / LOW)                                     */}
          {/* ========================================================================= */}
          {isLow && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-200 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400">
                        Authenticity Verified • Low Risk
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold">
                        Score: {report.scam_threat_index}/100
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-0.5">
                      Communication conforms to authentic enterprise recruitment and verified email standards.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 text-center shadow-xs">
                  Authentic
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5">
                  <ThreatIndexMeter
                    score={report.scam_threat_index}
                    riskLevel={report.risk_level}
                    category={report.category}
                    urgencyLevel={report.urgency_level}
                    advanceFeeDetected={report.advance_fee_detected}
                    identityHarvestingDetected={report.identity_harvesting_detected}
                  />
                </div>

                <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-100 dark:border-emerald-900/60">
                      <h3 className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Verified Trust Indicators ({report.positive_indicators.length})
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                        Official Standards
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {report.positive_indicators.map((indicator, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-emerald-100 flex items-start gap-2.5 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40"
                        >
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <span className="font-medium">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Domain aligns with corporate records. No advance fee requests detected.</span>
                  </div>
                </div>
              </div>

              {/* Domain & Standard Corporate Onboarding Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Domain &amp; Contact Hygiene
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-zinc-400">Domain Spoofing Check:</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Passed &amp; Aligned
                      </span>
                    </div>
                    {report.domain_analysis?.identified_domains?.length > 0 && (
                      <div>
                        {report.domain_analysis.identified_domains.map((d, i) => (
                          <span key={i} className="inline-block px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 mr-1 mb-1 font-mono text-[11px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-600 dark:text-zinc-400 text-xs">{report.domain_analysis?.notes}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Standard Corporate Confirmation
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold">
                      {completedStepsCount}/{totalSteps}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {report.verification_steps.map((step, idx) => {
                      const isChecked = !!checkedSteps[idx];
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`text-xs p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 line-through'
                              : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <button type="button" className="mt-0.5 text-slate-400 hover:text-emerald-600">
                            {isChecked ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                          <span className="leading-relaxed select-none">{step}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Executive Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-zinc-200 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {report.header_analysis && (
                <EmailHeadersInspector headerAnalysis={report.header_analysis} />
              )}

              <EscalationMatrix report={report} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. UNKNOWN / INCONCLUSIVE LAYOUT                                          */}
          {/* ========================================================================= */}
          {isUnknown && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-zinc-300">
                        Inconclusive Input
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400 font-bold">
                        Score: 0/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-300 mt-0.5">
                      Input payload is empty or lacks enough context for threat categorization.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold shrink-0 text-center">
                  More Context Needed
                </div>
              </div>

              <ThreatIndexMeter
                score={0}
                riskLevel="UNKNOWN"
                category={report.category || 'Unclassified'}
                urgencyLevel={report.urgency_level || 'NONE'}
                advanceFeeDetected={false}
                identityHarvestingDetected={false}
              />

              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Tips for Better Evaluation
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  For an accurate assessment, please provide a realistic message containing details like sender addresses, offer letters, payment terms, or email headers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="font-semibold text-slate-900 dark:text-zinc-200 block mb-1">1. Phishing &amp; Alerts:</span>
                    <span className="text-slate-600 dark:text-zinc-400">Full email body with sender address, subject line, and links.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <span className="font-semibold text-slate-900 dark:text-zinc-200 block mb-1">2. Job Offers:</span>
                    <span className="text-slate-600 dark:text-zinc-400">Offer letter or chat transcript with rates, interview channel, or check deposit requests.</span>
                  </div>
                </div>
              </div>

              <EscalationMatrix report={report} />
            </div>
          )}
        </div>
      ) : activeTab === 'json' ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Validated JSON Output
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              Content-Type: application/json
            </span>
          </div>
          <pre className="text-xs font-mono text-slate-800 dark:text-zinc-300 overflow-x-auto p-3.5 bg-slate-50 dark:bg-zinc-900/70 rounded-xl max-h-[580px] leading-relaxed border border-slate-200 dark:border-zinc-800">
            {rawJsonString}
          </pre>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs text-slate-900 dark:text-zinc-200 font-semibold">
                Security Report Schema Specification
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              Draft-07 Standard
            </span>
          </div>
          <div className="mb-3 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            The Gemini AI model is constrained via schema enforcement. All evaluated reports conform strictly to the properties, enums, and required parameters below.
          </div>
          <pre className="text-xs font-mono text-slate-800 dark:text-zinc-300 overflow-x-auto p-3.5 bg-slate-50 dark:bg-zinc-900/70 rounded-xl max-h-[550px] leading-relaxed border border-slate-200 dark:border-zinc-800">
            {JSON.stringify(SECURITY_REPORT_JSON_SCHEMA, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
