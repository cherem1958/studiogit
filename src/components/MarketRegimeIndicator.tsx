import React from 'react';
import type { MarketIndicator } from '../types/index.ts';
import { evaluateMarketRegime } from '../utils/curation.ts';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Compass,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface MarketRegimeIndicatorProps {
  indicators: MarketIndicator[];
}

export const MarketRegimeIndicator: React.FC<MarketRegimeIndicatorProps> = ({
  indicators,
}) => {
  const regimeState = evaluateMarketRegime(indicators);

  const isRiskOff = regimeState.regime === 'Risk-Off';
  const isRiskOn = regimeState.regime === 'Risk-On';

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-4 shadow-sm text-[#1c1d21]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Market Regime Status Badge & Score */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isRiskOff
                ? 'bg-[#8c3b2d] text-white'
                : isRiskOn
                ? 'bg-[#2c5e3b] text-white'
                : 'bg-[#5e584c] text-white'
            }`}
          >
            {isRiskOff ? (
              <ShieldAlert className="w-5 h-5" />
            ) : isRiskOn ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <ArrowRightLeft className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cm text-xs font-bold text-[#5e584c] uppercase tracking-wider">
                Market Regime
              </span>
              <span
                className={`text-[10px] font-sans-ui uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                  isRiskOff
                    ? 'bg-[#fdedeb] text-[#8c3b2d] border-[#f5c6c0]'
                    : isRiskOn
                    ? 'bg-[#eaf4ec] text-[#2c5e3b] border-[#cbe5cf]'
                    : 'bg-[#f4efe4] text-[#5e584c] border-[#ddd5c3]'
                }`}
              >
                {regimeState.regime}
              </span>
            </div>
            <h4 className="font-cm text-sm font-bold text-[#1c1d21]">
              {isRiskOff
                ? 'Defensive Liquidity & Capital Preservation'
                : isRiskOn
                ? 'Growth & Expansionary Capital Deployment'
                : 'Neutral Consolidation & Transition Phase'}
            </h4>
          </div>
        </div>

        {/* Center: Divergence Indicator */}
        <div className="lg:max-w-md bg-[#faf7f0] border border-[#ded6c5] rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-sans-ui font-semibold text-[#8c3b2d] text-[11px] mb-0.5">
            <ArrowRightLeft className="w-3 h-3" />
            <span>Macro Divergence Vector:</span>
          </div>
          <p className="font-cm text-xs text-[#423d33] leading-snug">
            {regimeState.divergenceNote}
          </p>
        </div>

        {/* Right: Operational BPO Directive */}
        <div className="text-right lg:border-l lg:border-[#e2dac9] lg:pl-4 flex-shrink-0">
          <span className="text-[10px] font-sans-ui uppercase tracking-wider text-[#736c5f] font-semibold block">
            BPO Treasury Directive
          </span>
          <span className="font-mono-data text-xs font-bold text-[#1c1d21]">
            {isRiskOff ? 'Accelerate DSO (< 34d) • Sweep CDI' : 'Negotiate Vendor Early Cash Discounts'}
          </span>
        </div>
      </div>

      {/* Primary Transmission Drivers Strip */}
      <div className="mt-3 pt-2.5 border-t border-[#ece7dc] flex flex-wrap items-center justify-between text-[11px] font-sans-ui text-[#696254] gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-[#1c1d21]">Primary Drivers:</span>
          {regimeState.primaryDrivers.map((driver, idx) => (
            <span
              key={idx}
              className="bg-[#f2ebd9] text-[#5c5445] px-2 py-0.5 rounded border border-[#e5d8be] text-[10px] font-mono-data"
            >
              {driver}
            </span>
          ))}
        </div>

        <div className="italic text-[#787163] text-[11px] font-cm">
          {regimeState.bpoHedgingGuidance}
        </div>
      </div>
    </div>
  );
};
