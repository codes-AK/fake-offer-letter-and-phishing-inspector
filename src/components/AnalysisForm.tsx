import React, { useState, useMemo } from 'react';
import {
  Trash2,
  ClipboardPaste,
  Shield,
  Loader2,
  Mail,
  Briefcase,
  Home,
  MessageSquare,
  Globe,
  Sparkles,
  Terminal,
  FileText,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { detectRealTimeHeuristics, isGibberishInput } from '../utils/heuristics';
import { parseEmailHeaders } from '../utils/headerParser';

interface AnalysisFormProps {
  content: string;
  onChangeContent: (val: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  sourceType: string;
  onChangeSourceType: (type: string) => void;
  inspectMode: 'raw' | 'email_headers';
  onChangeInspectMode: (mode: 'raw' | 'email_headers') => void;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  content,
  onChangeContent,
  onAnalyze,
  onClear,
  isLoading,
  sourceType,
  onChangeSourceType,
  inspectMode,
  onChangeInspectMode,
}) => {
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Real-time heuristics calculation
  const heuristics = useMemo(() => detectRealTimeHeuristics(content), [content]);
  const gibberishCheck = useMemo(() => isGibberishInput(content), [content]);

  // Real-time header parsing preview (when in email header mode)
  const headerPreview = useMemo(() => {
    if (inspectMode === 'email_headers' && content.trim().length > 20) {
      return parseEmailHeaders(content);
    }
    return null;
  }, [inspectMode, content]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeContent(text);
        setPasteError(null);
      }
    } catch (err) {
      setPasteError('Clipboard access denied. Please paste manually into the field.');
      setTimeout(() => setPasteError(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && !isLoading) {
        onAnalyze();
      }
    }
  };

  const loadSampleSpoofedHeader = () => {
    const sample = `Delivered-To: victim.employee@acme-corp.com
Received: from mail-relay.cheaphost.top (mail-relay.cheaphost.top [185.220.101.45])
    by mx.google.com with ESMTP id z18si492819plg.12
    for <victim.employee@acme-corp.com>;
    Tue, 22 Sep 2026 09:14:22 -0700
Received: from 192.168.1.100 (unknown [45.154.255.89])
    by mail-relay.cheaphost.top (Postfix) with ESMTPA id 8B9C14022A
    for <victim.employee@acme-corp.com>; Tue, 22 Sep 2026 16:14:20 +0000
Authentication-Results: mx.google.com;
    spf=fail (google.com: domain of bounce@cheaphost.top does not designate 185.220.101.45 as permitted sender) smtp.mailfrom=bounce@cheaphost.top;
    dkim=fail header.i=@cheaphost.top;
    dmarc=fail (p=reject sp=reject dis=none) header.from=microsoft.com
From: "Microsoft HR Executive" <careers@microsoft.com>
Reply-To: "HR Processing Center" <recruiting-urgent@cheaphost.top>
Return-Path: <bounce@cheaphost.top>
To: victim.employee@acme-corp.com
Subject: ACTION REQUIRED: Update direct deposit credentials before next payroll
Date: Tue, 22 Sep 2026 16:14:18 +0000

Dear Employee,
Your direct deposit profile must be re-verified immediately to prevent wage deposit cancellation.
Visit the secure portal: https://login-microsoft-portal-verify.top/auth`;
    onChangeInspectMode('email_headers');
    onChangeContent(sample);
  };

  const loadSampleLegitimateHeader = () => {
    const sample = `Delivered-To: victim.employee@acme-corp.com
Received: from mail-sor-f65.google.com (mail-sor-f65.google.com. [209.85.220.65])
    by mx.google.com with SMTPS id u18sor2948291ejg.4
    for <victim.employee@acme-corp.com>;
    Tue, 22 Sep 2026 10:02:11 -0700
Authentication-Results: mx.google.com;
    dkim=pass header.i=@google.com header.s=20230601 header.b=XyZ;
    spf=pass (google.com: domain of support@google.com designates 209.85.220.65 as permitted sender) smtp.mailfrom=support@google.com;
    dmarc=pass (p=reject sp=reject dis=none) header.from=google.com
From: "Google Workspace Security" <support@google.com>
Return-Path: <support@google.com>
Reply-To: "Google Workspace Security" <support@google.com>
To: victim.employee@acme-corp.com
Subject: Monthly security audit digest completed
Date: Tue, 22 Sep 2026 10:02:08 -0700

Hello,
Your scheduled monthly organization security check has completed without incidents.
You can review the full audit log in your admin console at https://admin.google.com.`;
    onChangeInspectMode('email_headers');
    onChangeContent(sample);
  };

  const sourceOptions = [
    { id: 'job_offer', label: 'Job Offer', icon: Briefcase },
    { id: 'email', label: 'Phishing Email', icon: Mail },
    { id: 'sms', label: 'SMS / Text', icon: MessageSquare },
    { id: 'rental', label: 'Rental Listing', icon: Home },
    { id: 'url', label: 'Website URL', icon: Globe },
    { id: 'auto', label: 'Auto Detect', icon: Sparkles },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      {/* Mode Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80">
            <button
              id="mode-raw-btn"
              type="button"
              onClick={() => onChangeInspectMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inspectMode === 'raw'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Offer / Message Text</span>
            </button>
            <button
              id="mode-email-headers-btn"
              type="button"
              onClick={() => onChangeInspectMode('email_headers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inspectMode === 'email_headers'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Email Headers Mode</span>
            </button>
          </div>
        </div>

        {/* Quick actions & Presets */}
        {inspectMode === 'email_headers' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-zinc-500 hidden md:inline">Presets:</span>
            <button
              type="button"
              onClick={loadSampleSpoofedHeader}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-300 dark:border-rose-800 transition-colors font-medium"
            >
              + Spoofed Header
            </button>
            <button
              type="button"
              onClick={loadSampleLegitimateHeader}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-300 dark:border-emerald-800 transition-colors font-medium"
            >
              + Legitimate Header
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id="paste-content-btn"
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-300 text-xs font-medium transition-colors border border-slate-200 dark:border-zinc-700"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
              <span>Paste</span>
            </button>
            <button
              id="clear-content-btn"
              type="button"
              disabled={!content || isLoading}
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-medium transition-colors border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-selector for raw mode source categories */}
      {inspectMode === 'raw' && (
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium mr-1 shrink-0">
              Payload Context:
            </span>
            {sourceOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = sourceType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeSourceType(opt.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800 shadow-2xs font-semibold'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-750'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pasteError && (
        <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/70 px-3 py-1.5 rounded-xl">
          {pasteError}
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          id="security-payload-input"
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            inspectMode === 'email_headers'
              ? 'Paste raw RFC 822 email headers here (Received, Authentication-Results, From, Return-Path)...'
              : 'Paste email text, SMS message, job interview transcript, rental listing, or suspicious URL here for evaluation...'
          }
          rows={inspectMode === 'email_headers' ? 9 : 6}
          className="w-full bg-slate-50/70 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-750 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-sans leading-relaxed focus:outline-hidden focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
        />

        <div className="flex items-center justify-between mt-2 text-xs text-slate-400 dark:text-zinc-500">
          <span>
            {content.length} characters • {content.trim() ? content.trim().split(/\s+/).length : 0} words
          </span>
          <span className="hidden sm:inline">Press Ctrl/Cmd + Enter to evaluate</span>
        </div>
      </div>

      {/* Real-time Heuristics Indicator */}
      {content.trim().length > 0 && (
        <div id="real-time-heuristics-bar" className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
          {heuristics.length > 0 ? (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>Real-Time Threat Sensors: {heuristics.length} High-Risk Trigger Terms Detected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {heuristics.map((h) => (
                  <span
                    key={h.id}
                    title={h.description}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      h.risk === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{h.label}:</span>
                    <span className="underline decoration-dotted font-bold">"{h.matched_text}"</span>
                  </span>
                ))}
              </div>
            </div>
          ) : gibberishCheck.isGibberish ? (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2 border border-slate-200 dark:border-zinc-700">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Input Telemetry Notice: {gibberishCheck.reason} Evaluator will assign Inconclusive status.
              </span>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 px-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Sensors Nominal: No immediate high-risk payment patterns matched yet.</span>
            </div>
          )}

          {/* Real-time Header Inspection Preview if in header mode */}
          {headerPreview && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Header Decoder Summary Preview
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {headerPreview.hops.length} Network Hops
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">SPF Status</span>
                  <span
                    className={`font-bold ${
                      headerPreview.spf_status === 'PASS'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : headerPreview.spf_status === 'FAIL'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {headerPreview.spf_status}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">DKIM Signature</span>
                  <span
                    className={`font-bold ${
                      headerPreview.dkim_status === 'PASS'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : headerPreview.dkim_status === 'FAIL'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {headerPreview.dkim_status}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">DMARC Policy</span>
                  <span
                    className={`font-bold ${
                      headerPreview.dmarc_status === 'PASS'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : headerPreview.dmarc_status === 'FAIL'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {headerPreview.dmarc_status}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Envelope Alignment</span>
                  <span
                    className={`font-bold ${
                      headerPreview.envelope_aligned
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {headerPreview.envelope_aligned ? 'ALIGNED' : 'MISMATCH / SPOOFED'}
                  </span>
                </div>
              </div>

              {headerPreview.spoofing_flags.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Header Spoofing Markers Detected:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-zinc-300 pl-1">
                    {headerPreview.spoofing_flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Submit Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <Shield className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>
            Isolated Evaluation: Payload is safely scanned and never executed.
          </span>
        </div>

        <button
          id="run-security-analysis-btn"
          type="button"
          disabled={!content.trim() || isLoading}
          onClick={onAnalyze}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            !content.trim() || isLoading
              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-md active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Security Indicators...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {inspectMode === 'email_headers' ? 'Analyze Email Headers' : 'Evaluate Threat Level'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
