import * as React from 'react';
import { useState } from 'react';
import { IntegrationItem } from '../types';

interface IntegrationsGridProps {
  items: IntegrationItem[];
  onConnect?: (id: string) => void;
}

export const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({ items, onConnect }) => {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<IntegrationItem | null>(null);

  const handleConnect = (item: IntegrationItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks if any
    
    // For external tools, we just open the link
    if (item.url) {
        window.open(item.url, '_blank');
    }
    
    // Toggle visual state
    setConnectedIds(prev => {
        const next = new Set(prev);
        const isConnecting = !next.has(item.id);
        
        if (isConnecting) {
            next.add(item.id);
            // Notify parent
            if (onConnect) onConnect(item.id);
        } else {
            next.delete(item.id);
        }
        return next;
    });
  };

  return (
    <div className="w-full mt-4 font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-indigo-600 p-1 relative shadow-[4px_4px_0_0_rgba(79,70,229,0.4)]">
        
        {/* Header */}
        <div className="bg-indigo-600 text-white p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
                <span className="text-lg animate-spin-slow">⚙️</span>
                <span className="text-[10px] md:text-xs tracking-widest font-bold">MODULES MARKET</span>
            </div>
            <span className="text-[8px] bg-black px-2 py-0.5 border border-white/50">FREE TIER</span>
        </div>

        {/* Compact Grid */}
        <div className="p-1 grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
            {items.map((item) => {
                const isConnected = connectedIds.has(item.id);
                const isHovered = hoveredItem?.id === item.id;
                
                return (
                    <div 
                        key={item.id} 
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={(e) => handleConnect(item, e)}
                        className={`
                            cursor-pointer relative p-2 md:p-3 border-2 transition-all group flex flex-col items-center justify-center gap-1
                            ${isConnected 
                                ? 'bg-indigo-900/40 border-green-500 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]' 
                                : 'bg-gray-900/40 border-indigo-900/60 hover:border-indigo-400 hover:bg-gray-800'
                            }
                        `}
                    >
                        {/* Status Light */}
                        <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-gray-700'}`}></div>

                        {/* Icon */}
                        <span className={`text-xl md:text-2xl transition-all ${isConnected ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}>
                            {item.icon}
                        </span>
                        
                        {/* Name */}
                        <span className={`text-[9px] font-bold tracking-wider text-center ${isConnected ? 'text-green-400' : 'text-indigo-300 group-hover:text-white'}`}>
                            {item.name}
                        </span>

                        {/* Action Text (Only on hover) */}
                        <span className="text-[8px] uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                            {isConnected ? 'ACTIVE' : 'CONNECT'}
                        </span>
                    </div>
                );
            })}
        </div>
        
        {/* Info Deck (Fixed Height Description Area) */}
        <div className="bg-indigo-950/50 border-t-2 border-indigo-900/50 p-2 md:p-3 h-16 md:h-20 flex flex-col justify-center relative overflow-hidden">
            {/* Scanline overlay for deck */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_1px,#000_1px)] bg-[size:100%_2px]"></div>
            
            {hoveredItem ? (
                <div className="animate-fade-in relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-indigo-300 font-bold">{hoveredItem.name}</span>
                        <span className="text-[8px] text-indigo-500 font-mono">{hoveredItem.type === 'api' ? 'REST API' : 'EXTERNAL LINK'}</span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-indigo-100 font-mono leading-tight">
                        {hoveredItem.desc}
                    </p>
                </div>
            ) : (
                <div className="text-center text-[9px] text-indigo-500/50 font-mono animate-pulse relative z-10">
                    HOVER OVER A MODULE TO INSPECT SPECS...
                </div>
            )}
        </div>

      </div>
    </div>
  );
};