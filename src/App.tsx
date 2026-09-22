import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { RiskTierCriteriaModal } from './components/RiskTierCriteriaModal';
import { ForensicReportModal } from './components/ForensicReportModal';
import { SampleSelector } from './components/SampleSelector';
import { AnalysisForm } from './components/AnalysisForm';
import { SecurityReportView } from './components/SecurityReportView';
import { CyberAssistantChat } from './components/CyberAssistantChat';
import { SAMPLE_PRESETS } from './data/samples';
import { PresetSample, SecurityReport } from './types';
import { parseEmailHeaders } from './utils/headerParser';
import { enrichRedFlags } from './utils/forensicEnricher';
import { ShieldCheck, History, AlertCircle } from 'lucide-react';

function computeSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const part1 = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, '0');
  const part3 = Math.abs((hash * 97) | 0).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}`.substring(0, 26).toUpperCase();
}

export default function App() {
  const [content, setContent] = useState<string>(SAMPLE_PRESETS[0].content);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [sourceType, setSourceType] = useState<string>('email');
  const [inspectMode, setInspectMode] = useState<'raw' | 'email_headers'>('email_headers');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [rawJsonString, setRawJsonString] = useState<string>('');
  const [isCriteriaOpen, setIsCriteriaOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [history, setHistory] = useState<Array<{ id: string; category: string; risk: string; score: number; report: SecurityReport; raw: string; timestamp: string }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const inputHash = useMemo(() => computeSimpleHash(content), [content]);

  const executeAnalysis = useCallback(async (text: string, modeOverride?: 'raw' | 'email_headers') => {
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const activeMode = modeOverride || inspectMode;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, mode: activeMode }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: SecurityReport = await response.json();

      // Ensure client-side enrichment if server didn't include header analysis or forensic items
      if (!data.header_analysis && (activeMode === 'email_headers' || text.toLowerCase().includes('received:'))) {
        const parsed = parseEmailHeaders(text);
        if (parsed.hops.length > 0 || parsed.sender_from || parsed.spf_status !== 'UNKNOWN') {
          data.header_analysis = parsed;
        }
      }

      if ((!data.red_flags_forensic || data.red_flags_forensic.length === 0) && data.red_flags_detected?.length > 0) {
        data.red_flags_forensic = enrichRedFlags(data.red_flags_detected);
      }

      const formattedJson = JSON.stringify(data, null, 2);

      setReport(data);
      setRawJsonString(formattedJson);

      // Append to history
      setHistory((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          category: data.category || 'Incident Analysis',
          risk: data.risk_level,
          score: data.scam_threat_index,
          report: data,
          raw: formattedJson,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 7), // Keep last 8
      ]);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to complete threat analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [inspectMode]);

  // Run initial analysis on first mount with the default sample
  useEffect(() => {
    executeAnalysis(SAMPLE_PRESETS[0].content, 'email_headers');
  }, []);

  const handleSelectSample = (sample: PresetSample) => {
    setSelectedSampleId(sample.id);
    setContent(sample.content);

    let targetMode: 'raw' | 'email_headers' = 'raw';
    if (sample.category === 'Email Header Inspection' || sample.content.toLowerCase().includes('received:')) {
      targetMode = 'email_headers';
      setSourceType('email');
    } else if (sample.category.toLowerCase().includes('job')) {
      setSourceType('job_offer');
    } else if (sample.category.toLowerCase().includes('rental')) {
      setSourceType('rental');
    } else if (sample.category.toLowerCase().includes('phishing')) {
      setSourceType('email');
    } else {
      setSourceType('auto');
    }

    setInspectMode(targetMode);
    executeAnalysis(sample.content, targetMode);
  };

  const handleClear = () => {
    setContent('');
    setSelectedSampleId('');
    setReport(null);
    setRawJsonString('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
      <Header
        onOpenCriteria={() => setIsCriteriaOpen(true)}
        onExportReport={() => setIsReportModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        hasReport={!!report}
        aiStatus={isLoading ? 'evaluating' : 'online'}
        currentRiskLevel={report?.risk_level}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Benchmark Presets Section */}
        <SampleSelector
          onSelectSample={handleSelectSample}
          selectedId={selectedSampleId}
          disabled={isLoading}
        />

        {/* Input Form Section */}
        <AnalysisForm
          content={content}
          onChangeContent={(val) => {
            setContent(val);
            if (selectedSampleId) setSelectedSampleId('');
          }}
          onAnalyze={() => executeAnalysis(content)}
          onClear={handleClear}
          isLoading={isLoading}
          sourceType={sourceType}
          onChangeSourceType={setSourceType}
          inspectMode={inspectMode}
          onChangeInspectMode={(mode) => {
            setInspectMode(mode);
            executeAnalysis(content, mode);
          }}
        />

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Report Output Section */}
        {report && (
          <div className="pt-2">
            <SecurityReportView
              report={report}
              rawJsonString={rawJsonString}
              onExportReport={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {/* Session History Drawer / Chips if multiple scans */}
        {history.length > 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                Recent Threat Scans
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReport(item.report);
                    setRawJsonString(item.raw);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-xs flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.risk === 'CRITICAL'
                        ? 'bg-rose-500'
                        : item.risk === 'HIGH'
                        ? 'bg-amber-500'
                        : item.risk === 'MODERATE'
                        ? 'bg-yellow-500'
                        : item.risk === 'LOW'
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium truncate max-w-[140px]">
                    {item.category}
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">
                    {item.score}/100
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-4 text-center text-xs text-slate-500 dark:text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Cyber Fraud Command Center • Enterprise Security Intelligence</span>
          </div>
          <span className="text-slate-400 dark:text-zinc-600">
            Multi-Tier Risk Assessment Matrix • Critical • High • Moderate • Low • Inconclusive
          </span>
        </div>
      </footer>

      <RiskTierCriteriaModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
      />

      <ForensicReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={report}
        inputHash={inputHash}
      />

      <CyberAssistantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        reportContext={report}
        theme={theme}
      />
    </div>
  );
}
