import React, { useState, useEffect } from 'react';
import { SecurityReport, RiskLevel } from '../types';
import {
  Radar as RadarIcon,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Crosshair,
  Maximize2,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';

interface LiveThreatRadarProps {
  report: SecurityReport;
}

interface RadarBlip {
  id: string;
  label: string;
  category: 'critical' | 'high' | 'moderate' | 'low';
  angle: number; // 0 - 360 degrees
  distance: number; // 0 - 100 percentage from center
  details: string;
  detected: boolean;
}

export const LiveThreatRadar: React.FC<LiveThreatRadarProps> = ({ report }) => {
  const [selectedBlip, setSelectedBlip] = useState<RadarBlip | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [sweepSpeed, setSweepSpeed] = useState<'normal' | 'fast'>('normal');

  const score = report.scam_threat_index;
  const isCritical = report.risk_level === 'CRITICAL' || score >= 80;
  const isHigh = !isCritical && (report.risk_level === 'HIGH' || score >= 60);
  const isModerate = !isCritical && !isHigh && (report.risk_level === 'MODERATE' || score >= 30);
  const isLow = !isCritical && !isHigh && !isModerate && (report.risk_level === 'LOW' || (score >= 1 && score < 30));
  const isUnknown = report.risk_level === 'UNKNOWN' || score === 0;

  // Build target blips dynamically based on security evaluation
  const blips: RadarBlip[] = [];

  // Advance fee blip
  if (report.advance_fee_detected) {
    blips.push({
      id: 'adv-fee',
      label: 'Advance-Fee Trap',
      category: 'critical',
      angle: 42,
      distance: 86,
      details: 'Demands upfront payment, cashier check forwarding, or equipment fees.',
      detected: true,
    });
  }

  // Suspicious channels blip
  if (report.suspicious_channels && report.suspicious_channels.length > 0) {
    blips.push({
      id: 'channels',
      label: 'Shadow Channel (Telegram/WhatsApp)',
      category: isCritical ? 'critical' : 'high',
      angle: 130,
      distance: 74,
      details: `Routing victim to unmonitored apps: ${report.suspicious_channels.join(', ')}`,
      detected: true,
    });
  }

  // Domain spoofing blip
  if (report.domain_analysis?.spoofing_or_mismatch_detected) {
    blips.push({
      id: 'domain-spoof',
      label: 'Spoofed Domain / Lookalike',
      category: 'critical',
      angle: 220,
      distance: 90,
      details: report.domain_analysis.notes || 'Deceptive lookalike URL or spoofed sender address.',
      detected: true,
    });
  }

  // Identity harvesting blip
  if (report.identity_harvesting_detected) {
    blips.push({
      id: 'identity-harv',
      label: 'Identity / PII Harvester',
      category: 'critical',
      angle: 310,
      distance: 82,
      details: 'Soliciting SSN, banking credentials, passport, or identity photos.',
      detected: true,
    });
  }

  // Urgency pressure blip
  if (report.urgency_level === 'HIGH' || report.urgency_level === 'EXTREME') {
    blips.push({
      id: 'urgency-vec',
      label: 'Urgency Manipulation',
      category: 'high',
      angle: 175,
      distance: 68,
      details: 'Artificial deadline designed to panic victim into hasty compliance.',
      detected: true,
    });
  } else if (report.urgency_level === 'MODERATE') {
    blips.push({
      id: 'urgency-vec-mod',
      label: 'Moderate Pressure',
      category: 'moderate',
      angle: 175,
      distance: 45,
      details: 'Elevated urgency language detected in communication body.',
      detected: true,
    });
  }

  // Tactics blips if not empty
  if (report.tactics_identified && report.tactics_identified.length > 0 && blips.length < 2) {
    blips.push({
      id: 'social-eng',
      label: report.tactics_identified[0],
      category: isHigh || isCritical ? 'high' : 'moderate',
      angle: 85,
      distance: Math.min(85, Math.max(35, score)),
      details: `Social engineering pattern: ${report.tactics_identified[0]}`,
      detected: true,
    });
  }

  // If low risk / verified authentic
  if (isLow) {
    blips.push({
      id: 'corporate-trust',
      label: 'Verified Corporate Markers',
      category: 'low',
      angle: 90,
      distance: 25,
      details: 'Aligned company domain, valid hiring channels, and standard protocols.',
      detected: true,
    });
  }

  // If unknown
  if (isUnknown) {
    blips.push({
      id: 'telemetry-null',
      label: 'No Target Signals Detected',
      category: 'low',
      angle: 0,
      distance: 10,
      details: 'Insufficient text or non-contextual keywords.',
      detected: true,
    });
  }

  // Default selection to the highest threat blip
  useEffect(() => {
    if (blips.length > 0 && !selectedBlip) {
      setSelectedBlip(blips[0]);
    }
  }, [report]);

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isCritical
                ? 'bg-rose-950/80 border-rose-700/80 text-rose-400'
                : isHigh
                ? 'bg-amber-950/80 border-amber-700/80 text-amber-400'
                : isModerate
                ? 'bg-yellow-950/80 border-yellow-700/80 text-yellow-400'
                : isLow
                ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <RadarIcon className="w-4 h-4 animate-spin [animation-duration:6s]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase tracking-wider text-zinc-200 font-bold flex items-center gap-1.5 font-mono">
                LIVE SOC THREAT RADAR
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE SWEEP
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Real-time threat vector positioning &amp; perimeter tracking
            </p>
          </div>
        </div>

        {/* Radar Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors border ${
              isRotating
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isRotating ? 'PAUSE SWEEP' : 'RESUME SWEEP'}
          </button>

          <button
            type="button"
            onClick={() => setSweepSpeed(sweepSpeed === 'normal' ? 'fast' : 'normal')}
            className="px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            SPEED: {sweepSpeed.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Radar Main Grid: Radar Screen (Left) + Target Info HUD (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Radar Screen Visual (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-zinc-950 border-2 border-zinc-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center">
            {/* Concentric Range Rings */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-zinc-800 pointer-events-none" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-zinc-800/80 pointer-events-none" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-zinc-850 pointer-events-none" />
            <div className="absolute w-[20%] h-[20%] rounded-full border border-zinc-850 pointer-events-none" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-zinc-800/80 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-zinc-800/80 pointer-events-none" />

            {/* Azimuth Degree Markings */}
            <span className="absolute top-1.5 text-[9px] font-mono text-zinc-500 font-bold select-none">
              N 000°
            </span>
            <span className="absolute bottom-1.5 text-[9px] font-mono text-zinc-500 font-bold select-none">
              S 180°
            </span>
            <span className="absolute right-2 text-[9px] font-mono text-zinc-500 font-bold select-none">
              E 090°
            </span>
            <span className="absolute left-2 text-[9px] font-mono text-zinc-500 font-bold select-none">
              W 270°
            </span>

            {/* Rotating Radar Sweep Beam */}
            {isRotating && (
              <div
                className={`absolute inset-0 pointer-events-none origin-center ${
                  sweepSpeed === 'fast'
                    ? 'animate-spin [animation-duration:2.5s]'
                    : 'animate-spin [animation-duration:5s]'
                }`}
                style={{
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(244,63,94,0) 0deg, rgba(244,63,94,0) 300deg, rgba(244,63,94,0.18) 350deg, rgba(244,63,94,0.45) 360deg)',
                }}
              >
                {/* Leading sweep line */}
                <div className="absolute top-0 left-1/2 w-[1.5px] h-1/2 bg-gradient-to-t from-transparent via-rose-400 to-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              </div>
            )}

            {/* Center Axis Core */}
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 border-2 border-zinc-950 z-20 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

            {/* Plotted Threat Blips */}
            {blips.map((blip) => {
              // Convert polar coords (angle, distance 0-100) to cartesian %
              // 0 deg is North (top), 90 is East (right)
              const rad = ((blip.angle - 90) * Math.PI) / 180;
              // distance 100 corresponds to radius ~42% from center (stay within circle)
              const rPercent = (blip.distance / 100) * 40;
              const xPercent = 50 + rPercent * Math.cos(rad);
              const yPercent = 50 + rPercent * Math.sin(rad);

              const isSelected = selectedBlip?.id === blip.id;

              return (
                <button
                  key={blip.id}
                  type="button"
                  onClick={() => setSelectedBlip(blip)}
                  className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform cursor-pointer group ${
                    isSelected ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  title={`${blip.label} (${blip.category.toUpperCase()})`}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing ring around blip */}
                    <span
                      className={`absolute w-5 h-5 rounded-full opacity-75 animate-ping ${
                        blip.category === 'critical'
                          ? 'bg-rose-500'
                          : blip.category === 'high'
                          ? 'bg-amber-500'
                          : blip.category === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {/* Blip Core */}
                    <span
                      className={`relative w-3 h-3 rounded-full border border-black shadow-sm ${
                        blip.category === 'critical'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]'
                          : blip.category === 'high'
                          ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]'
                          : blip.category === 'moderate'
                          ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]'
                          : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Radar Telemetry Readout */}
          <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-zinc-500">
            <span>RNG: 100km</span>
            <span>BLIPS: {blips.length}</span>
            <span>BEARING: {selectedBlip ? `${selectedBlip.angle.toString().padStart(3, '0')}°` : '000°'}</span>
          </div>
        </div>

        {/* Target Info HUD (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-zinc-300" />
                TARGET TELEMETRY LOCK
              </span>
              {selectedBlip && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                    selectedBlip.category === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : selectedBlip.category === 'high'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : selectedBlip.category === 'moderate'
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {selectedBlip.category}
                </span>
              )}
            </div>

            {selectedBlip ? (
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    {selectedBlip.category === 'critical' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                    {selectedBlip.category === 'high' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {selectedBlip.category === 'low' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    {selectedBlip.label}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {selectedBlip.details}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-900 grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block">VECTOR ANGLE</span>
                    <span className="text-zinc-200 font-bold">{selectedBlip.angle}° AZIMUTH</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">THREAT INTENSITY</span>
                    <span className="text-zinc-200 font-bold">{selectedBlip.distance}% OF MAXIMUM</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Click on any radar blip to inspect threat telemetry.</p>
            )}
          </div>

          {/* Quick Target List Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Active Detected Vectors ({blips.length})
            </span>
            <div className="flex flex-col gap-1.5">
              {blips.map((blip) => (
                <button
                  key={blip.id}
                  type="button"
                  onClick={() => setSelectedBlip(blip)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-mono flex items-center justify-between transition-colors ${
                    selectedBlip?.id === blip.id
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-medium'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="truncate mr-2">{blip.label}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      blip.category === 'critical'
                        ? 'bg-rose-950 text-rose-300'
                        : blip.category === 'high'
                        ? 'bg-amber-950 text-amber-300'
                        : blip.category === 'moderate'
                        ? 'bg-yellow-950 text-yellow-300'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {blip.distance}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
