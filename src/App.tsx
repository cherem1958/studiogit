import React, { useState, useEffect } from 'react';
import type { DailyDataInput, HistoryItem, ParsedBriefing, StrategicNode } from './types/index.ts';
import {
  generateOfflineFallbackBriefing,
  parseBriefingSections,
  SAMPLE_PRESETS,
  DEFAULT_INTERNATIONAL_NEWS,
  PHILOSOPHICAL_TRADITIONS,
} from './utils/curation.ts';
import { WeatherDisplayCard } from './components/WeatherDisplayCard.tsx';
import { MarketIndicatorsGrid } from './components/MarketIndicatorsGrid.tsx';
import { MarketRegimeIndicator } from './components/MarketRegimeIndicator.tsx';
import { SecondOrderDynamics } from './components/SecondOrderDynamics.tsx';
import { StrategicChokepointsMap } from './components/StrategicChokepointsMap.tsx';
import { InternationalEventsFeed } from './components/InternationalEventsFeed.tsx';
import { ExecutiveBriefingView } from './components/ExecutiveBriefingView.tsx';
import { PhilosophicalIndexModal } from './components/PhilosophicalIndexModal.tsx';
import { TaskMatrix } from './components/TaskMatrix.tsx';
import { LiveNewsWire } from './components/LiveNewsWire.tsx';
import { FinancialGroundingRadar } from './components/FinancialGroundingRadar.tsx';
import { PrintPdfExportModal } from './components/PrintPdfExportModal.tsx';
import { PrintableA4Report } from './components/PrintableA4Report.tsx';
import { INITIAL_TASKS } from './utils/curation.ts';
import type { TaskItem } from './types/index.ts';
import {
  BookOpen,
  Compass,
  FileText,
  Globe,
  RotateCw,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  BarChart2,
  ExternalLink,
  ListTodo,
  Radio,
  GitMerge,
  Search,
  Printer,
} from 'lucide-react';

