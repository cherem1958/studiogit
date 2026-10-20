import React, { useState } from 'react';
import { STRATEGIC_NODES } from '../utils/curation.ts';
import type { StrategicNode } from '../types/index.ts';
import {
  Anchor,
  Globe,
  MapPin,
  Shield,
  Layers,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

interface StrategicChokepointsMapProps {
  onSelectNode?: (node: StrategicNode) => void;
  selectedNodeId?: string;
}

// Map geographic coordinates to SVG 2D equirectangular viewport (1000x500)
function geoToSvg(lat: number, lon: number): { x: number; y: number } {
  // SVG coordinates: x: 0 to 1000, y: 0 to 500
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

export const StrategicChokepointsMap: React.FC<StrategicChokepointsMapProps> = ({
  onSelectNode,
  selectedNodeId,
}) => {
  const [activeNode, setActiveNode] = useState<StrategicNode>(() => {
    return STRATEGIC_NODES.find(n => n.id === (selectedNodeId || 'bh-latam')) || STRATEGIC_NODES[0];
  });

  const handleNodeClick = (node: StrategicNode) => {
    setActiveNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const bhCoord = geoToSvg(-19.9208, -43.9378);

  return (
    <div className="bg-[#fcfbf9] border border-[#d8d3c7] rounded-xl p-5 shadow-sm text-[#1c1d21]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#e5e0d5] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-[#8c3b2d]" />
          <h3 className="font-cm text-base font-bold text-[#1c1d21]">
            Global Maritime Chokepoints & Strategic Flow Map
          </h3>
        </div>
        <span className="text-[11px] font-sans-ui text-[#736c5f]">
          Flat Vector Cartography • Select any node to inspect trade vulnerability
        </span>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[2/1] bg-[#f4efe4] border border-[#ded8cb] rounded-lg overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Latitude & Longitude Coordinate Lines */}
          <g stroke="#e2dcd0" strokeWidth="0.8" strokeDasharray="3 3">
            <line x1="0" y1="125" x2="1000" y2="125" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="375" x2="1000" y2="375" />
            <line x1="250" y1="0" x2="250" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" />
          </g>

          {/* Equator & Prime Meridian Axis */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#d5cebe" strokeWidth="1.2" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#d5cebe" strokeWidth="1.2" />

          {/* Stylized Flat Continental Landmass Silhouettes */}
          <g fill="#e7e0d2" stroke="#d2c9b8" strokeWidth="1">
            {/* North America */}
            <path d="M 120 70 L 260 60 L 320 90 L 300 160 L 250 200 L 220 250 L 190 230 L 170 170 L 130 140 Z" />
            {/* Central America & Caribbean */}
            <path d="M 220 250 L 250 280 L 235 295 L 210 260 Z" />
            {/* South America (Centered on Belo Horizonte) */}
            <path d="M 270 290 L 360 300 L 400 370 L 380 430 L 320 480 L 290 440 L 270 360 Z" />
            {/* Europe */}
            <path d="M 460 90 L 580 80 L 600 140 L 550 170 L 480 180 L 460 140 Z" />
            {/* Africa */}
            <path d="M 470 190 L 600 180 L 630 260 L 600 380 L 530 420 L 480 340 L 460 250 Z" />
            {/* Eurasia / Northern Asia */}
            <path d="M 600 80 L 890 70 L 920 160 L 820 180 L 720 190 L 620 150 Z" />
            {/* South & East Asia */}
            <path d="M 680 190 L 820 180 L 860 240 L 800 310 L 730 290 L 680 230 Z" />
            {/* Southeast Asia Archipelago & Australia */}
            <path d="M 760 310 L 840 330 L 810 360 L 770 330 Z" />
            <path d="M 780 370 L 890 360 L 910 430 L 850 460 L 780 420 Z" />
          </g>

          {/* Trade Connection Flow Arcs from Belo Horizonte to Key Global Chokepoints */}
          <g fill="none" stroke="#b45309" strokeWidth="1.6" strokeDasharray="4 3" opacity="0.65">
            {STRATEGIC_NODES.filter(n => n.id !== 'bh-latam').map(node => {
              const target = geoToSvg(node.lat, node.lon);
              const midX = (bhCoord.x + target.x) / 2;
              const midY = Math.min(bhCoord.y, target.y) - 35;
              return (
                <path
                  key={`arc-${node.id}`}
                  d={`M ${bhCoord.x} ${bhCoord.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                />
              );
            })}
          </g>

          {/* Strategic Nodes Vector Markers */}
          {STRATEGIC_NODES.map(node => {
            const { x, y } = geoToSvg(node.lat, node.lon);
            const isSelected = activeNode.id === node.id;
            const isOrigin = node.id === 'bh-latam';

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer group"
              >
                {/* Outer Ring Pulse for active node */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isOrigin ? 12 : 9}
                    fill="none"
                    stroke={isOrigin ? '#b45309' : '#8c3b2d'}
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Marker Core */}
                <circle
                  cx={x}
                  cy={y}
                  r={isOrigin ? 6.5 : 4.5}
                  fill={isOrigin ? '#b45309' : isSelected ? '#8c3b2d' : '#2b4c7e'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Label text */}
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="font-sans-ui text-[10px] font-bold fill-[#1c1d21] pointer-events-none drop-shadow-sm"
                >
                  {node.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Bottom Card Overlay */}
        <div className="absolute bottom-2 left-2 right-2 bg-[#fcfbf9]/95 border border-[#d8d3c7] rounded-lg p-3 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-none">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#8c3b2d] flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cm font-bold text-sm text-[#1c1d21]">{activeNode.name}</span>
                <span className="text-[10px] font-sans-ui uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#ece6d8] text-[#5e574a]">
                  {activeNode.region}
                </span>
              </div>
              <p className="font-cm text-xs text-[#524b3f] leading-snug mt-0.5 max-w-2xl italic">
                {activeNode.impactDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
            {STRATEGIC_NODES.slice(0, 4).map(node => (
              <button
                key={node.id}
                type="button"
                onClick={() => handleNodeClick(node)}
                className={`px-2 py-0.5 rounded text-[10px] font-sans-ui font-medium border transition-colors ${
                  activeNode.id === node.id
                    ? 'bg-[#8c3b2d] text-white border-[#8c3b2d]'
                    : 'bg-[#f4efe4] text-[#4f483d] border-[#d8d2c4] hover:bg-[#eae3d4]'
                }`}
              >
                {node.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
