import * as React from 'react';
import { useState } from 'react';

interface CSPDirective {
  name: string;
  description: string;
  values: string[];
  enabled: boolean;
}

const defaultDirectives: CSPDirective[] = [
  { name: 'default-src', description: 'Fallback for other directives', values: ["'self'"], enabled: true },
  { name: 'script-src', description: 'Valid sources for JavaScript', values: ["'self'"], enabled: true },
  { name: 'style-src', description: 'Valid sources for stylesheets', values: ["'self'", "'unsafe-inline'"], enabled: true },
  { name: 'img-src', description: 'Valid sources for images', values: ["'self'", 'data:', 'https:'], enabled: true },
  { name: 'font-src', description: 'Valid sources for fonts', values: ["'self'"], enabled: false },
  { name: 'connect-src', description: 'Valid sources for fetch, XHR, WebSocket', values: ["'self'"], enabled: true },
  { name: 'frame-src', description: 'Valid sources for frames', values: ["'none'"], enabled: false },
  { name: 'object-src', description: 'Valid sources for plugins', values: ["'none'"], enabled: true },
  { name: 'base-uri', description: 'Restricts URLs for <base>', values: ["'self'"], enabled: true },
  { name: 'form-action', description: 'Valid endpoints for forms', values: ["'self'"], enabled: false },
  { name: 'frame-ancestors', description: 'Valid parents for embedding', values: ["'none'"], enabled: true },
  { name: 'upgrade-insecure-requests', description: 'Upgrade HTTP to HTTPS', values: [], enabled: true },
];

const commonValues = [
  { value: "'self'", desc: 'Same origin only' },
  { value: "'none'", desc: 'Block all' },
  { value: "'unsafe-inline'", desc: 'Allow inline (less secure)' },
  { value: "'unsafe-eval'", desc: 'Allow eval() (dangerous)' },
  { value: "'strict-dynamic'", desc: 'Trust scripts loaded by trusted scripts' },
  { value: 'https:', desc: 'Any HTTPS source' },
  { value: 'data:', desc: 'Data URIs' },
  { value: 'blob:', desc: 'Blob URIs' },
  { value: '*.example.com', desc: 'Wildcard subdomain' },
];