export default function App() {
  // Preset 0 as initial data state
  const [dataInput, setDataInput] = useState<DailyDataInput>(() => {
    return JSON.parse(JSON.stringify(SAMPLE_PRESETS[0].data));
  });

  const [currentBriefing, setCurrentBriefing] = useState<ParsedBriefing>(() => {
    const initialMarkdown = generateOfflineFallbackBriefing(SAMPLE_PRESETS[0].data);
    return parseBriefingSections(initialMarkdown);
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem('systemic_bpo_task_matrix_items_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TASKS;
  });

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('systemic_bpo_task_matrix_items_v2', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks:', e);
    }
  }, [tasks]);

  const [activeTab, setActiveTab] = useState<
    'briefing' | 'tasks' | 'grounding' | 'dynamics' | 'wire' | 'telemetry' | 'chokepoints' | 'archive'
  >('briefing');
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // History / past editions state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('systemic_synthesis_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'edition-1',
        timestamp: Date.now() - 86400000,
        date: SAMPLE_PRESETS[1].data.date,
        dataInput: SAMPLE_PRESETS[1].data,
        briefing: parseBriefingSections(generateOfflineFallbackBriefing(SAMPLE_PRESETS[1].data)),
        philosophicalFocus: 'olavo-de-carvalho',
      },
      {
        id: 'edition-2',
        timestamp: Date.now() - 172800000,
        date: SAMPLE_PRESETS[2].data.date,
        dataInput: SAMPLE_PRESETS[2].data,
        briefing: parseBriefingSections(generateOfflineFallbackBriefing(SAMPLE_PRESETS[2].data)),
        philosophicalFocus: 'escola-salamanca',
      },
    ];
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('systemic_synthesis_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Automatic & manual weather refresh from real endpoint (Strictly Display-Only)
  const refreshWeatherData = async () => {
    setIsRefreshingWeather(true);
    try {
      const res = await fetch('/api/weather/bh');
      const json = await res.json();
      if (json.success && json.weather) {
        setDataInput(prev => ({
          ...prev,
          weather: json.weather,
        }));
      }
    } catch (err) {
      console.warn('Weather update failed:', err);
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  // Re-run intelligence curation via server (or deterministic fallback)
  const handleRegenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const response = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataInput),
      });

      if (!response.ok) {
        throw new Error(`API error (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.markdown) {
        const parsed = result.parsed || parseBriefingSections(result.markdown);
        setCurrentBriefing(parsed);

        const newRecord: HistoryItem = {
          id: `edition-${Date.now()}`,
          timestamp: Date.now(),
          date: dataInput.date,
          dataInput: JSON.parse(JSON.stringify(dataInput)),
          briefing: parsed,
          philosophicalFocus: dataInput.philosophicalPreference,
        };
        setHistory(prev => [newRecord, ...prev]);
        setActiveTab('briefing');
      }
    } catch (err) {
      console.warn('Fallback to local intelligence engine:', err);
      const fallbackMarkdown = generateOfflineFallbackBriefing(dataInput);
      const parsed = parseBriefingSections(fallbackMarkdown);
      setCurrentBriefing(parsed);
      setActiveTab('briefing');
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // Switch between pre-curated systemic editions (Read-Only)
  const handleSelectEdition = (index: number) => {
    const preset = SAMPLE_PRESETS[index];
    if (preset) {
      const updatedData = JSON.parse(JSON.stringify(preset.data));
      setDataInput(updatedData);
      const newBriefing = parseBriefingSections(generateOfflineFallbackBriefing(updatedData));
      setCurrentBriefing(newBriefing);
      setActiveTab('briefing');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#1c1d21] flex flex-col font-cm selection:bg-[#ecd6c9] selection:text-[#541f17]">
      {/* Top Academic Journal Masthead */}
      <header className="border-b border-[#ded7c8] bg-[#f8f5ee] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Identity & Journal Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8c3b2d] flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-cm text-lg md:text-xl font-bold tracking-tight text-[#1c1d21]">
                  SYSTEMIC SYNTHESIS
                </h1>
                <span className="text-[10px] font-sans-ui uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#ebd7c8] text-[#8c3b2d] font-bold">
                  Journal Ed.
                </span>
              </div>
              <p className="font-cm text-xs text-[#5e584c] italic hidden sm:block">
                Pragmatic Markets, Global Chokepoints & Classical Philosophical Strategy
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Plain, concise English) */}
          <nav className="flex items-center gap-1 bg-[#ede6d8] p-1 rounded-lg text-xs font-sans-ui overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('briefing')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'briefing'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Briefing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-[#2c5e3b]" />
              <span>BPO Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grounding')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'grounding'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#1e3a8a]" />
              <span>Grounding Radar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dynamics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dynamics'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5 text-[#8c3b2d]" />
              <span>2nd-Order Dynamics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wire')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'wire'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-[#8c3b2d]" />
              <span>Live Wire</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chokepoints')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'chokepoints'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Flow Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-white text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#61594b] hover:text-[#1c1d21]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Archive ({history.length})</span>
            </button>
          </nav>

          {/* Header Action Buttons: Print / PDF Export & Weather Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8c3b2d] hover:bg-[#783226] text-white font-sans-ui text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Print or export current Briefing and Task Matrix to A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF Export</span>
              <span className="sm:hidden">Print</span>
            </button>

            {/* Display-Only Belo Horizonte Weather Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#ede7d8] border border-[#dad1be] text-xs font-sans-ui">
              <span className="font-semibold text-[#1c1d21]">Belo Horizonte</span>
              <span className="text-[#8c3b2d] font-mono-data font-bold">
                {dataInput.weather.temperature.toFixed(1)}°C
              </span>
              <span className="text-[#787062]">({dataInput.weather.condition})</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Journal Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-8">
        {/* Edition Selector Bar (Read-only quick switcher) */}
        <div className="bg-[#f7f4ec] border border-[#ddd6c7] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#4f483c] font-sans-ui font-medium">
            <Layers className="w-4 h-4 text-[#8c3b2d]" />
            <span>Select Curated Edition:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectEdition(idx)}
                className="px-2.5 py-1 rounded bg-[#ffffff] hover:bg-[#f3ece0] text-[#3d382e] border border-[#d8d0bf] font-sans-ui transition-colors font-medium shadow-2xs cursor-pointer"
                title={preset.description}
              >
                {preset.name.split('&')[0]}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowIndexModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#8c3b2d]/10 hover:bg-[#8c3b2d]/15 text-[#8c3b2d] border border-[#8c3b2d]/30 font-sans-ui font-medium cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Philosophical Index</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-[#f3ece0] text-[#8c3b2d] border border-[#d8d0bf] font-sans-ui font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Print or export current briefing and tasks to A4 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 PDF Export</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Executive Briefing & Comprehensive Journal Layout */}
        {activeTab === 'briefing' && (
          <div className="space-y-8">
            {/* The 5-Section Executive Monograph */}
            <ExecutiveBriefingView
              briefing={currentBriefing}
              dateStr={dataInput.date}
              onRefreshAnalysis={handleRegenerateBriefing}
              isRefreshing={isGeneratingBriefing}
              onOpenPrintExport={() => setShowPrintModal(true)}
            />

            {/* Second-Order Dynamics (Systemic Impact Engine) */}
            <SecondOrderDynamics />

            {/* Financial BPO Task Matrix (Operational & Analytical Workflows) */}
            <TaskMatrix
              tasks={tasks}
              onTasksChange={setTasks}
              onOpenPrintExport={() => setShowPrintModal(true)}
            />

            {/* Live Regulatory & Financial Entity Grounding Radar (Search & Maps Tools) */}
            <FinancialGroundingRadar />

            {/* Market Regime & Telemetric Reference Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#ded7c8] pb-2">
                <h3 className="font-cm text-base font-bold text-[#1c1d21]">
                  Reference Telemetry: Market Regime & Global Macro Indicators
                </h3>
                <span className="text-xs font-sans-ui text-[#736c5f]">
                  Strictly Read-Only Baseline
                </span>
              </div>

              {/* Minimalist Flat Status Strip: Market Regime Indicator */}
              <MarketRegimeIndicator indicators={dataInput.indicators} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <WeatherDisplayCard
                    weather={dataInput.weather}
                    onRefresh={refreshWeatherData}
                    isRefreshing={isRefreshingWeather}
                  />
                </div>

                <div className="lg:col-span-8">
                  <MarketIndicatorsGrid indicators={dataInput.indicators} />
                </div>
              </div>
            </div>

            {/* Live News & Geopolitics Wire (Designed for Quick Scanning) */}
            <LiveNewsWire />

            {/* Flat SVG Flow Map & Geopolitical Analysis */}
            <div className="space-y-6 pt-2">
              <StrategicChokepointsMap />
              <InternationalEventsFeed newsList={dataInput.internationalNews || DEFAULT_INTERNATIONAL_NEWS} />
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Financial BPO Task Matrix */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Financial BPO Task Matrix & Workflow Control
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Daily operational and analytical workflows tailored for reconciliation, future entries, analysis, DRE reports, compliance, and urgent settlements.
              </p>
            </div>
            <TaskMatrix
              tasks={tasks}
              onTasksChange={setTasks}
              onOpenPrintExport={() => setShowPrintModal(true)}
            />
            <SecondOrderDynamics />
          </div>
        )}

        {/* Tab 3: Dedicated Grounding Radar (Google Search & Maps Grounding) */}
        {activeTab === 'grounding' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Live Regulatory & Financial Entity Radar
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Real-time Search Grounding for regulatory mandates (BCB/Pix, SPED Fiscal) and Maps Grounding for verified banking and clearing locations in Belo Horizonte.
              </p>
            </div>
            <FinancialGroundingRadar />
            <SecondOrderDynamics />
          </div>
        )}

        {/* Tab 3: Dedicated Second-Order Dynamics */}
        {activeTab === 'dynamics' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Second-Order Dynamics: Systemic Macro-to-Micro Transmission
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Causality cascade modeling primary market shocks through balance sheet transmission down to tactical BPO working capital actions.
              </p>
            </div>
            <SecondOrderDynamics />
            <MarketRegimeIndicator indicators={dataInput.indicators} />
          </div>
        )}

        {/* Tab 4: Dedicated Live Wire */}
        {activeTab === 'wire' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Real-Time Geopolitics & Macroeconomic Wire
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Direct client-side syndicated stream with rapid scanning layout and primary source links.
              </p>
            </div>
            <LiveNewsWire />
            <InternationalEventsFeed newsList={dataInput.internationalNews || DEFAULT_INTERNATIONAL_NEWS} />
          </div>
        )}

        {/* Tab 5: Dedicated Display-Only Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Observational Telemetry: Belo Horizonte & Global Financial Markets
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                All measurements are display-only and synchronized directly with authoritative meteorological and market feeds.
              </p>
            </div>

            <MarketRegimeIndicator indicators={dataInput.indicators} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <WeatherDisplayCard
                  weather={dataInput.weather}
                  onRefresh={refreshWeatherData}
                  isRefreshing={isRefreshingWeather}
                />
              </div>

              <div className="lg:col-span-8">
                <MarketIndicatorsGrid indicators={dataInput.indicators} />
              </div>
            </div>

            <SecondOrderDynamics />
          </div>
        )}

        {/* Tab 6: Dedicated Flat 2D Flow Map & Chokepoints */}
        {activeTab === 'chokepoints' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Geopolitical Chokepoints & International Bottleneck Vectors
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Clean flat vector representation of global trade nodes, energy passages, and liquidity clearing hubs.
              </p>
            </div>

            <StrategicChokepointsMap />
            <InternationalEventsFeed newsList={dataInput.internationalNews || DEFAULT_INTERNATIONAL_NEWS} />
          </div>
        )}

        {/* Tab 7: Archive / Past Editions */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="border-b border-[#ded7c8] pb-3">
              <h2 className="font-cm text-xl font-bold text-[#1c1d21]">
                Journal Archive & Historical Monograph Index
              </h2>
              <p className="font-cm text-xs text-[#5e584c] italic">
                Explore previous strategic analyses and philosophical inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {history.map(item => (
                <div
                  key={item.id}
                  className="bg-[#fcfbf9] border border-[#d8d3c7] hover:border-[#8c3b2d] rounded-xl p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#8c3b2d]" />
                      <span className="font-mono-data text-xs font-bold text-[#1c1d21]">{item.date}</span>
                      {item.philosophicalFocus && (
                        <span className="text-[10px] font-sans-ui uppercase tracking-wider px-2 py-0.5 rounded bg-[#f2ebd9] text-[#783e33] border border-[#e5d8be]">
                          {item.philosophicalFocus}
                        </span>
                      )}
                    </div>
                    <h4 className="font-cm font-bold text-sm text-[#1c1d21] mb-1">
                      Belo Horizonte: {item.dataInput.weather.temperature.toFixed(1)}°C ({item.dataInput.weather.condition})
                    </h4>
                    <p className="font-cm text-xs text-[#5e584c] italic line-clamp-2 max-w-2xl">
                      "{item.briefing.quoteText || item.briefing.quoteSection}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDataInput(JSON.parse(JSON.stringify(item.dataInput)));
                      setCurrentBriefing(item.briefing);
                      setActiveTab('briefing');
                    }}
                    className="flex-shrink-0 px-3.5 py-1.5 bg-[#f4efe4] hover:bg-[#eae3d4] text-[#8c3b2d] border border-[#d4cbba] rounded-lg text-xs font-sans-ui font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Read Edition</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Philosophical Reference Index Modal */}
      <PhilosophicalIndexModal
        isOpen={showIndexModal}
        onClose={() => setShowIndexModal(false)}
        onSelectTradition={tradId => {
          setDataInput(prev => ({ ...prev, philosophicalPreference: tradId }));
        }}
      />

      {/* Print / PDF Export Modal */}
      <PrintPdfExportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        briefing={currentBriefing}
        dataInput={dataInput}
        tasks={tasks}
      />

      {/* Hidden on screen, solely rendered during native browser print for clean A4 output */}
      <div id="a4-print-document" className="hidden print:block">
        <PrintableA4Report
          briefing={currentBriefing}
          dataInput={dataInput}
          tasks={tasks}
          isScreenPreview={false}
        />
      </div>

      {/* Academic Footer */}
      <footer className="border-t border-[#ded7c8] bg-[#f8f5ee] py-6 mt-12 text-center text-xs font-cm text-[#635d50]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SYSTEMIC SYNTHESIS • ISSN 2984-7128
          </div>
          <div>
            Executive Journal of Macro Dynamics, Financial BPO Intelligence & Classical Thought
          </div>
        </div>
      </footer>
    </div>
  );
}
