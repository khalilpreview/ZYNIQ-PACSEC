import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { TrustBadges } from './TrustBadges';

// Shared Logo Component - Same as Loader
const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.05em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

// Ghost SVG Component
const GhostIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'}>
    <path d="M12 2C8.14 2 5 5.14 5 9v10c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55.45 1 1 1s1-.45 1-1V9c0-3.86-3.14-7-7-7zm-2 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

// Floating Ghost Component
const FloatingGhost = ({ color, delay, direction, top }: { color: string; delay: number; direction: 'left' | 'right'; top: string }) => (
  <div 
    className="absolute pointer-events-none z-20"
    style={{
      animation: `ghostMove${direction === 'right' ? 'Right' : 'Left'} ${14 + Math.random() * 6}s linear infinite`,
      animationDelay: `${delay}s`,
      top,
    }}
  >
    <div className="animate-[ghostWobble_0.6s_ease-in-out_infinite]">
      <GhostIcon className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_15px_currentColor] opacity-60" color={color} />
    </div>
  </div>
);

// Animated Pac-Man eating dots
const PacManRunner = ({ delay, top }: { delay: number; top: string }) => (
  <div 
    className="absolute pointer-events-none z-20 flex items-center"
    style={{
      animation: `pacRun 12s linear infinite`,
      animationDelay: `${delay}s`,
      top,
    }}
  >
    {/* Dots being eaten */}
    <div className="flex gap-4 mr-2">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="w-2 h-2 rounded-full bg-pac-yellow/50"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
    {/* Pac-Man */}
    <div className="relative w-10 h-10">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-pac-yellow rounded-t-full origin-bottom animate-[chompTop_0.12s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-pac-yellow rounded-b-full origin-top animate-[chompBottom_0.12s_ease-in-out_infinite]" />
    </div>
  </div>
);

// Cyber Grid Background with Perspective
const CyberGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div 
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(242,201,76,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(242,201,76,0.4) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        transform: 'perspective(400px) rotateX(55deg)',
        transformOrigin: 'center 130%',
      }}
    />
    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
  </div>
);

