import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  keywords: string[];
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (commandId: string) => void;
}

const createCommands = (onCommand: (id: string) => void): CommandItem[] => [
  // Security Tools
  { id: 'password', label: 'Generate Password', description: 'Create a secure random password', icon: '🔑', category: 'Security', keywords: ['password', 'secure', 'random', 'generate'], action: () => onCommand('password') },
  { id: 'jwt', label: 'Generate JWT Secret', description: 'Create a JWT signing secret', icon: '🎟️', category: 'Security', keywords: ['jwt', 'token', 'secret', 'sign'], action: () => onCommand('jwt') },
  { id: 'uuid', label: 'Generate UUID', description: 'Create a unique identifier', icon: '🆔', category: 'Security', keywords: ['uuid', 'id', 'unique', 'guid'], action: () => onCommand('uuid') },
  { id: 'apiKey', label: 'Generate API Key', description: 'Create an API access key', icon: '🔐', category: 'Security', keywords: ['api', 'key', 'access', 'token'], action: () => onCommand('apiKey') },
  { id: 'rsa', label: 'Generate RSA Keypair', description: 'Create public/private RSA keys', icon: '🗝️', category: 'Security', keywords: ['rsa', 'keypair', 'ssh', 'public', 'private'], action: () => onCommand('rsa') },
  { id: 'passphrase', label: 'Generate Passphrase', description: 'Create a diceware passphrase', icon: '🎲', category: 'Security', keywords: ['passphrase', 'diceware', 'words', 'memorable'], action: () => onCommand('passphrase') },
  { id: 'totp', label: 'TOTP Generator', description: 'Create time-based OTP codes', icon: '⏱️', category: 'Security', keywords: ['totp', 'otp', '2fa', 'authenticator'], action: () => onCommand('totp') },

  // Crypto Tools
  { id: 'hash', label: 'Hash Generator', description: 'Generate SHA/MD5 hashes', icon: '#️⃣', category: 'Crypto', keywords: ['hash', 'sha', 'md5', 'checksum'], action: () => onCommand('hash') },
  { id: 'aes', label: 'AES Encrypt/Decrypt', description: 'AES-256-GCM encryption', icon: '🔒', category: 'Crypto', keywords: ['aes', 'encrypt', 'decrypt', 'cipher'], action: () => onCommand('aes') },
  { id: 'encoder', label: 'Encoder/Decoder', description: 'Base64, Hex, URL encoding', icon: '🔄', category: 'Crypto', keywords: ['base64', 'hex', 'encode', 'decode', 'url'], action: () => onCommand('encoder') },

  // Developer Tools
  { id: 'jwtDebugger', label: 'JWT Debugger', description: 'Decode and inspect JWT tokens', icon: '🔍', category: 'Developer', keywords: ['jwt', 'debug', 'decode', 'inspect', 'token'], action: () => onCommand('jwtDebugger') },
  { id: 'regexTester', label: 'Regex Tester', description: 'Test regular expressions', icon: '🔎', category: 'Developer', keywords: ['regex', 'regexp', 'pattern', 'match', 'test'], action: () => onCommand('regexTester') },
  { id: 'cspBuilder', label: 'CSP Builder', description: 'Build Content Security Policy', icon: '🛡️', category: 'Developer', keywords: ['csp', 'security', 'policy', 'header', 'xss'], action: () => onCommand('cspBuilder') },
  { id: 'corsBuilder', label: 'CORS Builder', description: 'Configure CORS headers', icon: '🌐', category: 'Developer', keywords: ['cors', 'cross', 'origin', 'headers', 'api'], action: () => onCommand('corsBuilder') },
  { id: 'qrCode', label: 'QR Code Generator', description: 'Create QR codes', icon: '📱', category: 'Developer', keywords: ['qr', 'code', 'barcode', 'scan'], action: () => onCommand('qrCode') },

  // Privacy Tools
  { id: 'note', label: 'Secure Note', description: 'Create encrypted self-destruct note', icon: '📝', category: 'Privacy', keywords: ['note', 'secret', 'private', 'message'], action: () => onCommand('note') },
  { id: 'ghostLink', label: 'Ghost Link', description: 'Create encrypted sharing link', icon: '👻', category: 'Privacy', keywords: ['ghost', 'link', 'share', 'pastebin', 'encrypted'], action: () => onCommand('ghostLink') },
  { id: 'breachRadar', label: 'Breach Radar', description: 'Check if password/email is compromised', icon: '☢️', category: 'Privacy', keywords: ['breach', 'pwned', 'leak', 'password', 'email'], action: () => onCommand('breachRadar') },
  { id: 'sanitize', label: 'Input Sanitizer', description: 'Clean and escape text', icon: '🧹', category: 'Privacy', keywords: ['sanitize', 'escape', 'clean', 'xss', 'html'], action: () => onCommand('sanitize') },

  // Actions
  { id: 'export', label: 'Export Chat', description: 'Download chat history', icon: '📤', category: 'Actions', keywords: ['export', 'download', 'save', 'chat'], action: () => onCommand('export') },
  { id: 'clear', label: 'Clear Chat', description: 'Remove all messages', icon: '🗑️', category: 'Actions', keywords: ['clear', 'delete', 'remove', 'clean'], action: () => onCommand('clear') },
  { id: 'theme', label: 'Toggle Theme', description: 'Switch dark/light mode', icon: '🌓', category: 'Actions', keywords: ['theme', 'dark', 'light', 'mode'], action: () => onCommand('theme') },
  { id: 'sound', label: 'Toggle Sound', description: 'Enable/disable sound effects', icon: '🔊', category: 'Actions', keywords: ['sound', 'audio', 'effects', 'mute'], action: () => onCommand('sound') },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', description: 'View all shortcuts', icon: '⌨️', category: 'Actions', keywords: ['keyboard', 'shortcuts', 'hotkeys', 'help'], action: () => onCommand('shortcuts') },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onCommand }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => createCommands(onCommand), [onCommand]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const query = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some(k => k.includes(query)) ||
      cmd.category.toLowerCase().includes(query)
    );
  }, [search, commands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, CommandItem[]>);
  }, [filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl bg-gray-900 border-2 border-pac-blue rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,187,212,0.2)] animate-fade-in-up">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <svg className="w-5 h-5 text-pac-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white text-lg focus:outline-none placeholder-gray-600"
            spellCheck={false}
          />
          <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] text-gray-500">ESC</kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm">No commands found</div>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-[10px] font-arcade text-gray-500 tracking-widest bg-black/30">
                  {category.toUpperCase()}
                </div>
                {items.map((cmd) => {
                  flatIndex++;
                  const currentIndex = flatIndex;
                  const isSelected = selectedIndex === currentIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      data-index={currentIndex}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected 
                          ? 'bg-pac-blue/20 border-l-2 border-pac-blue' 
                          : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                      }`}
                    >
                      <span className="text-xl">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isSelected ? 'text-pac-blue' : 'text-white'}`}>
                          {cmd.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                      </div>
                      {isSelected && (
                        <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-[9px] text-gray-400">
                          Enter
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-3 bg-black/30 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-800 rounded">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-800 rounded">Enter</kbd> select
            </span>
          </div>
          <span className="font-arcade text-pac-blue">PAC-SEC</span>
        </div>
      </div>
    </div>
  );
};
