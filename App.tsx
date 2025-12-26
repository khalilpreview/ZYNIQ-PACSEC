import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader } from './components/Loader';
import { LandingPage } from './components/LandingPage';
import { PacThinking } from './components/PacThinking';
import { ChatMessage } from './components/ChatMessage';
import { NewsCard } from './components/NewsCard';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { CommandPalette } from './components/CommandPalette';
import { ThemeSwitcher, ThemeName, applyTheme, getSavedTheme } from './components/ThemeSwitcher';
import { soundEffects } from './utils/soundEffects';
import { exportChat, downloadExport, getExportFilename, getMimeType, ExportOptions } from './utils/chatExport';
import { processUserRequest } from './services/geminiService';
import { Message, PromptItem, IntegrationItem } from './types';

// Helper component for the 'C' replacement (Pacman Icon)
export const PacChar = ({ className }: { className?: string }) => (
  <span className={`inline-block relative align-baseline ${className}`} style={{ width: '0.85em', height: '0.85em', verticalAlign: '-0.05em' }}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current overflow-visible">
      <path d="M50 50 L95 25 A50 50 0 1 0 95 75 Z" />
    </svg>
  </span>
);

const MAX_CONTEXT_TOKENS = 1000000; // Gemini 2.5 Flash Context Window

const formatCompactNumber = (num: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
};

const INTEGRATION_TOOLS: IntegrationItem[] = [
    { id: 'tool_vt', name: 'VIRUS TOTAL', desc: 'Analyze suspicious files, domains, IPs and URLs to detect malware.', icon: '🦠', url: 'https://www.virustotal.com/gui/home/upload', type: 'external' },
    { id: 'tool_hibp', name: 'BREACH RADAR', desc: 'Identify compromised accounts via HaveIBeenPwned API.', icon: '☢️', url: 'https://haveibeenpwned.com/', type: 'external' },
    { id: 'tool_cyberchef', name: 'CYBER CHEF', desc: 'The Cyber Swiss Army Knife. Encrypt, Encode, Compress, Analyze.', icon: '🍳', url: 'https://gchq.github.io/CyberChef/', type: 'external' },
    { id: 'tool_shodan', name: 'SHODAN', desc: 'Search engine for Internet-connected devices.', icon: '🌐', url: 'https://www.shodan.io/', type: 'external' },
    { id: 'tool_cve', name: 'CVE MITRE', desc: 'Identify, define, and catalog publicly disclosed vulnerabilities.', icon: '🛡️', url: 'https://cve.mitre.org/', type: 'external' },
    { id: 'tool_jwt', name: 'JWT.IO', desc: 'Debug and decode JSON Web Tokens.', icon: '🔑', url: 'https://jwt.io/', type: 'external' },
    { id: 'tool_dns', name: 'DNS DUMPSTER', desc: 'DNS recon tool to find subdomains and mapping.', icon: '🗺️', url: 'https://dnsdumpster.com/', type: 'external' },
    { id: 'tool_exploit', name: 'EXPLOIT DB', desc: 'Archive of public exploits and vulnerable software.', icon: '💣', url: 'https://www.exploit-db.com/', type: 'external' },
    { id: 'tool_crontab', name: 'CRONTAB GURU', desc: 'Quick and simple editor for cron schedule expressions.', icon: '⏰', url: 'https://crontab.guru/', type: 'external' },
    { id: 'tool_regex', name: 'REGEX 101', desc: 'Regular expression debugger with real-time explanation.', icon: '🔍', url: 'https://regex101.com/', type: 'external' },
    { id: 'tool_json', name: 'JSON LINT', desc: 'Validate and format JSON data.', icon: '📋', url: 'https://jsonlint.com/', type: 'external' },
    { id: 'tool_urldec', name: 'URL DECODER', desc: 'Decode/Encode URLs accurately.', icon: '🔗', url: 'https://www.urldecoder.org/', type: 'external' }
];

