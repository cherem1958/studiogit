import React from 'react';
import type { MarketIndicator } from '../types/index.ts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Layers,
} from 'lucide-react';

interface MarketIndicatorsGridProps {
  indicators: MarketIndicator[];
}

export const MarketIndicatorsGrid: React.FC<MarketIndicatorsGridProps> = ({
  indicators,
}) => {
  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#8c3b2d]" />
          <h3 className="font-cm text-base font-bold text-[#1c1d21]">
            Global Macroeconomic & Asset Indicators
          </h3>
        </div>
        <span className="text-[11px] font-mono-data text-[#736c5f]">
          {indicators.length} benchmarks tracked • Display-Only
        </span>
      </div>

      {/* Grid of Display-Only Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {indicators.map(ind => {
          const isUp = ind.change.startsWith('+');
          const isDown = ind.change.startsWith('-');

          return (
            <div
              key={ind.id}
              className={`p-3 rounded-lg border transition-all ${
                ind.highlight
                  ? 'bg-[#f7f3e8] border-[#c8beaa]'
                  : 'bg-[#faf8f3] border-[#e6e1d5]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-cm text-xs font-semibold text-[#1c1d21] truncate" title={ind.name}>
                  {ind.name}
                </span>
                <span className="text-[9px] font-sans-ui uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ece6d8] text-[#5e574a] font-medium">
                  {ind.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="font-mono-data text-sm font-bold text-[#1c1d21]">
                  {ind.value}
                </span>

                <div className="flex items-center gap-1 font-mono-data text-xs font-semibold">
                  {isUp ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-emerald-700">{ind.change}</span>
                    </>
                  ) : isDown ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-800" />
                      <span className="text-rose-800">{ind.change}</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-600">{ind.change}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#e8e3d8] flex items-center justify-between text-[11px] font-sans-ui text-[#7a7366]">
        <span>Standard valuation baseline: Spot closing & Treasury curve benchmark</span>
        <span className="italic">Read-only systemic telemetry</span>
      </div>
    </div>
  );
};
