import React, { useState } from 'react';
import type { DailyDataInput, ParsedBriefing, TaskItem, PrintExportOptions } from '../types/index.ts';
import {
  DEFAULT_PRINT_EXPORT_OPTIONS,
  BPO_CATEGORIES,
} from '../utils/curation.ts';
import { PrintableA4Report } from './PrintableA4Report.tsx';
import {
  Printer,
  X,
  FileCheck2,
  FileText,
  Sliders,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

interface PrintPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: ParsedBriefing;
  dataInput: DailyDataInput;
  tasks: TaskItem[];
}

export const PrintPdfExportModal: React.FC<PrintPdfExportModalProps> = ({
  isOpen,
  onClose,
  briefing,
  dataInput,
  tasks,
}) => {
  const [options, setOptions] = useState<PrintExportOptions>(() => ({
    ...DEFAULT_PRINT_EXPORT_OPTIONS,
  }));
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'full'>('fit');
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    // Open standard browser print dialog which supports saving directly to PDF
    window.print();
  };

  const handleCopySummary = async () => {
    try {
      const summaryText = `SYSTEMIC SYNTHESIS — FINANCIAL BPO DOSSIER
Date: ${dataInput.date}
Station: Belo Horizonte (${dataInput.weather.temperature.toFixed(1)}°C, ${dataInput.weather.condition})
Document Title: ${options.documentTitle}
Analyst: ${options.analystName} (${options.department})

--- EXECUTIVE BRIEFING ---
1. Weather in Belo Horizonte: ${dataInput.weather.temperature.toFixed(1)}°C, ${dataInput.weather.condition}
2. Market Telemetry: ${dataInput.indicators.slice(0, 4).map(i => `${i.name} (${i.value})`).join(', ')}
3. Focus: ${dataInput.philosophicalPreference || 'Classical & Scholastic Realism'}

--- TASK MATRIX (${tasks.length} items) ---
${tasks.map(t => `[${t.completed ? 'X' : ' '}] ${t.title} (${t.category.toUpperCase()}) - ${t.entityOrAccount || 'General'}`).join('\n')}
`;
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print-modal-backdrop print:hidden">
      <div className="bg-[#fcfbf9] border border-[#d2cbbe] w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl rounded-xl overflow-hidden font-cm">
        {/* Header Bar */}
        <div className="bg-[#f5f1e8] border-b border-[#ded7c8] px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8c3b2d] flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cm text-lg font-bold text-[#1c1d21]">
                  Print / PDF Export Dossier
                </h2>
                <span className="text-[10px] font-sans-ui uppercase tracking-wider px-2 py-0.5 rounded bg-[#e8dfcf] text-[#8c3b2d] font-bold border border-[#d4c7b2]">
                  A4 Paper (210×297mm) • CMU Serif
                </span>
              </div>
              <p className="font-cm text-xs text-[#6e675a] italic">
                Formats the current Executive Briefing and BPO Task Matrix for clean, publication-grade printing and PDF generation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-sans-ui font-semibold bg-[#8c3b2d] hover:bg-[#783226] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Controls & Live A4 Sheet Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-[#eee9df]">
          {/* Left Column: Configuration Controls (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#f8f6f0] border-r border-[#ded8cb] p-5 space-y-5 overflow-y-auto max-h-full">
            <div>
              <h3 className="text-xs font-sans-ui font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2.5">
                <Sliders className="w-3.5 h-3.5 text-[#8c3b2d]" />
                <span>Dossier Scope & Inclusions</span>
              </h3>

              <div className="space-y-2 text-xs font-sans-ui bg-white p-3 border border-[#ded8cb] rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeBriefing}
                    onChange={e => setOptions({ ...options, includeBriefing: e.target.checked })}
                    className="rounded text-[#8c3b2d] focus:ring-0"
                  />
                  <span className="font-semibold text-gray-900">Executive Strategic Monograph (5 Sections)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeTaskMatrix}
                    onChange={e => setOptions({ ...options, includeTaskMatrix: e.target.checked })}
                    className="rounded text-[#8c3b2d] focus:ring-0"
                  />
                  <span className="font-semibold text-gray-900">Financial BPO Task Matrix (Operational Ledger)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeSecondOrder}
                    onChange={e => setOptions({ ...options, includeSecondOrder: e.target.checked })}
                    className="rounded text-[#8c3b2d] focus:ring-0"
                  />
                  <span className="text-gray-800">Second-Order Systemic Dynamics</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeAuditSignoff}
                    onChange={e => setOptions({ ...options, includeAuditSignoff: e.target.checked })}
                    className="rounded text-[#8c3b2d] focus:ring-0"
                  />
                  <span className="text-gray-800">Auditor Certification & Sign-off Block</span>
                </label>
              </div>
            </div>

            {/* Task Filters */}
            <div>
              <h3 className="text-xs font-sans-ui font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2.5">
                <FileCheck2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Task Matrix Filter for Export</span>
              </h3>

              <div className="space-y-3 bg-white p-3 border border-[#ded8cb] rounded-lg text-xs font-sans-ui">
                <div>
                  <label className="block text-gray-600 mb-1 font-medium">Task Completion Status:</label>
                  <select
                    value={options.taskFilter}
                    onChange={e =>
                      setOptions({
                        ...options,
                        taskFilter: e.target.value as PrintExportOptions['taskFilter'],
                      })
                    }
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 focus:outline-hidden"
                  >
                    <option value="all">All Tasks ({tasks.length})</option>
                    <option value="pending">Open / Pending Only ({tasks.filter(t => !t.completed).length})</option>
                    <option value="completed">Completed / Closed Only ({tasks.filter(t => t.completed).length})</option>
                    <option value="high_priority">High Priority / Urgent Only ({tasks.filter(t => t.priority === 'high').length})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1 font-medium">Filter by BPO Category:</label>
                  <select
                    value={options.categoryFilter}
                    onChange={e => setOptions({ ...options, categoryFilter: e.target.value })}
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 focus:outline-hidden"
                  >
                    <option value="all">All BPO Workflow Categories</option>
                    {BPO_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Metadata and Sign-off Inputs */}
            <div>
              <h3 className="text-xs font-sans-ui font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>Document Details & Sign-off</span>
              </h3>

              <div className="space-y-2.5 bg-white p-3 border border-[#ded8cb] rounded-lg text-xs font-sans-ui">
                <div>
                  <label className="block text-gray-600 mb-0.5">Dossier Title:</label>
                  <input
                    type="text"
                    value={options.documentTitle}
                    onChange={e => setOptions({ ...options, documentTitle: e.target.value })}
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 font-cm"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-0.5">Analyst / Auditor Name:</label>
                  <input
                    type="text"
                    value={options.analystName}
                    onChange={e => setOptions({ ...options, analystName: e.target.value })}
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 font-cm"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-0.5">Department / Operational Desk:</label>
                  <input
                    type="text"
                    value={options.department}
                    onChange={e => setOptions({ ...options, department: e.target.value })}
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 font-cm"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-0.5">Archival Note / Comments:</label>
                  <textarea
                    rows={2}
                    value={options.notes}
                    onChange={e => setOptions({ ...options, notes: e.target.value })}
                    className="w-full p-1.5 border border-gray-300 rounded bg-[#fcfbf9] text-gray-900 font-cm text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Quick Helper / Instructions */}
            <div className="bg-[#ede7d8] border border-[#d6cdbd] p-3 rounded-lg text-xs font-sans-ui text-gray-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Info className="w-3.5 h-3.5 text-[#8c3b2d]" />
                <span>Browser PDF Generation Guide:</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                <li>Click <strong>Print / Save as PDF</strong> below.</li>
                <li>Set Destination to <strong>Save as PDF</strong>.</li>
                <li>Under More Settings, select Paper size <strong>A4</strong>.</li>
                <li>Ensure <strong>Background graphics</strong> is enabled.</li>
              </ul>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#8c3b2d] hover:bg-[#783226] text-white font-sans-ui font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Open Print / PDF Save Dialog</span>
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-sans-ui text-xs transition-colors cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Summary Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Text Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive A4 Paper Simulation Preview (lg:col-span-8) */}
          <div className="lg:col-span-8 p-4 sm:p-6 overflow-y-auto max-h-full flex flex-col items-center">
            {/* Viewport Toolbar */}
            <div className="w-full max-w-[210mm] mb-3 flex items-center justify-between text-xs font-sans-ui text-gray-700">
              <div className="flex items-center gap-2 font-medium">
                <span>Interactive A4 Sheet Preview</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-300 font-mono-data">
                  210 mm × 297 mm
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel(zoomLevel === 'fit' ? 'full' : 'fit')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-xs transition-colors cursor-pointer"
                  title="Toggle preview width"
                >
                  {zoomLevel === 'fit' ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>100% Scale</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Fit Window</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* A4 Paper Sheet Simulation */}
            <div
              className={`w-full transition-all duration-200 ${
                zoomLevel === 'fit' ? 'max-w-[195mm]' : 'max-w-[210mm]'
              }`}
            >
              <div className="a4-screen-sheet bg-white p-6 sm:p-10 border border-gray-300 rounded-sm">
                <PrintableA4Report
                  briefing={briefing}
                  dataInput={dataInput}
                  tasks={tasks}
                  options={options}
                  isScreenPreview={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