export const App: React.FC = () => {
  type AppState = 'BOOT_LOADER' | 'LANDING' | 'ACTION_LOADER' | 'CHAT';
  const [appState, setAppState] = useState<AppState>('BOOT_LOADER');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Usage Stats
  const [sessionStats, setSessionStats] = useState({ totalTokens: 0, contextUsed: 0 });

  // Menu Button Animation State
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [isInitialPhase, setIsInitialPhase] = useState(true);

  // Zero Knowledge Note settings
  const ttlOptions = [30000, 60000, 300000, 3600000]; // 30s, 1m, 5m, 1h
  const [selectedTTL, setSelectedTTL] = useState(60000);
  
  // Theme State with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pacsec-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Custom theme (color scheme)
  const [customTheme, setCustomTheme] = useState<ThemeName>(() => getSavedTheme());

  // New Feature States
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundEffects.isEnabled());

  // First-time guide state
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('pacsec-guide-completed');
    }
    return true;
  });
  const [guideStep, setGuideStep] = useState(0);

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    // Apply custom color theme
    applyTheme(customTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('pacsec-theme', newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  const toggleSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    soundEffects.setEnabled(newEnabled);
    if (newEnabled) soundEffects.playSuccess();
  };

  const handleCustomThemeChange = (themeName: ThemeName) => {
    setCustomTheme(themeName);
    applyTheme(themeName);
    soundEffects.playSuccess();
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const options: ExportOptions = {
      format: 'json',
      includeTimestamps: true,
      includeSecrets: false,
      encrypted: false
    };
    const content = exportChat(messages, options);
    const filename = getExportFilename(options.format);
    downloadExport(content, filename, getMimeType(options.format));
    soundEffects.playSuccess();
  };

  const handleCommandPaletteCommand = useCallback((commandId: string) => {
    soundEffects.playClick();
    switch (commandId) {
      case 'shortcuts':
        setShowShortcuts(true);
        break;
      case 'theme':
        setShowThemeSwitcher(true);
        break;
      case 'sound':
        toggleSound();
        break;
      case 'export':
        handleExportChat();
        break;
      case 'clear':
        setMessages([]);
        soundEffects.playDelete();
        break;
      default:
        // Map to command and send as message
        const commandMap: Record<string, string> = {
          'password': 'Generate a strong secure password',
          'jwt': 'Generate a JWT signing secret',
          'uuid': 'Generate a UUID v4',
          'apiKey': 'Generate an API key',
          'rsa': 'Generate RSA keypair',
          'passphrase': 'Generate a diceware passphrase',
          'totp': 'Open TOTP authenticator',
          'hash': 'Open hash generator',
          'aes': 'Open AES encryption tool',
          'encoder': 'Open base64/hex encoder',
          'jwtDebugger': 'Open JWT debugger',
          'regexTester': 'Open regex tester',
          'cspBuilder': 'Open CSP builder',
          'corsBuilder': 'Open CORS builder',
          'qrCode': 'Open QR code generator',
          'note': 'Create a secure note',
          'ghostLink': 'Create a ghost link',
          'breachRadar': 'Open breach radar scanner',
          'sanitize': 'Open input sanitizer',
        };
        if (commandMap[commandId]) {
          handleSendMessage(commandMap[commandId]);
        }
        break;
    }
  }, [messages, soundEnabled]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
        soundEffects.playMenuOpen();
      }
      // / to open command palette (when not in input)
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        setShowCommandPalette(true);
        soundEffects.playMenuOpen();
      }
      // ? to show keyboard shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Escape to focus input or close modals
      if (e.key === 'Escape') {
        if (showCommandPalette || showShortcuts || showThemeSwitcher) {
          setShowCommandPalette(false);
          setShowShortcuts(false);
          setShowThemeSwitcher(false);
          soundEffects.playMenuClose();
        } else {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      // Ctrl+T to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowThemeSwitcher(true);
      }
      // Ctrl+S to toggle sound
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && e.shiftKey) {
        e.preventDefault();
        toggleSound();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, showShortcuts, showThemeSwitcher]);

  // Initial Menu Button Animation
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsMenuExpanded(false);
        setIsInitialPhase(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setHasStarted(true);
    setInputValue('');
    soundEffects.playSend();
    
    // When TTL is 0 (OFF), messages persist indefinitely
    const expiry = selectedTTL > 0 ? Date.now() + selectedTTL : undefined;

    // Add User Message
    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text,
        expiresAt: expiry,
        originalTTL: selectedTTL
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Call Gemini
    const response = await processUserRequest(text);

    // Update Stats
    if (response.usage) {
        setSessionStats(prev => ({
            totalTokens: prev.totalTokens + response.usage!.totalTokens,
            contextUsed: response.usage!.promptTokens + response.usage!.responseTokens // Current context size
        }));
    }

    setIsProcessing(false);
    soundEffects.playReceive();
    
    // Assistant inherits the same TTL context (undefined = persist forever)
    const botExpiry = selectedTTL > 0 ? Date.now() + selectedTTL : undefined;
    
    const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        toolCall: response.toolCall,
        isError: response.isError,
        expiresAt: botExpiry,
        originalTTL: selectedTTL
    };
    
    setMessages(prev => [...prev, botMsg]);
  };

  const cycleTTL = () => {
    // Cycle through: 30s -> 1m -> 5m -> 1h -> OFF -> 30s...
    const allOptions = [...ttlOptions, 0]; // Add 0 (OFF) at the end
    const currentIndex = allOptions.indexOf(selectedTTL);
    const nextIndex = (currentIndex + 1) % allOptions.length;
    setSelectedTTL(allOptions[nextIndex]);
  };

  const formatTTL = (ms: number) => {
      if (ms === 0) return 'OFF';
      if (ms < 60000) return `${(ms/1000).toString().padStart(2,'0')}S`;
      if (ms < 3600000) return `${(ms/60000).toString().padStart(2,'0')}M`;
      return `${(ms/3600000).toString().padStart(2,'0')}H`;
  };

  const handleOpenIntegrations = () => {
      setHasStarted(true);
      const msg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'INITIALIZING EXTERNAL SECURITY MODULES.\nSELECT A TOOL TO ESTABLISH UPLINK.',
          integrations: INTEGRATION_TOOLS,
          expiresAt: selectedTTL > 0 ? Date.now() + selectedTTL : undefined,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, msg]);
  };

  const handleIntegrationConnect = (toolId: string) => {
      const toolName = INTEGRATION_TOOLS.find(t => t.id === toolId)?.name || 'MODULE';
      
      const confirmMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: `UPLINK ESTABLISHED: ${toolName}\nNEW PROTOCOLS AVAILABLE IN MENU.`,
          expiresAt: selectedTTL > 0 ? Date.now() + selectedTTL : undefined,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, confirmMsg]);
  };

  // --- MENU DATA STRUCTURE ---
  const menuData: PromptItem[] = [
      {
          id: 'cat_quick_note',
          label: 'QUICK NOTE',
          cmd: 'I need to create a secure note now',
          desc: 'CREATE & LOCK',
          type: 'command'
      },
      {
          id: 'cat_access',
          label: 'ACCESS CONTROL',
          cmd: 'OPEN_ACCESS_MENU',
          desc: 'PASSWORDS, PINS, PHRASES',
          type: 'category',
          items: [
              { id: 'cmd_pass_strong', label: 'STRONG PASSWORD', cmd: 'Generate a strong secure password 24 chars', desc: 'MAX ENTROPY', type: 'command' },
              { id: 'cmd_pass_mem', label: 'MEMORABLE PASS', cmd: 'Generate a memorable but secure password', desc: 'HUMAN READABLE', type: 'command' },
              { id: 'cmd_pass_wifi', label: 'WIFI PASSWORD', cmd: 'Generate a 16 char alphanumeric password for WiFi', desc: 'NO SYMBOLS', type: 'command' },
              { id: 'cmd_pin', label: 'SECURE PIN', cmd: 'Generate a 6-digit secure PIN', desc: 'NUMERIC ONLY', type: 'command' }
          ]
      },
      {
          id: 'cat_dev',
          label: 'DEVELOPER KEYS',
          cmd: 'OPEN_DEV_MENU',
          desc: 'API, JWT, FRAMEWORKS',
          type: 'category',
          items: [
              { id: 'cmd_jwt', label: 'JWT SECRET', cmd: 'Generate a 256-bit JWT signing secret', desc: 'HMAC-SHA256', type: 'command' },
              { id: 'cmd_api', label: 'API KEY', cmd: 'Generate a standard API Key 32 chars', desc: 'SERVICE AUTH', type: 'command' },
              { id: 'cmd_laravel', label: 'LARAVEL KEY', cmd: 'Generate a base64 32-byte encryption key', desc: 'APP_KEY', type: 'command' },
              { id: 'cmd_django', label: 'DJANGO SECRET', cmd: 'Generate a 50 char random string with symbols', desc: 'SECRET_KEY', type: 'command' },
              { id: 'cmd_uuid', label: 'UUID V4', cmd: 'Generate a UUID v4', desc: 'UNIQUE ID', type: 'command' }
          ]
      },
      {
          id: 'cat_cyber',
          label: 'CYBER TOOLS',
          cmd: 'OPEN_CYBER_MENU',
          desc: 'RSA, HASHING, ENCODING',
          type: 'category',
          items: [
              { id: 'cmd_rsa', label: 'RSA KEY FORGE', cmd: 'Generate RSA Key Pair', desc: 'PUBLIC/PRIVATE KEY', type: 'command' },
              { id: 'cmd_hash', label: 'GHOST HASHER', cmd: 'Open Ghost Hash Tool', desc: 'SHA-256 / SHA-512', type: 'command' },
              { id: 'cmd_aes', label: 'AES ENIGMA', cmd: 'Open AES Encryption Tool', desc: 'ENCRYPT/DECRYPT', type: 'command' },
              { id: 'cmd_sanitize', label: 'HTML DECON', cmd: 'Open HTML Sanitizer', desc: 'CLEAN XSS', type: 'command' },
              { id: 'cmd_breach', label: 'BREACH RADAR', cmd: 'Open Breach Radar Scanner', desc: 'HIBP CHECK', type: 'command' },
              { id: 'cmd_qrcode', label: 'QR FORGE', cmd: 'Open QR Code Generator', desc: 'GENERATE QR', type: 'command' },
              { id: 'cmd_passphrase', label: 'DICEWARE', cmd: 'Generate Diceware Passphrase', desc: 'WORD PASS', type: 'command' },
              { id: 'cmd_encoder', label: 'ENCODER', cmd: 'Open Base64/Hex Encoder', desc: 'ENCODE/DECODE', type: 'command' },
              { id: 'cmd_totp', label: 'TOTP AUTH', cmd: 'Open TOTP Authenticator', desc: '2FA CODES', type: 'command' },
              { id: 'cmd_jwt_debug', label: 'JWT DEBUGGER', cmd: 'Open JWT Debugger', desc: 'DECODE JWT', type: 'command' },
              { id: 'cmd_regex', label: 'REGEX TESTER', cmd: 'Open Regex Tester', desc: 'PATTERN TEST', type: 'command' },
              { id: 'cmd_csp', label: 'CSP BUILDER', cmd: 'Open CSP Builder', desc: 'SEC HEADERS', type: 'command' },
              { id: 'cmd_cors', label: 'CORS BUILDER', cmd: 'Open CORS Builder', desc: 'CROSS-ORIGIN', type: 'command' }
          ]
      },
      {
          id: 'cat_bundles',
          label: 'LOOT CRATES',
          cmd: 'OPEN_BUNDLES_MENU',
          desc: 'MULTI-KEY RECIPES',
          type: 'category',
          items: [
              { id: 'cmd_bundle_oauth', label: 'OAUTH STACK', cmd: 'Generate OAuth Stack', desc: 'CLIENT ID + SECRET', type: 'command' },
              { id: 'cmd_bundle_aws', label: 'CLOUD CREDENTIALS', cmd: 'Generate Cloud Access Key and Secret Key pair', desc: 'ACCESS + SECRET KEY', type: 'command' },
              { id: 'cmd_bundle_app', label: 'WEB APP START', cmd: 'Generate Web App Starter Keys', desc: 'DB + JWT + API', type: 'command' },
              { id: 'cmd_bundle_webhook', label: 'WEBHOOK SEC', cmd: 'Generate Webhook Signing Secret and Validation Token', desc: 'SIGN + VERIFY', type: 'command' }
          ]
      },
      {
          id: 'cat_notes',
          label: 'SECURE NOTES',
          cmd: 'OPEN_NOTES_MENU',
          desc: 'SELF-DESTRUCT MSGS',
          type: 'category',
          items: [
              { id: 'cmd_note_create', label: 'CREATE NOTE', cmd: 'Create a new secure note container', desc: 'NEW SECURE NOTE', type: 'command' },
              { id: 'cmd_ghost_link', label: 'GHOST LINK', cmd: 'Generate Encrypted Ghost Link (Pastebin)', desc: 'E2E URL SHARE', type: 'command' },
              { id: 'cmd_note_howto', label: 'HOW IT WORKS', cmd: 'Explain how Zero Knowledge Notes work.', desc: 'TTL & ENCRYPTION', type: 'command' }
          ]
      }
  ];

  const handlePromptInteraction = (item: PromptItem) => {
      if (item.type === 'category') {
          // Drill down into category
          const promptMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              text: `CATEGORY_SELECTED: ${item.label}`,
              prompts: item.items, // Show children
              expiresAt: selectedTTL > 0 ? Date.now() + selectedTTL : undefined,
              originalTTL: selectedTTL
          };
          setMessages(prev => [...prev, promptMsg]);
      } else {
          // Execute command
          handleSendMessage(item.cmd);
      }
  };

  const handleShowMainMenu = () => {
      setHasStarted(true);
      const promptMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'SELECT_OPERATION_MODE:',
          prompts: menuData, // Show top level categories
          expiresAt: selectedTTL > 0 ? Date.now() + selectedTTL : undefined,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, promptMsg]);
  };

  const handleReadMoreNews = () => {
      setHasStarted(true);
      const newsGuideMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'SECURE ARCHIVES ACCESSED.\n\nEXPLORE INTELLIGENCE CATEGORIES BELOW OR SEARCH SPECIFIC THREATS (E.G. "PHISHING", "JWT").',
          prompts: menuData,
          expiresAt: selectedTTL > 0 ? Date.now() + selectedTTL : undefined,
          originalTTL: selectedTTL
      };
      setMessages(prev => [...prev, newsGuideMsg]);
  };

  const isContextFull = sessionStats.contextUsed >= MAX_CONTEXT_TOKENS;

  if (appState === 'BOOT_LOADER') {
    return <Loader onComplete={() => setAppState('LANDING')} buttonText="GET A BRIEF" />;
  }

  if (appState === 'LANDING') {
    return <LandingPage onStart={() => setAppState('ACTION_LOADER')} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (appState === 'ACTION_LOADER') {
    return <Loader onComplete={() => setAppState('CHAT')} buttonText="START" />;
  }

  const guideSteps = [
    { title: 'WELCOME TO PACSEC', desc: 'Your AI-powered security command center. Generate passwords, keys, and encrypted notes—all client-side.', target: 'logo' },
    { title: 'QUICK MENU', desc: 'Click MENU or press Ctrl+K to access all security tools organized by category.', target: 'menu' },
    { title: 'TTL TIMER', desc: 'Set how long messages stay visible. They auto-destruct when time expires.', target: 'ttl' },
    { title: 'JUST ASK', desc: 'Type naturally: "Generate JWT secret" or "Create strong password". PAC understands you.', target: 'input' },
  ];

  const completeGuide = () => {
    setShowGuide(false);
    localStorage.setItem('pacsec-guide-completed', 'true');
  };

  const nextGuideStep = () => {
    if (guideStep < guideSteps.length - 1) {
      setGuideStep(guideStep + 1);
    } else {
      completeGuide();
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      
      {/* Global Modals */}
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
        onCommand={handleCommandPaletteCommand}
      />
      <ThemeSwitcher
        isOpen={showThemeSwitcher}
        onClose={() => setShowThemeSwitcher(false)}
        currentTheme={customTheme}
        onThemeChange={handleCustomThemeChange}
      />

      {/* First-Time Guide Overlay */}
      {showGuide && hasStarted && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-gray-900 border-2 border-pac-yellow rounded-xl overflow-hidden shadow-[0_0_60px_rgba(242,201,76,0.2)]">
            {/* Progress Bar */}
            <div className="h-1 bg-gray-800">
              <div 
                className="h-full bg-pac-yellow transition-all duration-300" 
                style={{ width: `${((guideStep + 1) / guideSteps.length) * 100}%` }}
              />
            </div>
            
            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="text-pac-yellow font-arcade text-xs tracking-widest mb-1">
                STEP {guideStep + 1}/{guideSteps.length}
              </div>
              <h3 className="font-arcade text-lg md:text-xl text-white mb-3">
                {guideSteps[guideStep].title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {guideSteps[guideStep].desc}
              </p>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={completeGuide}
                  className="text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors"
                >
                  SKIP GUIDE
                </button>
                <button
                  onClick={nextGuideStep}
                  className="px-6 py-2.5 bg-pac-yellow text-black font-arcade text-xs tracking-wider hover:bg-white transition-all"
                >
                  {guideStep < guideSteps.length - 1 ? 'NEXT' : 'START'}
                </button>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={completeGuide}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
              aria-label="Close guide"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Arcade Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Header (Only visible when chat starts) */}
      <header className={`fixed top-0 left-0 right-0 p-2 md:p-2 z-40 transition-all duration-500 bg-[var(--header-bg)] backdrop-blur-sm border-b-2 md:border-b-4 border-pac-blue ${hasStarted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-center md:justify-between">
             {/* Dynamic Stats - Replaces 1UP/High Score */}
             <div className="hidden md:flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-pac-ghostRed font-arcade text-[10px] animate-pulse">TOKENS</span>
                    <span className="text-[var(--text-color)] font-arcade text-xs tracking-widest">
                        {sessionStats.totalTokens.toString().padStart(6, '0')}
                    </span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-pac-yellow font-arcade text-[10px]">CONTEXT</span>
                    <span className={`text-[var(--text-color)] font-arcade text-xs tracking-widest ${isContextFull ? 'text-red-500 animate-pulse' : ''}`}>
                        {formatCompactNumber(sessionStats.contextUsed)} T
                    </span>
                 </div>
             </div>
             
             {/* Centered Logo on Mobile */}
             <h1 className="font-arcade text-pac-yellow text-xs md:text-sm tracking-widest border-2 border-pac-yellow px-2 py-1 shadow-[2px_2px_0_0_rgba(242,201,76,0.5)] md:shadow-[4px_4px_0_0_rgba(242,201,76,0.5)] flex items-center gap-[0.1em]">
                PA<PacChar />-SE<PacChar />
             </h1>

             {/* Theme Toggle - In Header */}
             <button 
                onClick={toggleTheme}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 border-2 border-gray-700 hover:border-pac-ghostCyan text-gray-500 hover:text-pac-ghostCyan font-arcade text-[9px] uppercase tracking-widest transition-all"
                aria-label="Toggle Theme"
             >
                {theme === 'dark' ? (
                  <><span>☀️</span><span className="hidden lg:inline">LIGHT</span></>
                ) : (
                  <><span>👻</span><span className="hidden lg:inline">DARK</span></>
                )}
             </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-4xl mx-auto p-1 transition-all duration-500 flex flex-col relative z-10 ${!hasStarted ? 'h-screen overflow-hidden pb-32' : 'pt-20 md:pt-24 pb-36 md:pb-40'}`}>
        
        {/* Intro State Layout */}
        {!hasStarted && (
           <div className="flex flex-col h-full w-full justify-between px-4 pt-8 md:pt-16 animate-fade-in relative z-20">
               
               {/* TOP: Logo & Subtext */}
               <div className="flex flex-col items-center">
                    <div className="mb-4 border-4 border-pac-blue p-3 md:p-4 bg-[var(--card-bg)] shadow-[4px_4px_0_0_var(--border-color)] md:shadow-[8px_8px_0_0_var(--border-color)] w-full max-w-xl scale-95 md:scale-100 origin-top transition-colors duration-300">
                        <div className="text-4xl md:text-6xl font-arcade text-pac-yellow mb-2 md:mb-4 tracking-tighter drop-shadow-md flex items-center justify-center gap-[0.05em]">
                            <span>PA</span>
                            <PacChar className="mx-[0.02em]" />
                            <span>SE</span>
                            <PacChar className="mx-[0.02em]" />
                        </div>
                        <div className="text-pac-ghostRed text-[9px] md:text-xs font-arcade tracking-[0.2em] blink-effect mt-2 md:mt-3 text-center">
                            Infinite Secrets. Zero Nonsense.
                        </div>
                    </div>
                    
                    <p className="text-[var(--accent-color)] font-arcade text-[9px] md:text-[10px] max-w-md mx-auto leading-relaxed md:leading-loose mt-2 text-center">
                        NO SERVER STORAGE.<br/>
                        100% CLIENT-SIDE ENCRYPTION.
                    </p>
               </div>

               {/* BOTTOM: News Card */}
               <div className="w-full mb-28 md:mb-28">
                  <NewsCard onReadMore={handleReadMoreNews} />
               </div>
           </div>
        )}

        {/* Chat History */}
        {hasStarted && (
            <div className="space-y-6 md:space-y-8 w-full px-2 md:px-0">
                {messages.map((msg) => (
                   <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onExpire={removeMessage}
                        onPromptInteract={handlePromptInteraction}
                        onIntegrationConnect={handleIntegrationConnect}
                    />
                ))}
                
                {/* Loading State */}
                {isProcessing && (
                    <div className="flex justify-start w-full pl-2">
                        <PacThinking />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </main>

      {/* Input Area - All controls integrated inside */}
      <div className={`
        transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] w-full z-50
        ${!hasStarted 
            ? 'fixed bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4' 
            : 'fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)] to-transparent pt-8 pb-6 px-4'
        }
      `}>
          <div className="mx-auto w-full max-w-3xl">
            
            {/* Unified Input Box with All Controls */}
            <div className={`
                relative flex flex-col rounded-2xl transition-all duration-300 overflow-hidden
                ${isProcessing 
                    ? 'bg-gray-900/90 border-2 border-gray-800' 
                    : isContextFull
                        ? 'bg-red-950/50 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                        : 'bg-gray-900/90 border-2 border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.5)] focus-within:border-pac-ghostCyan focus-within:shadow-[0_0_40px_rgba(34,211,238,0.15)]'
                }
            `}>
                
                {/* Main Input Row */}
                <div className="flex items-center">
                    {/* Prompt Icon */}
                    <div className={`pl-4 md:pl-5 pr-2 ${isProcessing ? 'text-gray-700' : 'text-pac-ghostCyan'}`}>
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    {/* Text Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder={isContextFull ? "CONTEXT MEMORY FULL" : (hasStarted ? "Type a command or ask anything..." : "What would you like to secure?")}
                        className="flex-1 w-full bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-600 text-base md:text-lg py-4 pr-2 text-[var(--text-color)] font-light tracking-wide"
                        disabled={isProcessing || isContextFull}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                    />

                    {/* TTL Toggle + Send Button Group */}
                    <div className="flex items-center gap-1 m-2">
                        {/* TTL Toggle Button */}
                        <button 
                            onClick={cycleTTL}
                            onContextMenu={(e) => { e.preventDefault(); setSelectedTTL(0); }}
                            disabled={isProcessing}
                            className={`
                                px-2 md:px-3 py-2.5 md:py-3 rounded-l-xl font-arcade text-[9px] md:text-[10px] uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 border-r border-black/20
                                ${selectedTTL === 0 
                                    ? 'bg-gray-800 text-gray-500' 
                                    : selectedTTL < 60000 
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                        : 'bg-pac-yellow/20 text-pac-yellow hover:bg-pac-yellow/30'
                                }
                            `}
                            title={selectedTTL === 0 ? 'TTL Off - Click to enable' : 'Left-click to cycle, Right-click to turn off'}
                        >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 6v6l4 2" strokeLinecap="round"/>
                            </svg>
                            <span className="hidden sm:inline">{selectedTTL === 0 ? 'OFF' : formatTTL(selectedTTL)}</span>
                        </button>

                        {/* Send Button */}
                        <button 
                            onClick={() => handleSendMessage(inputValue)}
                            disabled={!inputValue.trim() || isProcessing || isContextFull}
                            className={`
                                px-4 md:px-5 py-2.5 md:py-3 rounded-r-xl font-arcade text-[10px] md:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2
                                ${!inputValue.trim() || isProcessing || isContextFull
                                    ? 'text-gray-700 bg-gray-800/50 cursor-not-allowed' 
                                    : 'bg-pac-yellow text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(242,201,76,0.3)]'
                                }
                            `}
                        >
                            {isProcessing ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83"/>
                                </svg>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">SEND</span>
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Bottom Controls Bar - Inside Input Box */}
                {hasStarted && (
                  <div className="flex items-center justify-between px-3 md:px-4 py-2 border-t border-gray-800 bg-black/30">
                    {/* Left Side Controls */}
                    <div className="flex items-center gap-1 md:gap-2">
                      {/* Menu Button */}
                      <button
                          type="button"
                          onClick={handleShowMainMenu}
                          disabled={isProcessing}
                          className="group flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-pac-yellow hover:bg-pac-yellow/10 transition-all duration-200 disabled:opacity-50"
                          title="Open Prompts Menu (Ctrl+K)"
                      >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
                          </svg>
                          <span className="font-arcade text-[8px] md:text-[9px] hidden sm:inline">MENU</span>
                      </button>

                      {/* Divider */}
                      <div className="w-px h-4 bg-gray-800 hidden sm:block" />

                      {/* Integrations Button */}
                      <button 
                          onClick={handleOpenIntegrations}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all duration-200 disabled:opacity-50"
                          title="Connect Security Tools"
                      >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                          </svg>
                          <span className="font-arcade text-[8px] md:text-[9px] hidden sm:inline">TOOLS</span>
                      </button>

                      {/* Theme Toggle - Mobile Only */}
                      <button 
                          onClick={toggleTheme}
                          className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-pac-ghostCyan hover:bg-pac-ghostCyan/10 transition-all duration-200"
                          title="Toggle Theme"
                      >
                          {theme === 'dark' ? '☀️' : '👻'}
                      </button>
                    </div>

                    {/* Right Side: Context Counter */}
                    <div className="flex items-center gap-2">
                      {sessionStats.contextUsed > 0 && (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${isContextFull ? 'text-red-400' : 'text-gray-600'}`}>
                          <span className="font-arcade text-[8px]">CTX</span>
                          <span className="font-mono">{formatCompactNumber(sessionStats.contextUsed)}</span>
                        </div>
                      )}
                      
                      {/* Keyboard Hint */}
                      <div className="hidden md:flex items-center gap-1 text-gray-700 text-[9px]">
                        <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[8px]">⌘K</kbd>
                        <span>menu</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Bottom hint - only on intro */}
            {!hasStarted && (
              <p className="text-center text-gray-600 text-xs font-mono mt-3">
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 text-[10px]">Enter</kbd> to start or <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 text-[10px]">Ctrl+K</kbd> for menu
              </p>
            )}
          </div>
      </div>

      {/* Footer Credit */}
      <footer className="fixed bottom-0 w-full text-center z-40 pointer-events-auto py-1">
         <a 
            href="https://zyniq.solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-block font-arcade text-[9px] md:text-[10px] transition-all duration-300 ease-out brightness-50 hover:brightness-125 hover:scale-110"
         >
            <span className="text-[var(--footer-text)] font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(242,201,76,0.8)] transition-all">PACSEC BY </span>
            <span className="text-[#ea2323] font-bold drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(234,35,35,0.8)] transition-all">ZYNIQ</span>
         </a>
      </footer>

      <style>{`
        .blink-effect {
          animation: blink 2s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}