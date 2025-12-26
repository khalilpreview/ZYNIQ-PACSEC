import * as React from 'react';
import { useState, useEffect } from 'react';

interface JWTParts {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  errors: string[];
}

const base64UrlDecode = (str: string): string => {
  try {
    // Add padding if needed
    const pad = str.length % 4;
    const padded = pad ? str + '='.repeat(4 - pad) : str;
    // Replace URL-safe chars
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch {
    return '';
  }
};

const parseJWT = (token: string): JWTParts => {
  const errors: string[] = [];
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: '',
      isValid: false,
      errors: ['Invalid JWT format: Expected 3 parts separated by dots']
    };
  }

  let header = null;
  let payload = null;

  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch {
    errors.push('Invalid header: Could not parse as JSON');
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    errors.push('Invalid payload: Could not parse as JSON');
  }

  // Check expiration
  if (payload?.exp) {
    const expDate = new Date(payload.exp * 1000);
    if (expDate < new Date()) {
      errors.push(`Token expired: ${expDate.toISOString()}`);
    }
  }

  // Check not before
  if (payload?.nbf) {
    const nbfDate = new Date(payload.nbf * 1000);
    if (nbfDate > new Date()) {
      errors.push(`Token not valid yet: ${nbfDate.toISOString()}`);
    }
  }

  return {
    header,
    payload,
    signature: parts[2],
    isValid: errors.length === 0,
    errors
  };
};

const formatTimestamp = (ts: number): string => {
  return new Date(ts * 1000).toLocaleString();
};

const claimDescriptions: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
  name: 'Full Name',
  email: 'Email',
  role: 'Role',
  scope: 'Scope',
  permissions: 'Permissions',
};

