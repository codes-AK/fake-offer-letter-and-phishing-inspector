import React, { useState } from 'react';
import { EmailHeaderAnalysis } from '../types';
import {
  Terminal,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Server,
  Lock,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface EmailHeadersInspectorProps {
  headerAnalysis: EmailHeaderAnalysis;
}

export const EmailHeadersInspector: React.FC<EmailHeadersInspectorProps> = ({
  headerAnalysis,
}) => {
  const [copiedHops, setCopiedHops] = useState(false);

  const {
    spf_status,
    spf_details,
    dkim_status,
    dkim_details,
    dmarc_status,
    dmarc_policy,
    sender_from,
    sender_domain,
    return_path,
    return_domain,
    reply_to,
    envelope_aligned,
    spoofing_flags,
    hops,
  } = headerAnalysis;

  const copyHopTable = () => {
    const text = hops
      .map((h, i) => {
        const hopNum = h.hop_number ?? h.hop_index ?? i + 1;
        const fromHost = h.from_host || h.from || 'N/A';
        const byHost = h.by_host || h.by || 'N/A';
        const isTls = h.tls_encrypted ?? (h.tls ? h.tls.toLowerCase().includes('tls') : false);
        return `Hop ${hopNum}: IP [${h.ip || 'N/A'}] | From: ${fromHost} | By: ${byHost} | TLS: ${isTls ? 'Yes' : 'No'}`;
      })
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedHops(true);
    setTimeout(() => setCopiedHops(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
          label: 'PASS',
        };
      case 'FAIL':
        return {
          icon: XCircle,
          color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
          label: 'FAIL',
        };
      case 'SOFTFAIL':
        return {
          icon: AlertTriangle,
          color: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
          label: 'SOFTFAIL',
        };
      default:
        return {
          icon: HelpCircle,
          color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
          label: status || 'NONE',
        };
    }
  };

  const spfBadge = getStatusBadge(spf_status);
  const dkimBadge = getStatusBadge(dkim_status);
  const dmarcBadge = getStatusBadge(dmarc_status);

  return (
    <div
      id="email-headers-inspector-panel"
      className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Email Headers &amp; Authentication Forensics</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            SPF, DKIM, DMARC protocol verification and sender alignment inspection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              envelope_aligned
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700'
            }`}
          >
            {envelope_aligned ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>
              {envelope_aligned ? 'Envelope Aligned' : 'Spoofed / Mismatched Origin'}
            </span>
          </span>
        </div>
      </div>

      {/* 1. Cryptographic Protocol Status Cards: SPF / DKIM / DMARC */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SPF */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">SPF (Sender Policy)</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${spfBadge.color}`}
            >
              <spfBadge.icon className="w-3 h-3" />
              <span>{spfBadge.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-zinc-300 truncate" title={spf_details || 'No SPF details'}>
            {spf_details || (spf_status === 'PASS' ? 'Sending IP authorized by domain SPF.' : 'Sending IP unauthorized by domain SPF.')}
          </p>
        </div>

        {/* DKIM */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">DKIM (Crypto Signature)</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${dkimBadge.color}`}
            >
              <dkimBadge.icon className="w-3 h-3" />
              <span>{dkimBadge.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-zinc-300 truncate" title={dkim_details || 'No DKIM details'}>
            {dkim_details || (dkim_status === 'PASS' ? 'Cryptographic RSA signature intact.' : 'Missing or invalid cryptographic signature.')}
          </p>
        </div>

        {/* DMARC */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">DMARC Policy</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${dmarcBadge.color}`}
            >
              <dmarcBadge.icon className="w-3 h-3" />
              <span>{dmarcBadge.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-zinc-300">
            Action: <span className="font-bold text-indigo-600 dark:text-indigo-400">{dmarc_policy || 'p=none'}</span>
          </p>
        </div>
      </div>

      {/* 2. Sender Alignment Matrix: Header From vs Return-Path vs Reply-To */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Sender Envelope Alignment Check</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Visible vs Actual Routing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">HEADER FROM (Visible to User)</span>
            <span className="text-slate-900 dark:text-zinc-100 font-bold break-all block">{sender_from || 'N/A'}</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Domain: {sender_domain || 'N/A'}</span>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">RETURN-PATH (Envelope Origin)</span>
            <span
              className={`font-bold break-all block ${
                envelope_aligned ? 'text-slate-900 dark:text-zinc-100' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {return_path || 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Domain: {return_domain || 'N/A'}</span>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-bold">REPLY-TO (Response Route)</span>
            <span className="text-slate-900 dark:text-zinc-100 font-bold break-all block">{reply_to || sender_from || 'Aligned with From'}</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
              {reply_to && reply_to !== sender_from ? '⚠️ Redirects replies away from From domain!' : 'Standard alignment'}
            </span>
          </div>
        </div>

        {/* Spoofing alert callout */}
        {spoofing_flags.length > 0 && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Domain Spoofing Anomaly Detected:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-zinc-200 pl-1">
              {spoofing_flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. IP Hops Trace Table */}
      {hops && hops.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Relay Network Hop Trace ({hops.length} Relays)</span>
            </span>
            <button
              type="button"
              onClick={copyHopTable}
              className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 flex items-center gap-1 border border-slate-200 dark:border-zinc-700 transition-colors shadow-2xs font-medium"
            >
              {copiedHops ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>Copy Hops</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs bg-white dark:bg-zinc-900">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] uppercase font-bold">
                  <th className="p-2.5">Hop #</th>
                  <th className="p-2.5">Relaying IP</th>
                  <th className="p-2.5">From Host</th>
                  <th className="p-2.5">Receiving MTA</th>
                  <th className="p-2.5">Encryption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {hops.map((hop, idx) => {
                  const hopNum = hop.hop_number ?? hop.hop_index ?? idx + 1;
                  const fromHost = hop.from_host || hop.from || 'N/A';
                  const byHost = hop.by_host || hop.by || 'N/A';
                  const isSuspicious = hop.is_suspicious ?? hop.suspicious ?? false;
                  const isTls = hop.tls_encrypted ?? (hop.tls ? hop.tls.toLowerCase().includes('tls') : false);

                  return (
                    <tr
                      key={hopNum}
                      className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${
                        isSuspicious ? 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300' : 'text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">#{hopNum}</td>
                      <td className="p-2.5 font-bold font-mono">
                        {hop.ip || 'Unknown IP'}
                        {isSuspicious && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700 font-sans">
                            Suspicious
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 truncate max-w-[180px]" title={fromHost}>
                        {fromHost}
                      </td>
                      <td className="p-2.5 truncate max-w-[180px]" title={byHost}>
                        {byHost}
                      </td>
                      <td className="p-2.5">
                        {isTls ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            <Lock className="w-3 h-3" /> TLS
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Plaintext</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
