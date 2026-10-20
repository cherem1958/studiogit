import React, { useState } from 'react';
import type {
  GroundingSearchResponse,
  GroundingMapsResponse,
  GroundingSourceWeb,
  GroundingPlaceMap,
} from '../types/index.ts';
import {
  Globe2,
  MapPin,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Compass,
  FileCheck2,
} from 'lucide-react';

const SEARCH_PRESETS = [
  'Banco Central do Brasil Pix and interbank settlement cutoff regulations',
  'USD/BRL foreign exchange volatility and corporate treasury hedging rules',
  'SPED Fiscal and municipal withholding tax (ISS/IRRF) compliance standards',
  'Working capital DSO benchmarks and vendor prompt payment discount yields',
];

const MAPS_PRESETS = [
  'Central Bank and corporate banking clearing branches in Belo Horizonte',
  'Cartório de Protesto de Títulos in Belo Horizonte for trade debt recovery',
  'Receita Federal and SEF-MG tax administration agencies in Belo Horizonte',
  'Itaú BBA and Banco do Brasil Corporate centers in Savassi & Lourdes, BH',
];

export const FinancialGroundingRadar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps'>('search');

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState(SEARCH_PRESETS[0]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<GroundingSearchResponse | null>(null);

  // Maps Grounding state
  const [mapsQuery, setMapsQuery] = useState(MAPS_PRESETS[0]);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<GroundingMapsResponse | null>(null);

  const handleRunSearch = async (queryToRun?: string) => {
    const q = queryToRun || searchQuery;
    if (!q.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch('/api/bpo/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data: GroundingSearchResponse = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error('Search grounding fetch error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRunMaps = async (queryToRun?: string) => {
    const q = queryToRun || mapsQuery;
    if (!q.trim()) return;

    setMapsLoading(true);
    try {
      const res = await fetch('/api/bpo/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, lat: -19.9208, lon: -43.9378 }),
      });
      const data: GroundingMapsResponse = await res.json();
      setMapsResult(data);
    } catch (err) {
      console.error('Maps grounding fetch error:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfbf8] border border-[#e2dfd8] p-5 sm:p-7 shadow-xs font-cm transition-all">
      {/* Module Header */}
      <div className="border-b border-[#e6e2d8] pb-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-sans-ui font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-300">
                Grounding Engine
              </span>
              <span className="text-[11px] font-mono-data text-slate-500">
                Powered by gemini-3.8-flash (Search & Maps Tools)
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1c1d21]">
              Live Regulatory & Financial Entity Radar
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Real-time factual verification for Financial BPO Analysts. Query authoritative Central
              Bank rules, SPED tax mandates, and exchange rate mechanics via Google Search, or verify
              banking clearing branches and notary offices in the Belo Horizonte financial district via
              Google Maps.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-100 border border-slate-300 p-0.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('search')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans-ui font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-[#1c1d21] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Search Grounding (Regulatory & Macro)</span>
            </button>
            <button
              onClick={() => setActiveTab('maps')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans-ui font-medium transition-colors ${
                activeTab === 'maps'
                  ? 'bg-[#1c1d21] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Maps Grounding (Banks & Notaries)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Google Search Grounding */}
      {activeTab === 'search' && (
        <div className="space-y-5">
          {/* Preset Prompts Strip */}
          <div>
            <div className="text-[11px] font-sans-ui uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Standard Regulatory & Compliance Inquiries:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SEARCH_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(preset);
                    handleRunSearch(preset);
                  }}
                  className="text-left text-xs font-cm bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 border border-[#d5cfc2] hover:border-slate-400 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunSearch()}
                placeholder="Enter financial regulation, banking standard, or market compliance query..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-cm"
              />
            </div>
            <button
              onClick={() => handleRunSearch()}
              disabled={searchLoading}
              className="px-4 py-2 bg-[#1c1d21] hover:bg-slate-800 disabled:bg-slate-400 text-white font-sans-ui text-xs font-medium border border-[#1c1d21] inline-flex items-center justify-center gap-2 transition-colors min-w-[140px]"
            >
              {searchLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Grounding...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Execute Search</span>
                </>
              )}
            </button>
          </div>

          {/* Search Result Card */}
          {searchResult ? (
            <div className="bg-white border border-[#dedad0] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeebe3]">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-sans-ui font-bold text-xs uppercase tracking-wider text-slate-900">
                    Grounded Regulatory Intelligence
                  </span>
                </div>
                <span className="text-[11px] font-mono-data text-slate-500">
                  Updated: {searchResult.timestamp}
                </span>
              </div>

              {/* Text Output formatted with clean typographic styling */}
              <div className="prose prose-sm max-w-none font-cm text-[#1c1d21] leading-relaxed whitespace-pre-line">
                {searchResult.text}
              </div>

              {/* Grounded Web Sources with direct links as strictly required */}
              {searchResult.sources && searchResult.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#eeebe3]">
                  <div className="text-[11px] uppercase tracking-wider font-sans-ui font-semibold text-slate-600 mb-2">
                    Verified Google Search Citations & Regulatory References:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.sources.map((src: GroundingSourceWeb, i: number) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between p-2.5 bg-[#fbfaf6] hover:bg-[#f6f3eb] border border-[#e2ded5] text-xs text-slate-800 hover:text-slate-950 transition-colors group"
                      >
                        <div className="truncate pr-2">
                          <span className="font-medium">{src.title}</span>
                          <span className="block text-[10px] font-mono-data text-slate-500 truncate">
                            {src.uri}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-dashed border-[#d5cfc2]">
              <Globe2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 font-sans-ui">
                Search Grounding Ready
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-cm">
                Select one of the standard regulatory inquiries above or input a custom compliance
                query to fetch verified, real-time facts using Google Search Grounding.
              </p>
              <button
                onClick={() => handleRunSearch()}
                className="mt-3 px-3 py-1.5 text-xs font-sans-ui bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              >
                Run Default Inquiry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Google Maps Grounding */}
      {activeTab === 'maps' && (
        <div className="space-y-5">
          {/* Preset Prompts Strip */}
          <div>
            <div className="text-[11px] font-sans-ui uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-600" />
              <span>Regional Financial Entities & Physical Clearing Hubs:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MAPS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMapsQuery(preset);
                    handleRunMaps(preset);
                  }}
                  className="text-left text-xs font-cm bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 border border-[#d5cfc2] hover:border-slate-400 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Maps Search Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mapsQuery}
                onChange={e => setMapsQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRunMaps()}
                placeholder="Search banking clearing centers, protest notaries, or tax agencies in Belo Horizonte..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5cfc2] focus:border-slate-800 focus:outline-hidden font-cm"
              />
            </div>
            <button
              onClick={() => handleRunMaps()}
              disabled={mapsLoading}
              className="px-4 py-2 bg-[#1c1d21] hover:bg-slate-800 disabled:bg-slate-400 text-white font-sans-ui text-xs font-medium border border-[#1c1d21] inline-flex items-center justify-center gap-2 transition-colors min-w-[140px]"
            >
              {mapsLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Verify Places</span>
                </>
              )}
            </button>
          </div>

          {/* Maps Result Card */}
          {mapsResult ? (
            <div className="bg-white border border-[#dedad0] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeebe3]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span className="font-sans-ui font-bold text-xs uppercase tracking-wider text-slate-900">
                    Verified Financial Places & Clearing Locations
                  </span>
                </div>
                <span className="text-[11px] font-mono-data text-slate-500">
                  Target: Belo Horizonte (lat -19.9208, lon -43.9378)
                </span>
              </div>

              {/* Text Overview */}
              <div className="prose prose-sm max-w-none font-cm text-[#1c1d21] leading-relaxed whitespace-pre-line">
                {mapsResult.text}
              </div>

              {/* Places List with Direct Google Maps URLs as required */}
              {mapsResult.places && mapsResult.places.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#eeebe3]">
                  <div className="text-[11px] uppercase tracking-wider font-sans-ui font-semibold text-slate-600 mb-2">
                    Direct Google Maps Place Links & Verification Coordinates:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mapsResult.places.map((place: GroundingPlaceMap, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-[#faf9f5] border border-[#e2dfd5] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900">{place.title}</span>
                            {place.rating && (
                              <span className="text-[10px] font-mono-data bg-amber-50 text-amber-900 px-1 border border-amber-200">
                                ★ {place.rating}
                              </span>
                            )}
                          </div>
                          {place.address && (
                            <p className="text-xs text-slate-600 font-cm mb-2 leading-tight">
                              {place.address}
                            </p>
                          )}
                        </div>
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-sans-ui font-semibold text-slate-800 hover:text-slate-950 mt-1 pt-1 border-t border-slate-200"
                        >
                          <MapPin className="w-3 h-3 text-rose-700" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-dashed border-[#d5cfc2]">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 font-sans-ui">
                Maps Grounding Ready
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-cm">
                Verify physical banking branches, corporate treasury clearing locations, notaries, and
                tax offices across Belo Horizonte with verified Google Maps places.
              </p>
              <button
                onClick={() => handleRunMaps()}
                className="mt-3 px-3 py-1.5 text-xs font-sans-ui bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              >
                Verify Belo Horizonte Financial Entities
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