export const JwtDebuggerCard: React.FC = () => {
  const [token, setToken] = useState('');
  const [parsed, setParsed] = useState<JWTParts | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'payload' | 'signature'>('payload');

  useEffect(() => {
    if (token.trim()) {
      setParsed(parseJWT(token.trim()));
    } else {
      setParsed(null);
    }
  }, [token]);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const loadSampleJWT = () => {
    // Create a sample JWT (not cryptographically valid, for demo)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const payload = btoa(JSON.stringify({
      sub: '1234567890',
      name: 'PAC-SEC User',
      email: 'user@pacsec.io',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'pacsec.io'
    })).replace(/=/g, '');
    const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setToken(`${header}.${payload}.${signature}`);
  };

  const getTimeStatus = (exp?: number, nbf?: number, iat?: number) => {
    const now = Date.now() / 1000;
    if (exp && exp < now) return { status: 'expired', color: 'text-red-400' };
    if (nbf && nbf > now) return { status: 'not-yet-valid', color: 'text-yellow-400' };
    if (exp) {
      const remaining = exp - now;
      if (remaining < 300) return { status: 'expiring-soon', color: 'text-orange-400' };
    }
    return { status: 'valid', color: 'text-green-400' };
  };

  return (
    <div className="w-full font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-pink-500 p-1 relative shadow-[4px_4px_0_0_rgba(236,72,153,0.4)]">
        
        {/* Header */}
        <div className="bg-pink-500 text-black p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span className="text-[10px] md:text-xs tracking-widest font-bold">JWT DEBUGGER</span>
          </div>
          <span className="text-[8px] bg-black text-pink-400 px-2 py-0.5 border border-pink-400/50">DECODER</span>
        </div>

        <div className="p-3 md:p-4 space-y-4">
          
          {/* Token Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-gray-500">PASTE JWT TOKEN</label>
              <button
                onClick={loadSampleJWT}
                className="text-[8px] text-pink-400 hover:text-pink-300"
              >
                LOAD SAMPLE
              </button>
            </div>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-24 bg-gray-900 border border-gray-700 px-3 py-2 text-[11px] text-pink-400 font-mono resize-none focus:border-pink-500 outline-none"
              spellCheck={false}
            />
          </div>

          {parsed && (
            <>
              {/* Status */}
              <div className={`flex items-center gap-2 px-3 py-2 border ${parsed.isValid ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'}`}>
                <span className={parsed.isValid ? 'text-green-400' : 'text-red-400'}>
                  {parsed.isValid ? '✓' : '✗'}
                </span>
                <span className={`text-[10px] ${parsed.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {parsed.isValid ? 'TOKEN STRUCTURE VALID' : parsed.errors.join(' | ')}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                {(['header', 'payload', 'signature'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] uppercase tracking-wider transition-colors ${
                      activeTab === tab 
                        ? 'text-pink-400 border-b-2 border-pink-400' 
                        : 'text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {tab}
                    {tab === 'header' && parsed.header && (
                      <span className="ml-1 text-gray-600">({parsed.header.alg})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-gray-900 border border-gray-700 p-3">
                {activeTab === 'header' && parsed.header && (
                  <div className="space-y-2">
                    {Object.entries(parsed.header).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-[9px] text-gray-500 w-12 flex-shrink-0">{key}</span>
                        <span className="text-[10px] text-pink-400 font-mono">{JSON.stringify(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'payload' && parsed.payload && (
                  <div className="space-y-2">
                    {Object.entries(parsed.payload).map(([key, value]) => {
                      const isTimestamp = ['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number';
                      const timeStatus = key === 'exp' || key === 'nbf' ? getTimeStatus(
                        parsed.payload.exp,
                        parsed.payload.nbf,
                        parsed.payload.iat
                      ) : null;
                      
                      return (
                        <div key={key} className="flex items-start gap-2">
                          <div className="w-24 flex-shrink-0">
                            <span className="text-[9px] text-gray-500">{key}</span>
                            {claimDescriptions[key] && (
                              <div className="text-[7px] text-gray-600">{claimDescriptions[key]}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-pink-400 font-mono break-all">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                            {isTimestamp && (
                              <div className={`text-[8px] ${key === 'exp' && timeStatus ? timeStatus.color : 'text-gray-500'}`}>
                                {formatTimestamp(value as number)}
                                {key === 'exp' && timeStatus && (
                                  <span className="ml-2">({timeStatus.status.toUpperCase()})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'signature' && (
                  <div className="space-y-3">
                    <div className="text-[10px] text-gray-400 font-mono break-all">
                      {parsed.signature}
                    </div>
                    <div className="text-[9px] text-gray-500 border-t border-gray-800 pt-3">
                      ⚠️ Signature verification requires the secret key or public key. 
                      This tool only decodes the token structure.
                    </div>
                    <button
                      onClick={() => copyToClipboard(parsed.signature, 'sig')}
                      className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-[9px] text-gray-400 hover:text-white transition-colors"
                    >
                      {copied === 'sig' ? '✓ COPIED' : 'COPY SIGNATURE'}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), 'payload')}
                  className="px-3 py-1.5 bg-pink-600 text-black text-[9px] hover:bg-pink-500 transition-colors"
                >
                  {copied === 'payload' ? '✓ COPIED' : 'COPY PAYLOAD JSON'}
                </button>
                <button
                  onClick={() => copyToClipboard(JSON.stringify({ header: parsed.header, payload: parsed.payload }, null, 2), 'full')}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-[9px] text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'full' ? '✓ COPIED' : 'COPY DECODED JSON'}
                </button>
              </div>
            </>
          )}

          {!parsed && token === '' && (
            <div className="text-center py-8 text-gray-600">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-[10px]">Paste a JWT token above to decode</div>
            </div>
          )}

          {/* Info */}
          <div className="text-[9px] text-gray-600 border-t border-gray-800 pt-3">
            <span className="text-pink-400">ℹ</span> This tool decodes JWT tokens client-side. 
            Your tokens are never sent to any server.
          </div>
        </div>
      </div>
    </div>
  );
};
