import * as React from 'react';
import { useState, useEffect } from 'react';
import { Message, PromptItem } from '../types';
import { SecretCard } from './SecretCard';
import { LootCrate } from './LootCrate';
import { NoteCard } from './NoteCard';
import { RsaCard } from './RsaCard';
import { HashCard } from './HashCard';
import { IntegrationsGrid } from './IntegrationsGrid';
import { AesCard } from './AesCard';
import { SanitizeCard } from './SanitizeCard';
import { GhostLinkCard } from './GhostLinkCard';
import { BreachRadarCard } from './BreachRadarCard';
import { QRCodeCard } from './QRCodeCard';
import { PassphraseCard } from './PassphraseCard';
import { EncoderCard } from './EncoderCard';
import { TotpCard } from './TotpCard';
import { JwtDebuggerCard } from './JwtDebuggerCard';
import { RegexTesterCard } from './RegexTesterCard';
import { CspBuilderCard } from './CspBuilderCard';
import { CorsBuilderCard } from './CorsBuilderCard';

interface ChatMessageProps {
  message: Message;
  onExpire: (id: string) => void;
  onPromptInteract?: (item: PromptItem) => void;
  onIntegrationConnect?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onExpire, onPromptInteract, onIntegrationConnect }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isCrumbling, setIsCrumbling] = useState(false);

  useEffect(() => {
    if (!message.expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = message.expiresAt! - now;

      if (diff <= 0) {
        setIsCrumbling(true);
        setTimeout(() => {
            onExpire(message.id);
        }, 800); // Allow crumble animation to play
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
        // Glitch effect in last 10 seconds
        if (diff < 10000 && diff > 0) {
            setIsGlitching(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [message.expiresAt, message.id, onExpire]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!message.text && !message.toolCall && !message.prompts && !message.integrations) return null;

  const isUser = message.role === 'user';
  const isSystem = !isUser;
  const isError = message.isError;

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isCrumbling ? 'crumble pointer-events-none' : ''}`}>
        <div className={`
            relative max-w-[95%] md:max-w-[90%] border-2 transition-all duration-200 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] md:shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
            ${isGlitching ? 'glitch-anim border-red-500 shadow-[4px_4px_0_0_rgba(239,68,68,0.5)]' : ''}
            ${
                isUser
                ? 'bg-[var(--pac-blue-custom)] text-white border-white' 
                : isError 
                    ? 'bg-red-950 text-red-100 border-red-500'
                    : 'bg-[var(--message-system-bg)] text-[var(--message-system-text)] border-pac-yellow'
            }
        `}>
            {/* Countdown Timer Header - Integrated into border */}
            {timeLeft !== null && (
                <div className={`absolute -top-3 ${isUser ? 'left-2' : 'right-2'} bg-[var(--card-bg)] px-2 border-2 z-10 ${isGlitching ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-600 text-gray-500'}`}>
                    <span className="font-arcade text-[8px] font-bold tracking-widest">
                        TTL {formatTime(timeLeft)}
                    </span>
                </div>
            )}

            {/* Padded Content Area */}
            <div className="p-3 md:p-8">
                {/* Role Label */}
                {isSystem && (
                    <div className={`mb-3 md:mb-4 text-[10px] md:text-xs font-arcade uppercase tracking-widest border-b border-gray-800 pb-2 border-dashed flex items-center gap-2 ${isError ? 'text-red-500' : 'text-pac-yellow'}`}>
                        <span>{isError ? '! ERROR' : '> SYSTEM'}</span>
                        <div className={`h-[2px] flex-1 ${isError ? 'bg-red-900' : 'bg-gray-900'}`}></div>
                    </div>
                )}

                {/* Content - Enhanced Readability */}
                {message.text && (
                    <div className={`font-mono text-sm md:text-lg leading-relaxed md:leading-loose tracking-wide whitespace-pre-wrap antialiased ${isGlitching ? 'opacity-80' : ''}`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Prompt List (Menu) - 3 COLUMN LAYOUT FOR READABILITY */}
            {message.prompts && (
                <div className="border-t-2 border-[var(--border-color)] bg-black/10 p-2 md:p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {message.prompts.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => onPromptInteract && onPromptInteract(p)}
                                className={`
                                    group flex flex-col items-start gap-1.5 p-2 md:p-2.5 text-left transition-all duration-200
                                    border border-[var(--border-color)] hover:border-pac-blue bg-[var(--card-bg)] relative
                                    hover:bg-pac-blue hover:text-white focus:bg-pac-blue focus:text-white outline-none
                                    h-full shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]
                                    min-h-[70px]
                                `}
                            >
                                {/* Header: Icon + Label */}
                                <div className="flex items-center gap-1.5 w-full">
                                    <div className={`
                                        flex-shrink-0 w-4 h-4 flex items-center justify-center border font-arcade text-[7px]
                                        ${p.type === 'category' 
                                            ? 'border-pac-yellow text-pac-yellow' 
                                            : 'border-pac-ghostCyan text-pac-ghostCyan'
                                        }
                                        group-hover:border-white group-hover:text-black group-hover:bg-white
                                    `}>
                                        {p.type === 'category' ? '+' : '>'}
                                    </div>
                                    <span className="font-arcade text-[8px] md:text-[9px] tracking-wider truncate flex-1 text-[var(--text-color)] group-hover:text-pac-yellow leading-tight">
                                        {p.label}
                                    </span>
                                </div>

                                {/* Description */}
                                <span className={`text-[8px] md:text-[9px] font-mono leading-tight line-clamp-2 group-hover:text-gray-100 ${p.type === 'category' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {p.desc}
                                </span>

                                 {/* Type Indicator */}
                                 {p.type === 'category' && (
                                    <span className="absolute top-1.5 right-1.5 font-arcade text-[6px] text-gray-700 group-hover:text-white/50">
                                        DIR
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Integrations Grid */}
            {message.integrations && (
                <div className="px-2 pb-4 md:px-5 md:pb-6">
                     <div className="h-px bg-indigo-900/50 w-full mb-4"></div>
                     <IntegrationsGrid items={message.integrations} onConnect={onIntegrationConnect} />
                </div>
            )}

            {/* Tools Area */}
            {message.toolCall && (
                <div className="px-2 pb-4 md:px-5 md:pb-6">
                     {/* Divider before tool */}
                     <div className="h-px bg-gray-800 w-full mb-4 md:mb-6"></div>
                    {(() => {
                        switch(message.toolCall.type) {
                            case 'recipe': return <LootCrate config={message.toolCall} />;
                            case 'note': return <NoteCard />;
                            case 'rsa': return <RsaCard bits={message.toolCall.bits} />;
                            case 'hash': return <HashCard />;
                            case 'aes': return <AesCard />;
                            case 'sanitize': return <SanitizeCard />;
                            case 'ghostLink': return <GhostLinkCard />;
                            case 'breachRadar': return <BreachRadarCard />;
                            case 'qrCode': return <QRCodeCard />;
                            case 'passphrase': return <PassphraseCard />;
                            case 'encoder': return <EncoderCard />;
                            case 'totp': return <TotpCard />;
                            case 'jwtDebugger': return <JwtDebuggerCard />;
                            case 'regexTester': return <RegexTesterCard />;
                            case 'cspBuilder': return <CspBuilderCard />;
                            case 'corsBuilder': return <CorsBuilderCard />;
                            default: return <SecretCard config={message.toolCall} />;
                        }
                    })()}
                </div>
            )}
        </div>
    </div>
  );
};