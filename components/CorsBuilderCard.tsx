import * as React from 'react';
import { useState } from 'react';

interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
}

const defaultConfig: CORSConfig = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  allowCredentials: false,
  maxAge: 86400,
  preflightContinue: false,
};

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
const commonHeaders = [
  'Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With',
  'X-Api-Key', 'X-Auth-Token', 'Cache-Control', 'If-None-Match', 'Range'
];

export const CorsBuilderCard: React.FC = () => {
  const [config, setConfig] = useState<CORSConfig>(defaultConfig);
  const [copied, setCopied] = useState<string | null>(null);
  const [newOrigin, setNewOrigin] = useState('');
  const [newHeader, setNewHeader] = useState('');
  const [newExposedHeader, setNewExposedHeader] = useState('');
  const [outputFormat, setOutputFormat] = useState<'express' | 'nginx' | 'apache' | 'headers'>('express');

  const toggleMethod = (method: string) => {
    setConfig(prev => ({
      ...prev,
      allowedMethods: prev.allowedMethods.includes(method)
        ? prev.allowedMethods.filter(m => m !== method)
        : [...prev.allowedMethods, method]
    }));
  };

  const addOrigin = () => {
    if (!newOrigin.trim() || config.allowedOrigins.includes(newOrigin.trim())) return;
    // Remove wildcard if adding specific origin
    const origins = config.allowedOrigins.filter(o => o !== '*');
    setConfig(prev => ({ ...prev, allowedOrigins: [...origins, newOrigin.trim()] }));
    setNewOrigin('');
  };

  const removeOrigin = (origin: string) => {
    setConfig(prev => ({
      ...prev,
      allowedOrigins: prev.allowedOrigins.filter(o => o !== origin)
    }));
  };

  const setWildcardOrigin = () => {
    setConfig(prev => ({ ...prev, allowedOrigins: ['*'] }));
  };

  const addHeader = (header: string, type: 'allowed' | 'exposed') => {
    if (!header.trim()) return;
    const key = type === 'allowed' ? 'allowedHeaders' : 'exposedHeaders';
    if (config[key].includes(header.trim())) return;
    setConfig(prev => ({ ...prev, [key]: [...prev[key], header.trim()] }));
    if (type === 'allowed') setNewHeader('');
    else setNewExposedHeader('');
  };

  const removeHeader = (header: string, type: 'allowed' | 'exposed') => {
    const key = type === 'allowed' ? 'allowedHeaders' : 'exposedHeaders';
    setConfig(prev => ({ ...prev, [key]: prev[key].filter(h => h !== header) }));
  };

  const generateOutput = (): string => {
    const origins = config.allowedOrigins.join(', ');
    const methods = config.allowedMethods.join(', ');
    const headers = config.allowedHeaders.join(', ');
    const exposed = config.exposedHeaders.join(', ');

    switch (outputFormat) {
      case 'express':
        return `const cors = require('cors');

app.use(cors({
  origin: ${config.allowedOrigins.length === 1 && config.allowedOrigins[0] === '*' 
    ? "'*'" 
    : `[${config.allowedOrigins.map(o => `'${o}'`).join(', ')}]`},
  methods: [${config.allowedMethods.map(m => `'${m}'`).join(', ')}],
  allowedHeaders: [${config.allowedHeaders.map(h => `'${h}'`).join(', ')}],${
    config.exposedHeaders.length > 0 ? `\n  exposedHeaders: [${config.exposedHeaders.map(h => `'${h}'`).join(', ')}],` : ''
  }
  credentials: ${config.allowCredentials},
  maxAge: ${config.maxAge},
  preflightContinue: ${config.preflightContinue}
}));`;

      case 'nginx':
        return `# NGINX CORS Configuration
location /api/ {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '${origins}';
        add_header 'Access-Control-Allow-Methods' '${methods}';
        add_header 'Access-Control-Allow-Headers' '${headers}';${
          config.allowCredentials ? "\n        add_header 'Access-Control-Allow-Credentials' 'true';" : ''
        }
        add_header 'Access-Control-Max-Age' ${config.maxAge};
        add_header 'Content-Length' 0;
        return 204;
    }
    
    add_header 'Access-Control-Allow-Origin' '${origins}' always;${
      exposed ? `\n    add_header 'Access-Control-Expose-Headers' '${exposed}' always;` : ''
    }${config.allowCredentials ? "\n    add_header 'Access-Control-Allow-Credentials' 'true' always;" : ''}
}`;

      case 'apache':
        return `# Apache CORS Configuration (.htaccess)
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "${config.allowedOrigins[0]}"
    Header always set Access-Control-Allow-Methods "${methods}"
    Header always set Access-Control-Allow-Headers "${headers}"${
      config.allowCredentials ? '\n    Header always set Access-Control-Allow-Credentials "true"' : ''
    }${exposed ? `\n    Header always set Access-Control-Expose-Headers "${exposed}"` : ''}
    Header always set Access-Control-Max-Age "${config.maxAge}"
</IfModule>

# Handle preflight OPTIONS requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]`;

      case 'headers':
      default:
        return `Access-Control-Allow-Origin: ${origins}
Access-Control-Allow-Methods: ${methods}
Access-Control-Allow-Headers: ${headers}${
  exposed ? `\nAccess-Control-Expose-Headers: ${exposed}` : ''
}${config.allowCredentials ? '\nAccess-Control-Allow-Credentials: true' : ''}
Access-Control-Max-Age: ${config.maxAge}`;
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-orange-500 p-1 relative shadow-[4px_4px_0_0_rgba(249,115,22,0.4)]">
        
        {/* Header */}
        <div className="bg-orange-500 text-black p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="text-[10px] md:text-xs tracking-widest font-bold">CORS BUILDER</span>
          </div>
          <span className="text-[8px] bg-black text-orange-400 px-2 py-0.5 border border-orange-400/50">CROSS-ORIGIN</span>
        </div>

        <div className="p-3 md:p-4 space-y-4">
          
          {/* Allowed Origins */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-gray-500">ALLOWED ORIGINS</label>
              <button
                onClick={setWildcardOrigin}
                className="text-[8px] text-orange-400 hover:text-orange-300"
              >
                SET WILDCARD (*)
              </button>
            </div>
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOrigin()}
                placeholder="https://example.com"
                className="flex-1 bg-gray-900 border border-gray-700 px-2 py-1.5 text-[10px] text-white font-mono focus:border-orange-500 outline-none"
              />
              <button
                onClick={addOrigin}
                className="px-3 py-1.5 bg-orange-600 text-black text-[9px] hover:bg-orange-500"
              >
                ADD
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {config.allowedOrigins.map(origin => (
                <span 
                  key={origin}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-900/30 border border-orange-500/30 text-[9px] text-orange-400 font-mono"
                >
                  {origin}
                  <button onClick={() => removeOrigin(origin)} className="text-red-400 hover:text-red-300 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Allowed Methods */}
          <div>
            <label className="block text-[9px] text-gray-500 mb-2">ALLOWED METHODS</label>
            <div className="flex flex-wrap gap-1">
              {httpMethods.map(method => (
                <button
                  key={method}
                  onClick={() => toggleMethod(method)}
                  className={`px-2 py-1 text-[9px] border transition-colors ${
                    config.allowedMethods.includes(method)
                      ? 'border-orange-500 text-orange-400 bg-orange-900/30'
                      : 'border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Allowed Headers */}
          <div>
            <label className="block text-[9px] text-gray-500 mb-2">ALLOWED HEADERS</label>
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                value={newHeader}
                onChange={(e) => setNewHeader(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHeader(newHeader, 'allowed')}
                placeholder="X-Custom-Header"
                className="flex-1 bg-gray-900 border border-gray-700 px-2 py-1 text-[10px] text-white font-mono focus:border-orange-500 outline-none"
              />
              <button
                onClick={() => addHeader(newHeader, 'allowed')}
                className="px-2 py-1 bg-orange-600 text-black text-[9px] hover:bg-orange-500"
              >
                ADD
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {commonHeaders.filter(h => !config.allowedHeaders.includes(h)).slice(0, 5).map(header => (
                <button
                  key={header}
                  onClick={() => addHeader(header, 'allowed')}
                  className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-[8px] text-gray-400 hover:text-white"
                >
                  + {header}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {config.allowedHeaders.map(header => (
                <span 
                  key={header}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 border border-gray-700 text-[9px] text-gray-300 font-mono"
                >
                  {header}
                  <button onClick={() => removeHeader(header, 'allowed')} className="text-red-400 hover:text-red-300">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">MAX AGE (seconds)</label>
              <input
                type="number"
                value={config.maxAge}
                onChange={(e) => setConfig(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 0 }))}
                className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 text-[10px] text-white font-mono focus:border-orange-500 outline-none"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowCredentials}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowCredentials: e.target.checked }))}
                  className="w-3 h-3 accent-orange-500"
                />
                <span className="text-[9px] text-gray-400">Allow Credentials</span>
              </label>
            </div>
          </div>

          {/* Output Format */}
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] text-gray-500 self-center mr-2">OUTPUT:</span>
            {(['express', 'nginx', 'apache', 'headers'] as const).map(format => (
              <button
                key={format}
                onClick={() => setOutputFormat(format)}
                className={`px-2 py-1 text-[9px] border uppercase ${
                  outputFormat === format
                    ? 'border-orange-500 text-orange-400 bg-orange-900/30'
                    : 'border-gray-700 text-gray-500'
                }`}
              >
                {format}
              </button>
            ))}
          </div>

          {/* Output */}
          <div className="bg-gray-900 border border-gray-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-gray-500">GENERATED CONFIG</span>
              <button
                onClick={() => copyToClipboard(generateOutput(), 'output')}
                className="px-2 py-1 bg-orange-600 text-black text-[9px] hover:bg-orange-500 transition-colors"
              >
                {copied === 'output' ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
            <pre className="text-[9px] text-orange-400 font-mono whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
              {generateOutput()}
            </pre>
          </div>

          {/* Warning for credentials + wildcard */}
          {config.allowCredentials && config.allowedOrigins.includes('*') && (
            <div className="text-[9px] text-red-400 bg-red-900/20 border border-red-500/30 p-2">
              ⚠️ Cannot use wildcard (*) origin with credentials. Browsers will block this.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
