import React from 'react';
import type { InternationalNewsItem } from '../types/index.ts';
import {
  Globe,
  Flame,
  Coins,
  Cpu,
  Ship,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface InternationalEventsFeedProps {
  newsList: InternationalNewsItem[];
}

export const InternationalEventsFeed: React.FC<InternationalEventsFeedProps> = ({
  newsList,
}) => {
  const getCategoryIcon = (category: InternationalNewsItem['category']) => {
    switch (category) {
      case 'energy':
        return <Flame className="w-3.5 h-3.5 text-amber-700" />;
      case 'currency':
        return <Coins className="w-3.5 h-3.5 text-emerald-800" />;
      case 'technology':
        return <Cpu className="w-3.5 h-3.5 text-indigo-700" />;
      case 'trade':
        return <Ship className="w-3.5 h-3.5 text-sky-800" />;
      case 'geopolitics':
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-[#8c3b2d]" />;
    }
  };

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      <div className="flex items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#8c3b2d]" />
          <h3 className="font-cm text-base font-bold text-[#1c1d21]">
            Key Global Events & International Radar
          </h3>
        </div>
        <span className="text-[11px] font-sans-ui text-[#736c5f]">
          Systemic Impact Briefings • Display-Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {newsList.map(item => (
          <div
            key={item.id}
            className="bg-[#faf8f3] border border-[#e4ded2] rounded-lg p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-sans-ui uppercase tracking-wider font-semibold text-[#666055]">
                    {item.region} • {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-sans-ui text-[#8a8376]">Monitored Vector</span>
              </div>

              <h4 className="font-cm font-bold text-sm text-[#1c1d21] leading-snug mb-1.5">
                {item.title}
              </h4>
              <p className="font-cm text-xs text-[#4d463a] leading-relaxed mb-3">
                {item.summary}
              </p>
            </div>

            <div className="pt-2.5 border-t border-[#e8e2d5] bg-[#f5f0e4] -mx-4 -mb-4 p-3 rounded-b-lg">
              <div className="text-[9px] font-sans-ui uppercase tracking-wider text-[#8c3b2d] font-bold mb-0.5">
                Systemic Mechanics & Strategic Impact:
              </div>
              <p className="font-cm text-xs text-[#3b352b] italic leading-relaxed">
                "{item.systemicImpact}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
