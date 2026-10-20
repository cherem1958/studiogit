import React from 'react';
import type { DailyDataInput, ParsedBriefing, TaskItem, PrintExportOptions } from '../types/index.ts';
import {
  DEFAULT_PRINT_EXPORT_OPTIONS,
  filterTasksForPrint,
  getCategoryLabel,
  generateDossierReferenceCode,
  evaluateMarketRegime,
  SECOND_ORDER_CAUSALITY_PRESETS,
} from '../utils/curation.ts';

interface PrintableA4ReportProps {
  briefing: ParsedBriefing;
  dataInput: DailyDataInput;
  tasks: TaskItem[];
  options?: PrintExportOptions;
  isScreenPreview?: boolean;
}

export const PrintableA4Report: React.FC<PrintableA4ReportProps> = ({
  briefing,
  dataInput,
  tasks,
  options = DEFAULT_PRINT_EXPORT_OPTIONS,
  isScreenPreview = false,
}) => {
  const filteredTasks = filterTasksForPrint(tasks, options.taskFilter, options.categoryFilter);
  const regimeState = evaluateMarketRegime(dataInput.indicators);
  const dossierRef = React.useMemo(() => generateDossierReferenceCode(dataInput.date), [dataInput.date]);

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const pendingCount = filteredTasks.filter(t => !t.completed).length;
  const highPriorityCount = filteredTasks.filter(t => t.priority === 'high').length;

  return (
    <div
      className={`font-cm text-[#111111] bg-white leading-relaxed ${
        isScreenPreview
          ? 'p-8 sm:p-12 text-[13px] border border-[#d6d0c4] shadow-md max-w-[210mm] mx-auto'
          : 'p-0 text-[10.5pt]'
      }`}
      style={{
        fontFamily: "var(--font-serif, 'Computer Modern Serif', 'Latin Modern Roman', 'CMU Serif', Georgia, serif)",
      }}
    >
      {/* =========================================================================
          A4 MASTHEAD: ACADEMIC / FINANCIAL BPO HEADER
          ========================================================================= */}
      <header className="border-b-2 border-black pb-4 mb-6">
        {/* Double rule header styling */}
        <div className="border-t-2 border-b border-black py-1.5 mb-3 flex items-center justify-between text-[10px] tracking-widest uppercase font-sans-ui font-semibold text-black">
          <span>Official Operational & Strategic Intelligence Dossier</span>
          <span>A4 Document Specification • CMU Serif Academic Standard</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-black font-cm">
              {options.documentTitle || 'Financial BPO Operations & Strategic Monograph Dossier'}
            </h1>
            <p className="text-xs sm:text-sm italic text-gray-700 font-cm mt-0.5">
              Comprehensive Operational Ledger, Macro Dynamics & Classical Strategic Synthesis
            </p>
          </div>
          <div className="text-right sm:text-right text-[11px] font-mono-data text-gray-800">
            <div className="font-bold">{dossierRef}</div>
            <div className="text-gray-600">CONFIDENTIAL // AUDIT COPY</div>
          </div>
        </div>

        {/* Telemetric & Administrative Metadata Strip */}
        <div className="mt-4 pt-3 border-t border-gray-400 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50/70 p-2.5 border border-gray-300">
          <div>
            <span className="block text-[9.5px] uppercase font-sans-ui font-bold text-gray-600">Date / Cycle</span>
            <span className="font-semibold text-black">{dataInput.date}</span>
          </div>

          <div>
            <span className="block text-[9.5px] uppercase font-sans-ui font-bold text-gray-600">Station Baseline</span>
            <span className="font-semibold text-black">
              Belo Horizonte ({dataInput.weather.temperature.toFixed(1)}°C, {dataInput.weather.condition})
            </span>
          </div>

          <div>
            <span className="block text-[9.5px] uppercase font-sans-ui font-bold text-gray-600">Market Regime</span>
            <span className="font-semibold text-black">
              {regimeState.regime}
            </span>
          </div>

          <div>
            <span className="block text-[9.5px] uppercase font-sans-ui font-bold text-gray-600">Auditor / Desk</span>
            <span className="font-semibold text-black truncate block">
              {options.analystName || 'Financial BPO Desk'}
            </span>
          </div>
        </div>

        {options.notes && (
          <div className="mt-2 text-[11px] text-gray-600 italic bg-gray-50 px-2.5 py-1 border-l-2 border-gray-400">
            Note: {options.notes}
          </div>
        )}
      </header>

      {/* =========================================================================
          PART I: EXECUTIVE BRIEFING & STRATEGIC MONOGRAPH (If Selected)
          ========================================================================= */}
      {options.includeBriefing && (
        <section className="mb-8 a4-avoid-break">
          <div className="border-b border-black pb-1.5 mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black font-cm">
              Part I: Executive Intelligence & Strategic Monograph
            </h2>
            <span className="text-[10px] uppercase font-sans-ui text-gray-600 font-semibold">
              5-Section Curation
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Belo Horizonte Weather */}
            <article className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-black mb-1 font-cm">
                1. Weather in Belo Horizonte: Atmospheric Baseline & Operational Readiness
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify">
                {briefing.weatherSection ||
                  `The ambient conditions in Belo Horizonte stand at ${dataInput.weather.temperature.toFixed(
                    1
                  )}°C with ${dataInput.weather.condition.toLowerCase()} and relative humidity at ${
                    dataInput.weather.humidity
                  }%. The physiological and operational atmosphere establishes a stable, disciplined baseline for corporate treasury reconciliations and analytical diligence.`}
              </p>
            </article>

            {/* 2. Market Telemetry */}
            <article className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-black mb-1 font-cm">
                2. Market Telemetry & Commodity Analysis
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify">
                {briefing.radarSection ||
                  `Macro telemetry confirms prevailing ${regimeState.regime} conditions. Benchmark sovereign and currency rates govern corporate cash preservation and liquidity sweep discipline across treasury desks.`}
              </p>
            </article>

            {/* 3. Philosophical Strategy & Epistemological Grounding */}
            <article className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-black mb-1 font-cm">
                3. Philosophical Strategy & Strategic Grounding
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify italic">
                {briefing.philosophySection ||
                  `Integrating classical realism, scholastic economics, and modern systemic thought, strategic execution demands discernment between transient volatility and structural reality.`}
              </p>
            </article>

            {/* 4. Classical Quote & Anchor */}
            {(briefing.quoteSection || briefing.quoteText) && (
              <article className="border-b border-gray-200 pb-3 bg-gray-50/60 p-2.5 border-l-2 border-black">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-1 font-cm">
                  4. Classical Maxim & Strategic Anchor
                </h3>
                <blockquote className="text-gray-900 italic font-cm text-xs leading-relaxed">
                  "{briefing.quoteText || briefing.quoteSection}"
                </blockquote>
                {briefing.quoteAuthor && (
                  <div className="text-[11px] font-sans-ui text-gray-700 font-bold mt-1 text-right">
                    — {briefing.quoteAuthor}
                  </div>
                )}
              </article>
            )}

            {/* 5. Synthesis for Executive Action */}
            <article className="pb-1">
              <h3 className="text-sm font-bold text-black mb-1 font-cm">
                5. Synthesis for Executive Action & BPO Operational Mandate
              </h3>
              <p className="text-gray-800 leading-relaxed text-justify font-medium">
                {briefing.ignitionSection ||
                  `Execute prioritized cash position sweeps, enforce dual-signoff on SWIFT cross-border wires, and resolve unmatched ERP variance items prior to cutoff windows. Maintain stringent tax compliance and audit trails across all operational subledgers.`}
              </p>
            </article>
          </div>
        </section>
      )}

      {/* =========================================================================
          PART II: FINANCIAL BPO TASK MATRIX (If Selected)
          ========================================================================= */}
      {options.includeTaskMatrix && (
        <section className={`mb-8 ${options.includeBriefing ? 'a4-page-break' : ''}`}>
          <div className="border-b border-black pb-1.5 mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black font-cm">
                Part II: Financial BPO Task Matrix & Operational Ledger
              </h2>
              <p className="text-xs text-gray-600 italic">
                Reconciliation, audit compliance, scheduled future entries, and time-sensitive settlements
              </p>
            </div>

            {/* Summary statistics */}
            <div className="flex items-center gap-3 text-xs font-mono-data bg-gray-100 px-3 py-1 border border-gray-400">
              <span>Total: <strong>{filteredTasks.length}</strong></span>
              <span>•</span>
              <span>Closed: <strong>{completedCount}</strong></span>
              <span>•</span>
              <span>Open: <strong>{pendingCount}</strong></span>
              <span>•</span>
              <span className="text-red-900 font-bold">Urgent: {highPriorityCount}</span>
            </div>
          </div>

          {/* Clean Academic Table */}
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic border border-gray-300">
              No task items match the selected print filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-black text-xs font-cm">
                <thead>
                  <tr className="bg-gray-100 border-b border-black text-[10.5px] uppercase font-sans-ui font-bold">
                    <th className="border-r border-black p-1.5 text-center w-12">Status</th>
                    <th className="border-r border-black p-1.5 w-32">Category</th>
                    <th className="border-r border-black p-1.5 w-36">Entity / Account</th>
                    <th className="border-r border-black p-1.5">Operational Workflow & Investigation Scope</th>
                    <th className="border-r border-black p-1.5 text-center w-16">Priority</th>
                    <th className="p-1.5 text-center w-20">Cutoff</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={t.id}
                        className={`border-b border-gray-300 a4-avoid-break ${
                          isEven ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {/* Status Checkbox */}
                        <td className="border-r border-gray-300 p-1.5 text-center font-mono-data font-bold">
                          {t.completed ? (
                            <span className="text-black font-bold">[✓] DONE</span>
                          ) : (
                            <span className="text-gray-500 font-bold">[ ] OPEN</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="border-r border-gray-300 p-1.5 font-medium text-black">
                          {getCategoryLabel(t.category)}
                        </td>

                        {/* Entity or Account */}
                        <td className="border-r border-gray-300 p-1.5 font-mono-data text-gray-700">
                          {t.entityOrAccount || 'General Corporate'}
                        </td>

                        {/* Task Title & Description */}
                        <td className="border-r border-gray-300 p-1.5">
                          <div
                            className={`font-semibold text-black ${
                              t.completed ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                              {t.description}
                            </div>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="border-r border-gray-300 p-1.5 text-center font-sans-ui text-[10px] font-bold uppercase">
                          {t.priority === 'high' ? (
                            <span className="text-black font-extrabold underline">HIGH</span>
                          ) : t.priority === 'medium' ? (
                            <span className="text-gray-700">MED</span>
                          ) : (
                            <span className="text-gray-500">NORM</span>
                          )}
                        </td>

                        {/* Cutoff Time */}
                        <td className="p-1.5 text-center font-mono-data text-gray-700 text-[11px]">
                          {t.dueTime || 'EOD'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          PART III: SECOND-ORDER SYSTEMIC DYNAMICS (If Selected)
          ========================================================================= */}
      {options.includeSecondOrder && (
        <section className="mb-8 a4-avoid-break">
          <div className="border-b border-black pb-1.5 mb-3 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black font-cm">
              Part III: Second-Order Systemic Dynamics & Transmission
            </h2>
            <span className="text-[10px] uppercase font-sans-ui text-gray-600 font-semibold">
              3-Tier Causality Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-black p-3 bg-gray-50/50">
            {SECOND_ORDER_CAUSALITY_PRESETS.slice(0, 1).map(item => (
              <React.Fragment key={item.id}>
                {/* Tier 1 */}
                <div className="border border-gray-300 p-2.5 bg-white">
                  <div className="text-[9.5px] uppercase font-sans-ui font-bold text-gray-600 mb-1">
                    Tier 1: Primary Trigger
                  </div>
                  <div className="font-bold text-xs text-black">{item.tier1Trigger.headline}</div>
                  <div className="font-mono-data text-[11px] text-red-900 mt-0.5">{item.tier1Trigger.metric}</div>
                  <p className="text-[11px] text-gray-700 mt-1 leading-snug">{item.tier1Trigger.mechanism}</p>
                </div>

                {/* Tier 2 */}
                <div className="border border-gray-300 p-2.5 bg-white">
                  <div className="text-[9.5px] uppercase font-sans-ui font-bold text-gray-600 mb-1">
                    Tier 2: Systemic Transmission
                  </div>
                  <div className="font-bold text-xs text-black">{item.tier2Transmission.headline}</div>
                  <div className="font-mono-data text-[11px] text-amber-900 mt-0.5">{item.tier2Transmission.channel}</div>
                  <p className="text-[11px] text-gray-700 mt-1 leading-snug">{item.tier2Transmission.friction}</p>
                </div>

                {/* Tier 3 */}
                <div className="border border-gray-300 p-2.5 bg-white">
                  <div className="text-[9.5px] uppercase font-sans-ui font-bold text-gray-600 mb-1">
                    Tier 3: Tactical BPO Implication
                  </div>
                  <div className="font-bold text-xs text-black">{item.tier3BpoImplication.headline}</div>
                  <div className="font-mono-data text-[11px] text-emerald-900 mt-0.5">{item.tier3BpoImplication.kpiImpact}</div>
                  <p className="text-[11px] text-gray-700 mt-1 leading-snug font-medium">
                    {item.tier3BpoImplication.operationalAction}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          PART IV: AUDIT CERTIFICATION & CONTROLLER SIGN-OFF (If Selected)
          ========================================================================= */}
      {options.includeAuditSignoff && (
        <section className="mb-6 a4-avoid-break">
          <div className="border border-black p-4 bg-gray-50/70">
            <div className="text-[10px] font-sans-ui uppercase tracking-wider font-bold text-black border-b border-gray-400 pb-1 mb-2">
              Official Audit Certification & Internal Controls Statement
            </div>
            <p className="text-xs text-gray-800 leading-relaxed text-justify mb-4">
              I hereby certify that this Financial BPO Dossier has been prepared in conformity with verified
              banking records, ERP transaction registers, and internal financial controls standards. Unmatched
              variance items have been flagged for resolution, and scheduled settlements are released subject to
              dual-authorization mandate.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-3 border-t border-gray-300 text-xs">
              <div>
                <div className="border-b border-black pb-1 mb-1 font-mono-data text-center text-gray-400 text-[11px]">
                  [Digital Signature Validated]
                </div>
                <div className="font-bold text-black font-cm">{options.analystName || 'Financial BPO Analyst'}</div>
                <div className="text-[11px] text-gray-600 font-sans-ui">
                  {options.department || 'Treasury Operations & Accounting Controls'}
                </div>
              </div>

              <div>
                <div className="border-b border-black pb-1 mb-1 font-mono-data text-center text-gray-400 text-[11px]">
                  [Controller / Sign-off Mandate]
                </div>
                <div className="font-bold text-black font-cm">Corporate Controller / Treasury Director</div>
                <div className="text-[11px] text-gray-600 font-sans-ui">
                  Verified Date: {dataInput.date} • Belo Horizonte Desk
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          A4 RUNNING FOOTER
          ========================================================================= */}
      <footer className="border-t border-black pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 font-mono-data">
        <span>SYSTEMIC SYNTHESIS • STANDARD A4 ARCHIVAL DOSSIER • CMU SERIF</span>
        <span>STATION: BELO HORIZONTE, MG • {dossierRef}</span>
      </footer>
    </div>
  );
};
