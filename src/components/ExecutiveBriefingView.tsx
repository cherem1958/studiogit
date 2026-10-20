import React, { useState } from 'react';
import type { ParsedBriefing } from '../types/index.ts';
import { marked } from 'marked';
import {
  Copy,
  Check,
  Printer,
  FileText,
  Code2,
  Quote,
  Lightbulb,
  CloudSun,
  Shield,
  BookOpen,
} from 'lucide-react';

interface ExecutiveBriefingViewProps {
  briefing: ParsedBriefing;
  dateStr?: string;
  onRefreshAnalysis?: () => void;
  isRefreshing?: boolean;
  onOpenPrintExport?: () => void;
}

export const ExecutiveBriefingView: React.FC<ExecutiveBriefingViewProps> = ({
  briefing,
  dateStr,
  onRefreshAnalysis,
  isRefreshing = false,
  onOpenPrintExport,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'journal' | 'raw'>('journal');

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(briefing.rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderMarkdownHtml = (content: string) => {
    try {
      return { __html: marked.parse(content) as string };
    } catch {
      return { __html: content };
    }
  };

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print:bg-white">
      {/* Journal Masthead Header */}
      <div className="bg-[#f6f2e9] border-b border-[#ded8cb] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-sans-ui uppercase tracking-widest text-[#8c3b2d] font-bold">
            <span>Volume IV • Issue 28 • Strategic Synthesis</span>
          </div>
          <h2 className="font-cm text-xl md:text-2xl font-bold text-[#1c1d21] mt-0.5 tracking-tight">
            Executive Intelligence & Philosophical Monograph
          </h2>
          {dateStr && (
            <p className="font-cm text-xs text-[#6e675b] italic mt-0.5">
              Published for {dateStr} • Telemetric Station: Belo Horizonte, MG
            </p>
          )}
        </div>

        {/* Action Controls (Clean, Scalable SVG Icons, English Text) */}
        <div className="flex items-center gap-2 print:hidden">
          <div className="bg-[#eae4d5] p-1 rounded-lg border border-[#d4cdbf] flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('journal')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-sans-ui transition-colors ${
                viewMode === 'journal'
                  ? 'bg-[#ffffff] text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#666055] hover:text-[#1c1d21]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Journal View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-sans-ui transition-colors ${
                viewMode === 'raw'
                  ? 'bg-[#ffffff] text-[#1c1d21] font-semibold shadow-xs'
                  : 'text-[#666055] hover:text-[#1c1d21]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Markdown Source</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans-ui font-medium border transition-all ${
              copied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[#8c3b2d] hover:bg-[#783226] text-white border-[#8c3b2d]'
            }`}
            title="Copy clean, formatted Markdown to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenPrintExport || handlePrint}
            className="p-1.5 rounded-lg text-[#5e574a] hover:text-[#1c1d21] bg-[#f0eae0] hover:bg-[#e6dfd2] border border-[#d8d2c4] transition-colors cursor-pointer"
            title="Print or export Executive Briefing and Task Matrix to A4 PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode: Raw Markdown Source */}
      {viewMode === 'raw' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-2 text-xs font-sans-ui text-[#736c5f]">
            <span>Clean Markdown stream (Strict adherence: zero preambles or conversational text)</span>
            <span className="font-mono-data">{briefing.rawMarkdown.length} characters</span>
          </div>
          <pre className="w-full bg-[#f5f1e8] border border-[#ded8cb] rounded-lg p-5 font-mono-data text-xs text-[#2b2720] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
            {briefing.rawMarkdown}
          </pre>
        </div>
      )}

      {/* View Mode: Clean Academic Journal Layout (Computer Modern Typography) */}
      {viewMode === 'journal' && (
        <div className="p-6 md:p-8 space-y-7 max-w-4xl mx-auto">
          {/* Section 1: Weather in Belo Horizonte */}
          <section className="bg-[#faf8f4] border border-[#e2dcce] rounded-lg p-5">
            <div className="flex items-center gap-2.5 mb-2.5 border-b border-[#e8e3d6] pb-2">
              <CloudSun className="w-4 h-4 text-[#8c3b2d]" />
              <h3 className="font-cm text-base font-bold text-[#1c1d21]">
                1. 🌤️ Weather in Belo Horizonte
              </h3>
              <span className="text-[11px] font-sans-ui text-[#736c5f] ml-auto">
                Daily Disposition & Readiness
              </span>
            </div>
            <div
              className="font-cm text-sm md:text-base text-[#2e2a22] leading-relaxed space-y-2.5"
              dangerouslySetInnerHTML={renderMarkdownHtml(briefing.weatherSection)}
            />
          </section>

          {/* Section 2: Geopolitical and Economic Radar */}
          <section className="bg-[#faf8f4] border border-[#e2dcce] rounded-lg p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-3 border-b border-[#e8e3d6] pb-2.5">
              <Shield className="w-4 h-4 text-[#8c3b2d]" />
              <h3 className="font-cm text-base font-bold text-[#1c1d21]">
                2. 🌐 Geopolitical and Economic Radar
              </h3>
              <span className="text-[11px] font-sans-ui text-[#736c5f] ml-auto">
                Systemic Mechanics & Strategic Impacts
              </span>
            </div>
            <div
              className="font-cm text-sm md:text-base text-[#2e2a22] leading-relaxed space-y-3.5 prose prose-stone max-w-none"
              dangerouslySetInnerHTML={renderMarkdownHtml(briefing.radarSection)}
            />
          </section>

          {/* Section 3: Classical & Catholic Philosophical Insight */}
          <section className="bg-[#f7f3e8] border border-[#d6ccb6] rounded-lg p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-3 border-b border-[#ded3be] pb-2.5">
              <BookOpen className="w-4 h-4 text-[#8c3b2d]" />
              <h3 className="font-cm text-base font-bold text-[#1c1d21]">
                3. 🏛️ Classical & Catholic Philosophical Insight
              </h3>
              <span className="text-[11px] font-sans-ui text-[#736c5f] ml-auto">
                Causation, Teleology & Cognitive Parallax
              </span>
            </div>
            <div
              className="font-cm text-sm md:text-base text-[#2e2a22] leading-relaxed space-y-3.5"
              dangerouslySetInnerHTML={renderMarkdownHtml(briefing.philosophySection)}
            />
          </section>

          {/* Section 4: Quote of the Day */}
          <section className="bg-[#fdfcf9] border-l-4 border-[#8c3b2d] border-y border-r border-[#e5dfd2] rounded-r-lg p-5 md:p-6">
            <div className="flex items-center gap-2 text-[10px] font-sans-ui uppercase tracking-wider text-[#8c3b2d] font-bold mb-2">
              <Quote className="w-3.5 h-3.5" />
              <span>4. ✍️ Quote of the Day</span>
            </div>
            <blockquote className="font-cm text-base md:text-lg text-[#1c1d21] font-semibold italic leading-snug">
              {briefing.quoteText || briefing.quoteSection}
            </blockquote>
            {briefing.quoteAuthor && (
              <div className="text-right text-xs md:text-sm font-cm font-bold text-[#8c3b2d] mt-2">
                — {briefing.quoteAuthor}
              </div>
            )}
          </section>

          {/* Section 5: Ignition Point */}
          <section className="bg-[#fbf7f0] border border-[#e5decb] rounded-lg p-5 md:p-6">
            <div className="flex items-center gap-2.5 mb-2.5 border-b border-[#e8dfce] pb-2">
              <Lightbulb className="w-4 h-4 text-[#8c3b2d]" />
              <h3 className="font-cm text-base font-bold text-[#1c1d21]">
                5. 🧠 Ignition Point
              </h3>
              <span className="text-[11px] font-sans-ui text-[#736c5f] ml-auto">
                Executive & Tactical Challenge
              </span>
            </div>
            <div
              className="font-cm text-sm md:text-base text-[#2e2a22] italic leading-relaxed bg-[#f5efe2] p-4 rounded border border-[#ded4bf]"
              dangerouslySetInnerHTML={renderMarkdownHtml(briefing.ignitionSection)}
            />
          </section>
        </div>
      )}
    </div>
  );
};
