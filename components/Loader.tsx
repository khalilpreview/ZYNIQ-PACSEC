import * as React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';

// Helper component for the 'C' replacement (Pacman Icon)
const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.05em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

interface LoaderProps {
  onComplete: () => void;
  buttonText?: string;
}

const BOOT_LOGS = [
    "INITIALIZING KERNEL 4.0...",
    "MOUNTING VIRTUAL DRIVES...",
    "BYPASSING SECURITY LAYER 1...",
    "OPTIMIZING ENTROPY POOL...",
    "ALLOCATING MEMORY BLOCKS...",
    "LOADING CRYPTO MODULES...",
    "CHECKING INTEGRITY...",
    "ESTABLISHING SECURE UPLINK...",
    "DECRYPTING PAYLOAD...",
    "HANDSHAKE COMPLETE.",
    "VALIDATING CERTIFICATES...",
    "SPAWNING WORKER THREADS...",
    "SYSTEM READY."
];

// Ghost SVG icons for visual flair (matching design system)
const GhostIcon = ({ color, className }: { color: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${className}`} fill={color}>
    <path d="M12 2C8.14 2 5 5.14 5 9v10c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1V9c0-3.86-3.14-7-7-7zm-2 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

const GHOST_COLORS = ['#FF6B6B', '#F2C94C', '#4ECDC4', '#A8E6CF', '#7B68EE'];

export const Loader: React.FC<LoaderProps> = ({ onComplete, buttonText = 'START' }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'LOADING' | 'COMPLETE' | 'EXITING'>('LOADING');
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [dots, setDots] = useState<{ id: number; x: number; delay: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredComplete = useRef(false);

  // Generate floating dots for background
  useEffect(() => {
    const newDots = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setDots(newDots);
  }, []);

  const triggerExit = useCallback(() => {
    if (hasTriggeredComplete.current) return;
    hasTriggeredComplete.current = true;
    setPhase('EXITING');
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 1.5 : 0.5;
        return Math.min(prev + increment, 100);
      });
    }, 40);

    const logInterval = setInterval(() => {
        if (Math.random() > 0.5) {
            const randomLog = BOOT_LOGS[Math.floor(Math.random() * BOOT_LOGS.length)];
            const hex = `0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0')}`;
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            setVisibleLogs(prev => [...prev.slice(-20), `[${timestamp}][${hex}] ${randomLog}`]);
        }
    }, 80);

    return () => {
        clearInterval(interval);
        clearInterval(logInterval);
    };
  }, []);

  // Set phase to COMPLETE when loading finishes (wait for button click)
  useEffect(() => {
    if (progress >= 100 && phase === 'LOADING') {
      setPhase('COMPLETE');
    }
  }, [progress, phase]);

  const handleButtonClick = () => {
    if (hasTriggeredComplete.current) return;
    hasTriggeredComplete.current = true;
    setPhase('EXITING');
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 h-[100dvh] w-screen z-[99999] flex flex-col items-center justify-center font-arcade text-pac-yellow relative overflow-hidden bg-black selection:bg-pac-yellow selection:text-black transition-all duration-700 ${phase === 'EXITING' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
    >
      <style>{`
          @keyframes chompTop {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-35deg); }
          }
          @keyframes chompBottom {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(35deg); }
          }
          @keyframes scanline {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
          }
          @keyframes glitch {
            0%, 100% { transform: translate(0); filter: hue-rotate(0deg); }
            10% { transform: translate(-2px, 1px); }
            20% { transform: translate(2px, -1px); filter: hue-rotate(90deg); }
            30% { transform: translate(-1px, 2px); }
            40% { transform: translate(1px, -2px); filter: hue-rotate(180deg); }
            50% { transform: translate(-2px, -1px); }
            60% { transform: translate(2px, 1px); filter: hue-rotate(270deg); }
            70% { transform: translate(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(242,201,76,0.3), inset 0 0 20px rgba(242,201,76,0.1); }
            50% { box-shadow: 0 0 40px rgba(242,201,76,0.6), inset 0 0 30px rgba(242,201,76,0.2); }
          }
          @keyframes text-flicker {
            0%, 100% { opacity: 1; }
            92% { opacity: 1; }
            93% { opacity: 0.3; }
            94% { opacity: 1; }
            96% { opacity: 0.5; }
            97% { opacity: 1; }
          }
          @keyframes dot-trail {
            0% { width: 0; }
            100% { width: 100%; }
          }
          .glitch-text {
            animation: glitch 0.3s ease-in-out infinite;
          }
          .flicker {
            animation: text-flicker 3s linear infinite;
          }
      `}</style>

      {/* Floating Dots Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-2 h-2 bg-pac-yellow/20 rounded-full"
            style={{
              left: `${dot.x}%`,
              animation: `float ${8 + dot.delay}s linear infinite`,
              animationDelay: `${dot.delay}s`
            }}
          />
        ))}
      </div>

      {/* Background Grid - Perspective */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ 
             backgroundImage: 'linear-gradient(#F2C94C 1px, transparent 1px), linear-gradient(90deg, #F2C94C 1px, transparent 1px)', 
             backgroundSize: '60px 60px',
             transform: 'perspective(500px) rotateX(60deg) scale(2.5)',
             transformOrigin: 'center top'
           }}>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-b from-transparent via-white to-transparent h-[10%] w-full animate-[scanline_3s_linear_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 pointer-events-none"></div>
      </div>

      {/* Noise Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-40"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}>
      </div>

      {/* Faint Boot Logs Background - Terminal Style */}
      <div className="absolute inset-0 p-4 md:p-8 font-mono text-[8px] md:text-[10px] text-green-500/30 overflow-hidden flex flex-col justify-end pointer-events-none z-0 select-none">
          {visibleLogs.map((log, i) => (
              <div key={i} className="whitespace-nowrap" style={{ opacity: 0.3 + (i / visibleLogs.length) * 0.7 }}>
                <span className="text-pac-ghostCyan/50">$</span> {log}
              </div>
          ))}
      </div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">
        
        {/* Animated Logo with Glow */}
        <div className="mb-12 md:mb-16 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-pac-blue via-pac-yellow to-pac-ghostRed blur-xl opacity-20 animate-pulse"></div>
            
            <div className="relative border-4 border-pac-yellow p-4 md:p-6 bg-black/90 animate-[pulse-glow_2s_ease-in-out_infinite]">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-pac-ghostCyan"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-pac-ghostCyan"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-pac-ghostCyan"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-pac-ghostCyan"></div>
                
                <h1 className={`text-4xl md:text-6xl font-arcade text-pac-yellow tracking-tighter flex items-center justify-center gap-[0.05em] drop-shadow-[0_0_20px_rgba(242,201,76,0.5)] flicker ${phase === 'COMPLETE' ? 'glitch-text' : ''}`}>
                    <span>PA</span>
                    <PacChar className="mx-[0.02em]" />
                    <span>SE</span>
                    <PacChar className="mx-[0.02em]" />
                </h1>
                
                <div className="text-center mt-2 text-[8px] md:text-[10px] text-pac-ghostCyan/70 font-mono tracking-[0.3em] uppercase">
                    Security Terminal
                </div>
                
                <div className="absolute -bottom-3 right-2 text-[8px] md:text-[10px] bg-black px-2 py-0.5 text-pac-ghostRed border border-pac-ghostRed uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-pac-ghostRed rounded-full animate-pulse"></span>
                    v1.0.4
                </div>
            </div>
        </div>

        {/* Loading Progress Section */}
        <div className="w-full max-w-md space-y-4">
            
            <div className="flex flex-col items-center justify-center gap-4 text-sm md:text-base font-mono mb-4">
                {phase === 'LOADING' && (
                    <span className="text-pac-ghostCyan animate-pulse">
                        INITIALIZING SECURE ENVIRONMENT
                        <span className="inline-block w-8 text-left">{'.'.repeat((Math.floor(Date.now() / 500) % 4))}</span>
                    </span>
                )}
                {phase === 'COMPLETE' && (
                    <>
                        <span className="text-green-400 flex items-center gap-2">
                            <span className="text-lg">✓</span> SYSTEM READY
                        </span>
                        <button
                            onClick={handleButtonClick}
                            className="mt-4 px-8 py-3 bg-pac-yellow text-black font-arcade text-lg tracking-widest hover:bg-white hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(242,201,76,0.5)] hover:shadow-[0_0_30px_rgba(242,201,76,0.8)] animate-pulse"
                        >
                            {buttonText}
                        </button>
                    </>
                )}
                {phase === 'EXITING' && (
                    <span className="text-pac-yellow animate-pulse">
                        LAUNCHING...
                    </span>
                )}
            </div>

            <div className="relative w-full h-10 bg-gray-900/80 border-2 border-gray-600 p-1.5 rounded-sm overflow-hidden">
                <div 
                    className="h-full relative transition-all duration-100 ease-out rounded-sm overflow-hidden"
                    style={{ 
                      width: `${progress}%`,
                      background: phase === 'COMPLETE' 
                        ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                        : 'linear-gradient(90deg, #F2C94C, #f59e0b, #F2C94C)'
                    }}
                >
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)',
                        animation: 'dot-trail 0.5s linear infinite'
                      }}
                    />
                    
                    {phase === 'LOADING' && (
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-7 z-20">
                          <div className="relative w-full h-full">
                              <div className="absolute top-0 left-0 w-full h-1/2 bg-pac-yellow rounded-t-full origin-bottom animate-[chompTop_0.15s_ease-in-out_infinite]"></div>
                              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-pac-yellow rounded-b-full origin-top animate-[chompBottom_0.15s_ease-in-out_infinite]"></div>
                          </div>
                      </div>
                    )}
                </div>

                {phase === 'LOADING' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-2 bg-white rounded-full animate-pulse"
                        style={{ 
                          opacity: progress > 100 - (i + 1) * 10 ? 0 : 0.8,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                )}
            </div>
            
            <div className="flex justify-between text-[10px] md:text-xs font-mono text-gray-500">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pac-yellow rounded-full animate-pulse"></span>
                    {phase === 'LOADING' ? 'LOADING MODULES' : phase === 'COMPLETE' ? 'ALL SYSTEMS GO' : 'TRANSITIONING'}
                </span>
                <span className="text-pac-yellow font-bold text-sm">{Math.floor(progress)}%</span>
            </div>

            <div className="flex justify-center gap-4 mt-6 opacity-60">
                {GHOST_COLORS.map((color, i) => (
                    <div 
                        key={i} 
                        className="animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                    >
                        <GhostIcon color={color} />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="absolute bottom-4 flex items-center justify-center">
          <a 
            href="https://zyniq.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-block font-arcade text-[8px] md:text-[9px] transition-all duration-300 ease-out brightness-50 hover:brightness-125 hover:scale-110"
          >
            <span className="text-pac-yellow font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(242,201,76,0.8)] transition-all">PACSEC BY </span>
            <span className="text-[#ea2323] font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(234,35,35,0.8)] transition-all">ZYNIQ</span>
          </a>
      </div>
    </div>
  );
};