import React, { useState } from 'react';
import { PHILOSOPHICAL_TRADITIONS } from '../utils/curation.ts';
import type { PhilosophicalTradition } from '../types/index.ts';
import {
  BookOpen,
  X,
  Search,
  Quote,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface PhilosophicalIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTradition?: (traditionId: string) => void;
}

export const PhilosophicalIndexModal: React.FC<PhilosophicalIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectTradition,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTradition, setSelectedTradition] = useState<PhilosophicalTradition>(
    PHILOSOPHICAL_TRADITIONS[0]
  );

  if (!isOpen) return null;

  const filtered = PHILOSOPHICAL_TRADITIONS.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.school.toLowerCase().includes(term) ||
      t.keyFigures.some(f => f.toLowerCase().includes(term)) ||
      t.coreConcepts.some(c => c.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1d21]/60 flex items-center justify-center p-4 backdrop-blur-none">
      <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden text-[#1c1d21]">
        {/* Header */}
        <div className="bg-[#f6f2e9] border-b border-[#ded8cb] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#8c3b2d]" />
            <div>
              <h2 className="font-cm text-lg font-bold text-[#1c1d21]">
                Philosophical & Strategic Index
              </h2>
              <p className="font-cm text-xs text-[#6e675b] italic">
                Scholasticism, Salamanca School, Wolfgang Smith, Olavo de Carvalho & Classical Realism
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6e675b] hover:text-[#1c1d21] hover:bg-[#eae3d4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 bg-[#faf8f4] border-b border-[#e5dfd2]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8a8376] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by philosopher or tradition (e.g. Thomas Aquinas, Salamanca, Wolfgang Smith, Olavo)..."
              className="w-full bg-[#fdfcf9] border border-[#d8d2c4] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#1c1d21] focus:outline-none focus:border-[#8c3b2d]"
            />
          </div>
        </div>

        {/* Two-Pane Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left List */}
          <div className="md:col-span-5 border-r border-[#e5dfd2] overflow-y-auto p-4 space-y-2 bg-[#fbf9f4]">
            {filtered.map(trad => {
              const isSelected = selectedTradition.id === trad.id;
              return (
                <div
                  key={trad.id}
                  onClick={() => setSelectedTradition(trad)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-[#f4efe2] border-[#8c3b2d] shadow-xs'
                      : 'bg-[#fdfcf9] border-[#e2dcce] hover:bg-[#f6f2e8]'
                  }`}
                >
                  <div className="text-[9px] font-sans-ui uppercase tracking-wider text-[#8c3b2d] font-bold mb-0.5">
                    {trad.period}
                  </div>
                  <h4 className="font-cm font-bold text-xs text-[#1c1d21] leading-snug mb-1">
                    {trad.name}
                  </h4>
                  <div className="text-[11px] font-cm text-[#635c4e] truncate italic">
                    {trad.keyFigures.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Detail */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-[#fcfbf9]">
            <div>
              <span className="text-[10px] font-sans-ui uppercase tracking-wider text-[#8c3b2d] bg-[#f5ede0] border border-[#e5d5be] px-2 py-0.5 rounded font-semibold">
                {selectedTradition.school}
              </span>
              <h3 className="font-cm text-xl font-bold text-[#1c1d21] mt-2">
                {selectedTradition.name}
              </h3>
              <p className="font-cm text-xs text-[#6e675b] italic mt-0.5">
                Key Thinkers: <span className="font-bold text-[#1c1d21]">{selectedTradition.keyFigures.join(', ')}</span>
              </p>
            </div>

            {/* Strategic Relevance */}
            <div className="bg-[#f7f3e9] border border-[#ded5c2] rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-xs font-sans-ui font-semibold text-[#8c3b2d] mb-1">
                <Shield className="w-4 h-4 text-[#8c3b2d]" />
                <span>Strategic Relevance to Markets & Power Dynamics:</span>
              </div>
              <p className="font-cm text-xs text-[#2b2720] leading-relaxed">
                {selectedTradition.strategicRelevance}
              </p>
            </div>

            {/* Core Concepts */}
            <div>
              <h4 className="text-xs font-sans-ui font-bold text-[#5c5549] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8c3b2d]" />
                <span>Core Concepts & Principles:</span>
              </h4>
              <ul className="space-y-1.5 text-xs">
                {selectedTradition.coreConcepts.map((concept, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#faf7f0] p-2 rounded border border-[#e8e2d5]">
                    <ChevronRight className="w-3.5 h-3.5 text-[#8c3b2d] flex-shrink-0 mt-0.5" />
                    <span className="font-cm text-[#24211b]">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quotes */}
            <div>
              <h4 className="text-xs font-sans-ui font-bold text-[#5c5549] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#8c3b2d]" />
                <span>Authoritative Quotes:</span>
              </h4>
              <div className="space-y-2">
                {selectedTradition.sampleQuotes.map((q, idx) => (
                  <div key={idx} className="bg-[#fcfaf5] border-l-2 border-[#8c3b2d] p-3 rounded-r border-y border-r border-[#e8e2d5] text-xs">
                    <p className="font-cm text-[#1c1d21] italic leading-relaxed">"{q.text}"</p>
                    <span className="block text-right text-[11px] font-cm font-bold text-[#8c3b2d] mt-1">
                      — {q.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {onSelectTradition && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTradition(selectedTradition.id);
                    onClose();
                  }}
                  className="w-full py-2 px-4 bg-[#8c3b2d] hover:bg-[#783226] text-white font-sans-ui font-semibold rounded-lg text-xs transition-colors"
                >
                  Apply This Framework to Active Briefing Focus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