export const CspBuilderCard: React.FC = () => {
  const [directives, setDirectives] = useState<CSPDirective[]>(defaultDirectives);
  const [copied, setCopied] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'header' | 'meta'>('header');

  const toggleDirective = (name: string) => {
    setDirectives(prev => prev.map(d => 
      d.name === name ? { ...d, enabled: !d.enabled } : d
    ));
  };

  const addValue = (directiveName: string, value: string) => {
    if (!value.trim()) return;
    setDirectives(prev => prev.map(d => 
      d.name === directiveName && !d.values.includes(value.trim())
        ? { ...d, values: [...d.values, value.trim()] }
        : d
    ));
    setNewValue('');
  };

  const removeValue = (directiveName: string, value: string) => {
    setDirectives(prev => prev.map(d => 
      d.name === directiveName
        ? { ...d, values: d.values.filter(v => v !== value) }
        : d
    ));
  };

  const generateCSP = (): string => {
    return directives
      .filter(d => d.enabled)
      .map(d => d.values.length > 0 ? `${d.name} ${d.values.join(' ')}` : d.name)
      .join('; ');
  };

  const cspString = generateCSP();

  const getOutput = (): string => {
    if (outputFormat === 'meta') {
      return `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
    }
    return `Content-Security-Policy: ${cspString}`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: 'strict' | 'moderate' | 'relaxed') => {
    const presets = {
      strict: {
        'default-src': ["'none'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
      },
      moderate: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https:'],
        'font-src': ["'self'", 'https:'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
      },
      relaxed: {
        'default-src': ["'self'", 'https:'],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
        'style-src': ["'self'", "'unsafe-inline'", 'https:'],
        'img-src': ['*', 'data:', 'blob:'],
        'connect-src': ['*'],
        'font-src': ['*'],
        'object-src': ["'self'"],
        'frame-ancestors': ["'self'"],
      },
    };

    const preset_values = presets[preset];
    setDirectives(prev => prev.map(d => ({
      ...d,
      enabled: d.name in preset_values || d.name === 'upgrade-insecure-requests',
      values: preset_values[d.name as keyof typeof preset_values] || d.values,
    })));
  };

  return (
    <div className="w-full font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-cyan-500 p-1 relative shadow-[4px_4px_0_0_rgba(6,182,212,0.4)]">
        
        {/* Header */}
        <div className="bg-cyan-500 text-black p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-[10px] md:text-xs tracking-widest font-bold">CSP BUILDER</span>
          </div>
          <span className="text-[8px] bg-black text-cyan-400 px-2 py-0.5 border border-cyan-400/50">SECURITY HEADER</span>
        </div>

        <div className="p-3 md:p-4 space-y-4">
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] text-gray-500 self-center">PRESETS:</span>
            <button onClick={() => applyPreset('strict')} className="px-2 py-1 bg-red-900/50 border border-red-500/50 text-red-400 text-[9px] hover:bg-red-900 transition-colors">
              🔒 STRICT
            </button>
            <button onClick={() => applyPreset('moderate')} className="px-2 py-1 bg-yellow-900/50 border border-yellow-500/50 text-yellow-400 text-[9px] hover:bg-yellow-900 transition-colors">
              ⚖️ MODERATE
            </button>
            <button onClick={() => applyPreset('relaxed')} className="px-2 py-1 bg-green-900/50 border border-green-500/50 text-green-400 text-[9px] hover:bg-green-900 transition-colors">
              🔓 RELAXED
            </button>
          </div>

          {/* Directives List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {directives.map(directive => (
              <div 
                key={directive.name}
                className={`border ${directive.enabled ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-gray-800 bg-gray-900/50'} p-2 transition-colors`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleDirective(directive.name)}
                      className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                        directive.enabled ? 'border-cyan-400 text-cyan-400 bg-cyan-900/50' : 'border-gray-600 text-gray-600'
                      }`}
                    >
                      {directive.enabled ? '✓' : ''}
                    </button>
                    <div className="flex-1">
                      <div className={`text-[10px] font-mono ${directive.enabled ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {directive.name}
                      </div>
                      <div className="text-[8px] text-gray-600">{directive.description}</div>
                    </div>
                  </div>
                  
                  {directive.enabled && directive.name !== 'upgrade-insecure-requests' && (
                    <button
                      onClick={() => setActiveDirective(activeDirective === directive.name ? null : directive.name)}
                      className="text-[9px] text-gray-500 hover:text-cyan-400 px-2"
                    >
                      {activeDirective === directive.name ? '▼' : '▶'} EDIT
                    </button>
                  )}
                </div>

                {/* Values */}
                {directive.enabled && directive.values.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pl-6">
                    {directive.values.map(val => (
                      <span 
                        key={val}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-[9px] text-gray-300 font-mono"
                      >
                        {val}
                        <button 
                          onClick={() => removeValue(directive.name, val)}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Value Input */}
                {activeDirective === directive.name && (
                  <div className="mt-2 pl-6 space-y-2">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addValue(directive.name, newValue)}
                        placeholder="Add source..."
                        className="flex-1 bg-gray-900 border border-gray-700 px-2 py-1 text-[10px] text-white font-mono focus:border-cyan-500 outline-none"
                      />
                      <button
                        onClick={() => addValue(directive.name, newValue)}
                        className="px-2 py-1 bg-cyan-600 text-black text-[9px] hover:bg-cyan-500"
                      >
                        ADD
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {commonValues.slice(0, 6).map(cv => (
                        <button
                          key={cv.value}
                          onClick={() => addValue(directive.name, cv.value)}
                          className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-[8px] text-gray-400 hover:text-white hover:border-gray-600"
                          title={cv.desc}
                        >
                          {cv.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Output Format Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-500">FORMAT:</span>
            <button
              onClick={() => setOutputFormat('header')}
              className={`px-2 py-1 text-[9px] border ${outputFormat === 'header' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/30' : 'border-gray-700 text-gray-500'}`}
            >
              HTTP HEADER
            </button>
            <button
              onClick={() => setOutputFormat('meta')}
              className={`px-2 py-1 text-[9px] border ${outputFormat === 'meta' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/30' : 'border-gray-700 text-gray-500'}`}
            >
              META TAG
            </button>
          </div>

          {/* Output */}
          <div className="bg-gray-900 border border-gray-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-gray-500">GENERATED CSP</span>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-cyan-600 text-black text-[9px] hover:bg-cyan-500 transition-colors"
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
            <code className="block text-[10px] text-cyan-400 font-mono break-all leading-relaxed">
              {getOutput()}
            </code>
          </div>

          {/* Info */}
          <div className="text-[9px] text-gray-600 border-t border-gray-800 pt-3">
            <span className="text-cyan-400">ℹ</span> Content Security Policy helps prevent XSS and injection attacks. 
            Test thoroughly before deploying to production.
          </div>
        </div>
      </div>
    </div>
  );
};