// Matrix-style falling characters
const MatrixRain = () => {
  const chars = '01アイウエオカキクケコ░▒▓█';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.025]">
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute text-pac-ghostCyan font-mono text-xs whitespace-pre"
          style={{
            left: `${i * 7}%`,
            animation: `matrixFall ${6 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        >
          {[...Array(25)].map((_, j) => (
            <div key={j}>{chars[Math.floor(Math.random() * chars.length)]}</div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Floating Dots Background
const FloatingDots = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className={`absolute rounded-full ${i % 3 === 0 ? 'w-3 h-3 bg-pac-yellow/15' : 'w-1.5 h-1.5 bg-pac-yellow/10'}`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, color, delay }: { icon: React.ReactNode; title: string; description: string; color: string; delay: number }) => (
  <div 
    className="group relative p-6 bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl hover:border-pac-yellow/40 transition-all duration-500 hover:transform hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(242,201,76,0.08)] animate-[fadeSlideUp_0.6s_ease-out_forwards] opacity-0"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} style={{ background: color }} />
    <div className="relative z-10">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="font-arcade text-sm text-pac-yellow mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
    {/* Hover corner accents */}
    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-transparent group-hover:border-pac-yellow/50 transition-all duration-300" />
    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-transparent group-hover:border-pac-yellow/50 transition-all duration-300" />
    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-transparent group-hover:border-pac-yellow/50 transition-all duration-300" />
    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-transparent group-hover:border-pac-yellow/50 transition-all duration-300" />
  </div>
);

interface LandingPageProps {
  onStart: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, theme, toggleTheme }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white overflow-x-hidden">
      
      {/* Master Keyframes */}
      <style>{`
        @keyframes chompTop {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-30deg); }
        }
        @keyframes chompBottom {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes pacRun {
          0% { left: -80px; }
          100% { left: 105%; }
        }
        @keyframes ghostMoveLeft {
          0% { right: -80px; }
          100% { right: 105%; }
        }
        @keyframes ghostMoveRight {
          0% { left: -80px; }
          100% { left: 105%; }
        }
        @keyframes ghostWobble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes matrixFall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(242,201,76,0.25), 0 0 80px rgba(242,201,76,0.08); }
          50% { box-shadow: 0 0 50px rgba(242,201,76,0.4), 0 0 100px rgba(242,201,76,0.15); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitch {
          0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(15% 0 60% 0); transform: translate(-2px); }
          40% { clip-path: inset(35% 0 40% 0); transform: translate(2px); }
          60% { clip-path: inset(55% 0 20% 0); transform: translate(-1px); }
          80% { clip-path: inset(75% 0 5% 0); transform: translate(1px); }
        }
        .glitch-hover:hover { animation: glitch 0.4s ease-in-out; }
        .text-glow { text-shadow: 0 0 30px rgba(242,201,76,0.5), 0 0 60px rgba(242,201,76,0.3); }
      `}</style>

      {/* Fixed Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <CyberGrid />
        <MatrixRain />
        <FloatingDots />
        
        {/* Animated Characters */}
        <PacManRunner delay={0} top="25%" />
        <PacManRunner delay={6} top="65%" />
        <FloatingGhost color="#FF6B6B" delay={2} direction="left" top="35%" />
        <FloatingGhost color="#4ECDC4" delay={5} direction="right" top="55%" />
        <FloatingGhost color="#7B68EE" delay={9} direction="left" top="75%" />
        <FloatingGhost color="#FFB86C" delay={12} direction="right" top="20%" />
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute w-full h-[2px] bg-white animate-[scanline_5s_linear_infinite]" />
        </div>
        
        {/* CRT Noise */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        
        {/* Corner Brackets */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-pac-yellow/20" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-pac-yellow/20" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-pac-yellow/20" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-pac-yellow/20" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 px-4 py-2 bg-black/60 backdrop-blur-sm border border-gray-800 rounded-full text-sm hover:border-pac-yellow/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(242,201,76,0.2)]"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* Dynamic Spotlight following mouse */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl transition-all duration-700 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(242,201,76,1) 0%, transparent 70%)',
            left: `calc(${mousePos.x}% - 250px)`,
            top: `calc(${mousePos.y}% - 250px)`,
          }}
        />

        {/* Main Logo Container */}
        <div className={`relative z-10 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Outer Glow */}
          <div className="absolute -inset-12 bg-gradient-to-r from-pac-blue/30 via-pac-yellow/30 to-pac-ghostRed/30 blur-3xl opacity-30 animate-pulse" />
          
          {/* Logo Box - Matching Loader Style */}
          <div className="relative border-4 border-pac-yellow p-8 md:p-12 bg-black/95 animate-[pulse-glow_3s_ease-in-out_infinite]">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-pac-ghostCyan" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-pac-ghostCyan" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-pac-ghostCyan" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-pac-ghostCyan" />
            
            {/* PACSEC Logo */}
            <h1 className="text-5xl md:text-8xl font-arcade text-pac-yellow tracking-tight flex items-center justify-center gap-[0.02em] text-glow">
              <span>PA</span>
              <PacChar className="mx-[0.01em]" />
              <span>SE</span>
              <PacChar className="mx-[0.01em]" />
            </h1>
            
            {/* Subtitle */}
            <div className="text-center mt-4 text-xs md:text-sm text-pac-ghostCyan/80 font-mono tracking-[0.3em] uppercase">
              Security Command Center
            </div>
            
            {/* Version Badge */}
            <div className="absolute -bottom-3 right-4 text-[9px] bg-black px-3 py-1 text-pac-ghostRed border border-pac-ghostRed uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-pac-ghostRed rounded-full animate-pulse" />
              v2.0.0
            </div>
          </div>
        </div>

        {/* Taglines */}
        <div className={`relative z-10 text-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-3 font-light">
            AI-Powered Cryptographic Toolkit
          </p>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mb-12">
            100% client-side encryption • Zero tracking • No compromises
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className={`relative z-10 group px-12 py-5 bg-pac-yellow text-black font-arcade text-lg md:text-xl tracking-wider hover:bg-white transition-all duration-300 shadow-[0_0_50px_rgba(242,201,76,0.35)] hover:shadow-[0_0_80px_rgba(242,201,76,0.5)] hover:scale-105 glitch-hover ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <span className="flex items-center gap-4">
            ENTER TERMINAL
            <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <span className="text-[10px] font-mono tracking-widest">SCROLL</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="font-arcade text-[10px] text-pac-ghostCyan tracking-[0.5em] uppercase">
                ⚔️ Your Digital
              </span>
            </div>
            <h2 className="font-arcade text-3xl md:text-4xl text-pac-yellow text-glow mb-4">
              ARSENAL
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Everything you need to secure your digital assets, all running locally in your browser.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon="🔐"
              title="PASSWORD FORGE"
              description="Generate cryptographically secure passwords with rejection sampling. Zero bias, maximum entropy."
              color="#F2C94C"
              delay={0}
            />
            <FeatureCard 
              icon="🔑"
              title="KEY GENERATOR"
              description="JWT secrets, API keys, RSA keypairs, Laravel & Django keys. Framework-ready in seconds."
              color="#4ECDC4"
              delay={100}
            />
            <FeatureCard 
              icon="🔒"
              title="AES ENIGMA"
              description="Military-grade AES-256-GCM encryption. Encrypt anything, decrypt anywhere."
              color="#7B68EE"
              delay={200}
            />
            <FeatureCard 
              icon="⏱️"
              title="TOTP AUTHENTICATOR"
              description="Generate RFC 6238 compliant 2FA codes. QR codes for authenticator apps."
              color="#00BCD4"
              delay={250}
            />
            <FeatureCard 
              icon="🔍"
              title="JWT DEBUGGER"
              description="Decode, inspect, and validate JWT tokens. See headers, payloads, and claims."
              color="#9C27B0"
              delay={300}
            />
            <FeatureCard 
              icon="🛡️"
              title="CSP & CORS BUILDER"
              description="Generate Content Security Policy and CORS headers. Presets for common frameworks."
              color="#4CAF50"
              delay={350}
            />
            <FeatureCard 
              icon={<GhostIcon className="w-9 h-9 text-pac-ghostRed" />}
              title="GHOST LINKS"
              description="Share secrets via E2E encrypted URLs. Auto-destruct after viewing. Zero trace."
              color="#FF6B6B"
              delay={400}
            />
            <FeatureCard 
              icon="☢️"
              title="BREACH RADAR"
              description="Check if your credentials were exposed in known data breaches. k-Anonymity protected."
              color="#A8E6CF"
              delay={450}
            />
            <FeatureCard 
              icon="📦"
              title="LOOT CRATES"
              description="Pre-configured bundles: OAuth Stack, Cloud Credentials, Web App Starter kits."
              color="#FFB86C"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-6 bg-gradient-to-b from-transparent via-pac-blue/[0.03] to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="font-arcade text-[10px] text-pac-yellow/60 tracking-[0.5em] uppercase">
              📖 Simple Steps
            </span>
            <h2 className="font-arcade text-3xl md:text-4xl text-pac-ghostCyan mt-4">
              HOW IT WORKS
            </h2>
          </div>

          {/* Steps */}
          <div className="space-y-10">
            {[
              { step: '01', title: 'TYPE OR USE COMMAND PALETTE', desc: 'Press Ctrl+K to open the command palette, or just type naturally: "Generate JWT secret" or "Open regex tester"', icon: '💬' },
              { step: '02', title: 'INSTANT GENERATION', desc: 'Keys are generated locally using Web Crypto API. TOTP, JWT debugging, CSP/CORS building—all client-side.', icon: '⚡' },
              { step: '03', title: 'EXPORT & AUTO-DESTRUCT', desc: 'Export chat history. Set TTL timers. Messages self-destruct. Enjoy retro arcade sounds.', icon: '💀' },
            ].map((item, i) => (
              <div 
                key={item.step} 
                className="flex items-start gap-6 group animate-[fadeSlideUp_0.6s_ease-out_forwards] opacity-0"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-pac-yellow/15 to-transparent border border-pac-yellow/20 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-pac-yellow/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(242,201,76,0.15)]">
                  {item.icon}
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-arcade text-pac-yellow/50 text-xs">{item.step}</span>
                    <h3 className="font-arcade text-white text-sm group-hover:text-pac-yellow transition-colors">{item.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'CLIENT-SIDE', value: '100%', color: 'text-pac-yellow' },
              { label: 'DATA STORED', value: 'ZERO', color: 'text-pac-ghostCyan' },
              { label: 'OPEN SOURCE', value: 'YES', color: 'text-green-400' },
              { label: 'TRACKING', value: 'NONE', color: 'text-pac-ghostRed' },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className="text-center animate-[fadeSlideUp_0.6s_ease-out_forwards] opacity-0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`font-arcade text-3xl md:text-4xl ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-[10px] text-gray-600 tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          TRUST BADGES SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-6 border-t border-b border-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase mb-8">Trusted by Developers</p>
          <TrustBadges />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          FINAL CTA SECTION
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-arcade text-3xl md:text-4xl text-pac-yellow text-glow mb-6">
            READY TO SECURE?
          </h2>
          <p className="text-gray-500 mb-12 text-lg">
            Your secrets deserve better than cloud storage.<br/>
            Start generating secure credentials now.
          </p>
          <button
            onClick={onStart}
            className="px-16 py-6 bg-pac-yellow text-black font-arcade text-xl tracking-wider hover:bg-white transition-all duration-300 shadow-[0_0_60px_rgba(242,201,76,0.3)] hover:shadow-[0_0_100px_rgba(242,201,76,0.5)] hover:scale-105 glitch-hover"
          >
            LAUNCH PACSEC
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 py-10 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="font-arcade text-lg text-pac-yellow flex items-center gap-[0.02em]">
            PA<PacChar />SE<PacChar />
          </div>
          
          {/* Attribution */}
          <a 
            href="https://zyniq.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-arcade text-[10px] text-gray-600 hover:text-pac-yellow transition-colors duration-300 tracking-widest"
          >
            BUILT BY <span className="text-[#ea2323]">ZYNIQ</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
