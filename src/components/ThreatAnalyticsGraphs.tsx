import React, { useState } from 'react';
import { SecurityReport } from '../types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, Target, Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface ThreatAnalyticsGraphsProps {
  report: SecurityReport;
}

export const ThreatAnalyticsGraphs: React.FC<ThreatAnalyticsGraphsProps> = ({ report }) => {
  const [activeGraphTab, setActiveGraphTab] = useState<'radar' | 'bar'>('radar');

  const score = report.scam_threat_index;
  const isCritical = report.risk_level === 'CRITICAL' || score >= 80;
  const isHigh = !isCritical && (report.risk_level === 'HIGH' || score >= 60);
  const isModerate = !isCritical && !isHigh && (report.risk_level === 'MODERATE' || score >= 30);
  const isLow = !isCritical && !isHigh && !isModerate && (report.risk_level === 'LOW' || (score >= 1 && score < 30));
  const isUnknown = report.risk_level === 'UNKNOWN' || score === 0;

  // 1. Calculate Vector Scores for the 5 key axes (0 - 100)
  const financialScore = report.advance_fee_detected
    ? 95
    : report.red_flags_detected.some((f) => /check|wire|zelle|money|crypto|payment/i.test(f))
    ? 85
    : score >= 60
    ? 50
    : 10;

  const identityScore = report.identity_harvesting_detected
    ? 90
    : report.red_flags_detected.some((f) => /ssn|credentials|password|id|bank|login/i.test(f))
    ? 80
    : score >= 60
    ? 45
    : 15;

  const urgencyScore =
    report.urgency_level === 'EXTREME'
      ? 100
      : report.urgency_level === 'HIGH'
      ? 85
      : report.urgency_level === 'MODERATE'
      ? 55
      : report.urgency_level === 'LOW'
      ? 25
      : 5;

  const channelScore =
    report.suspicious_channels && report.suspicious_channels.length > 0
      ? 90
      : report.red_flags_detected.some((f) => /telegram|whatsapp|signal/i.test(f))
      ? 85
      : 15;

  const domainScore = report.domain_analysis?.spoofing_or_mismatch_detected
    ? 95
    : report.red_flags_detected.some((f) => /domain|spoof|link|url/i.test(f))
    ? 75
    : isLow
    ? 5
    : 20;

  const vectorRadarData = [
    { subject: 'Financial Trap', value: financialScore, fullMark: 100 },
    { subject: 'Credential Theft', value: identityScore, fullMark: 100 },
    { subject: 'Urgency Pressure', value: urgencyScore, fullMark: 100 },
    { subject: 'Shadow Channel', value: channelScore, fullMark: 100 },
    { subject: 'Domain Spoofing', value: domainScore, fullMark: 100 },
  ];

  const vectorBarData = [
    { name: 'Financial Trap', score: financialScore, desc: 'Advance fee / fake check' },
    { name: 'Credential Theft', score: identityScore, desc: 'PII & password harvesting' },
    { name: 'Urgency Pressure', score: urgencyScore, desc: 'Psychological deadline pressure' },
    { name: 'Shadow Channel', score: channelScore, desc: 'Telegram/WhatsApp redirection' },
    { name: 'Domain Spoof', score: domainScore, desc: 'Counterfeit lookalike domain' },
  ];

  // Dynamic color tone based on overall severity
  const primaryStroke = isCritical
    ? '#f43f5e'
    : isHigh
    ? '#f59e0b'
    : isModerate
    ? '#eab308'
    : isLow
    ? '#10b981'
    : '#71717a';

  const primaryFill = isCritical
    ? 'rgba(244, 63, 94, 0.45)'
    : isHigh
    ? 'rgba(245, 158, 11, 0.45)'
    : isModerate
    ? 'rgba(234, 179, 8, 0.45)'
    : isLow
    ? 'rgba(16, 185, 129, 0.45)'
    : 'rgba(113, 113, 122, 0.45)';

  const getBarColor = (val: number) => {
    if (val >= 80) return '#f43f5e';
    if (val >= 60) return '#f59e0b';
    if (val >= 30) return '#eab308';
    return '#10b981';
  };

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Graph Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-1.5 font-mono">
              THREAT VECTOR ANALYTICS &amp; SIGNAL GRAPHS
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Quantitative multi-vector evaluation across 5 attack surfaces
            </p>
          </div>
        </div>

        {/* Graph Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveGraphTab('radar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeGraphTab === 'radar'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Spider Radar Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGraphTab('bar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeGraphTab === 'bar'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Vector Bar Chart</span>
          </button>
        </div>
      </div>

      {/* Graph Display Area */}
      {activeGraphTab === 'radar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Radar Chart */}
          <div className="lg:col-span-7 h-[280px] sm:h-[310px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={vectorRadarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#71717a', fontSize: 9, fontFamily: 'monospace' }}
                  stroke="#3f3f46"
                />
                <Radar
                  name="Attack Surface Threat Index"
                  dataKey="value"
                  stroke={primaryStroke}
                  fill={primaryFill}
                  fillOpacity={0.6}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-750 rounded-lg shadow-xl text-xs font-mono">
                          <span className="text-zinc-400 block">{data.subject}</span>
                          <span className="text-zinc-100 font-bold text-sm">
                            Threat Intensity: {data.value} / 100
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics HUD */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Surface Vector Breakdown
              </span>
              <div className="space-y-2">
                {vectorBarData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-300">{item.name}</span>
                      <span
                        className="font-bold"
                        style={{ color: getBarColor(item.score) }}
                      >
                        {item.score}%
                      </span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor: getBarColor(item.score),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 leading-relaxed font-mono px-1">
              Polygonal area expansion represents total aggregate attack surface exposure.
            </div>
          </div>
        </div>
      ) : (
        /* Vector Bar Chart */
        <div className="space-y-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vectorBarData}
                margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                  stroke="#3f3f46"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-zinc-950 border border-zinc-750 rounded-lg shadow-xl text-xs font-mono space-y-1">
                          <span className="text-zinc-200 font-bold block">{data.name}</span>
                          <span className="text-zinc-400 block">{data.desc}</span>
                          <span
                            className="font-bold text-sm block pt-1 border-t border-zinc-800"
                            style={{ color: getBarColor(data.score) }}
                          >
                            Threat Score: {data.score}/100
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {vectorBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-zinc-800">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">CRITICAL THRESHOLD</span>
              <span className="text-rose-400 font-bold">&gt;= 80%</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">HIGH HAZARD</span>
              <span className="text-amber-400 font-bold">60% - 79%</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">MODERATE RISK</span>
              <span className="text-yellow-400 font-bold">30% - 59%</span>
            </div>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">NOMINAL / SAFE</span>
              <span className="text-emerald-400 font-bold">1% - 29%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
