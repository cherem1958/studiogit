import React, { useState } from 'react';
import type { SecondOrderCausality } from '../types/index.ts';
import { SECOND_ORDER_CAUSALITY_PRESETS } from '../utils/curation.ts';
import {
  GitMerge,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Briefcase,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export const SecondOrderDynamics: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(SECOND_ORDER_CAUSALITY_PRESETS[0].id);

  const activeCausality =
    SECOND_ORDER_CAUSALITY_PRESETS.find(c => c.id === selectedId) ||
    SECOND_ORDER_CAUSALITY_PRESETS[0];

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-[#8c3b2d]" />
          <div>
            <h3 className="font-cm text-base font-bold text-[#1c1d21]">
              Second-Order Dynamics
            </h3>
            <span className="text-[11px] font-sans-ui text-[#736c5f]">
              Systemic Impact Engine • 3-Tier Macro-to-Micro Transmission Model
            </span>
          </div>
        </div>

        {/* Transmission Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SECOND_ORDER_CAUSALITY_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedId(preset.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-sans-ui transition-all cursor-pointer font-medium ${
                selectedId === preset.id
                  ? 'bg-[#8c3b2d] text-white shadow-2xs font-semibold'
                  : 'bg-[#f4efe4] hover:bg-[#eae3d4] text-[#4f483d] border border-[#d8d2c4]'
              }`}
            >
              {preset.category === 'fx' && 'USD/FX Transmission'}
              {preset.category === 'rates' && 'DI Curve Transmission'}
              {preset.category === 'energy' && 'Freight/Energy Transmission'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Headline */}
      <div className="mb-4 bg-[#f8f5ee] border border-[#ded5c2] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#8c3b2d]" />
          <span className="font-cm font-bold text-xs text-[#1c1d21]">
            Active Chain: {activeCausality.triggerTitle}
          </span>
        </div>
        <span className="text-[10px] font-mono-data text-[#783e33] bg-[#f2ebd9] px-2 py-0.5 rounded border border-[#e5d8be] font-bold">
          3-Tier Causality Cascade
        </span>
      </div>

      {/* 3-Tier Causality Visual Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {/* Tier 1: Primary Trigger */}
        <div className="bg-[#faf8f3] border border-[#e2dccf] rounded-lg p-3.5 flex flex-col justify-between relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans-ui uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#ebd7c8] text-[#8c3b2d]">
                Tier 1 • Primary Trigger
              </span>
              <Zap className="w-3.5 h-3.5 text-[#8c3b2d]" />
            </div>

            <h4 className="font-cm font-bold text-xs text-[#1c1d21] mb-1.5 leading-snug">
              {activeCausality.tier1Trigger.headline.replace(/^Primary Trigger:\s*/, '')}
            </h4>

            <div className="font-mono-data text-[11px] text-[#735824] bg-[#f5ede0] px-2 py-1 rounded border border-[#e8dbc6] mb-2 font-medium">
              {activeCausality.tier1Trigger.metric}
            </div>

            <p className="font-cm text-xs text-[#524b3e] leading-relaxed">
              {activeCausality.tier1Trigger.mechanism}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-[#ece6d8] flex items-center justify-between text-[10px] font-sans-ui text-[#736c5f]">
            <span>Exogenous Shock</span>
            <span className="italic">Macro Origin</span>
          </div>
        </div>

        {/* Tier 2: Systemic Transmission */}
        <div className="bg-[#faf8f3] border border-[#e2dccf] rounded-lg p-3.5 flex flex-col justify-between relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans-ui uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#dbe5f2] text-[#2b4c7e]">
                Tier 2 • Systemic Transmission
              </span>
              <Layers className="w-3.5 h-3.5 text-[#2b4c7e]" />
            </div>

            <h4 className="font-cm font-bold text-xs text-[#1c1d21] mb-1.5 leading-snug">
              {activeCausality.tier2Transmission.headline.replace(/^Systemic Transmission:\s*/, '')}
            </h4>

            <p className="font-cm text-xs text-[#524b3e] leading-relaxed mb-2">
              {activeCausality.tier2Transmission.channel}
            </p>

            <div className="font-sans-ui text-[11px] text-[#2b4c7e] bg-[#eef3f9] px-2 py-1 rounded border border-[#d2dfef]">
              <span className="font-semibold">Structural Friction:</span> {activeCausality.tier2Transmission.friction}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#ece6d8] flex items-center justify-between text-[10px] font-sans-ui text-[#736c5f]">
            <span>Balance Sheet Drag</span>
            <span className="italic">Liquidity Channel</span>
          </div>
        </div>

        {/* Tier 3: Tactical BPO Implication */}
        <div className="bg-[#f7f4ec] border border-[#d9d0be] rounded-lg p-3.5 flex flex-col justify-between relative shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans-ui uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#d8e6da] text-[#2c5e3b]">
                Tier 3 • Tactical BPO Implication
              </span>
              <Briefcase className="w-3.5 h-3.5 text-[#2c5e3b]" />
            </div>

            <h4 className="font-cm font-bold text-xs text-[#1c1d21] mb-1.5 leading-snug">
              {activeCausality.tier3BpoImplication.headline.replace(/^Tactical BPO Implication:\s*/, '')}
            </h4>

            <p className="font-cm text-xs text-[#3d382e] leading-relaxed mb-2 font-medium">
              {activeCausality.tier3BpoImplication.operationalAction}
            </p>

            <div className="font-mono-data text-[10px] text-[#2c5e3b] bg-[#eaf2eb] px-2 py-1 rounded border border-[#cedece] font-semibold">
              {activeCausality.tier3BpoImplication.kpiImpact}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#ded5c3] flex items-center justify-between text-[10px] font-sans-ui text-[#736c5f]">
            <span>Financial Analyst Directive</span>
            <span className="italic">Execution Impact</span>
          </div>
        </div>
      </div>

      {/* Footer Systemic Synthesis Note */}
      <div className="mt-4 pt-2.5 border-t border-[#e8e3d8] flex flex-wrap items-center justify-between text-[11px] font-sans-ui text-[#7a7366] gap-2">
        <span>
          Causality verification: Direct mapping from macro telemetry to corporate ledger entries
        </span>
        <span className="font-mono-data text-[#8c3b2d]">
          DSO/DPO Sensitivity • Working Capital Shield
        </span>
      </div>
    </div>
  );
};
