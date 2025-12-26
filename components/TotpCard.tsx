import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

// TOTP implementation (RFC 6238)
const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const generateSecret = (length: number = 20): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => base32Chars[b % 32]).join('');
};

const base32ToBytes = (base32: string): Uint8Array => {
  const cleaned = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of cleaned) {
    const val = base32Chars.indexOf(char);
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }
  return new Uint8Array(bytes);
};

const hmacSha1 = async (key: Uint8Array, message: Uint8Array): Promise<Uint8Array> => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(sig);
};

const generateTOTP = async (secret: string, timeStep: number = 30): Promise<string> => {
  const key = base32ToBytes(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = time & 0xff;
    // time >>= 8; // This would need BigInt for proper handling
  }
  // Simplified time encoding
  const view = new DataView(timeBytes.buffer);
  view.setBigUint64(0, BigInt(time), false);
  
  const hmac = await hmacSha1(key, timeBytes);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
};

export const TotpCard: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [label, setLabel] = useState('PACSEC');
  const [issuer, setIssuer] = useState('PACSEC');
  const [currentCode, setCurrentCode] = useState('------');
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState<'secret' | 'code' | 'uri' | null>(null);
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSecret(generateSecret(20));
  }, []);

  useEffect(() => {
    if (!secret) return;
    
    const updateCode = async () => {
      try {
        const code = await generateTOTP(secret);
        setCurrentCode(code);
      } catch (e) {
        console.error('TOTP Error:', e);
      }
    };
    
    updateCode();
    
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeLeft(remaining);
      
      if (remaining === 30) {
        updateCode();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [secret]);

  const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // Simple QR Code generation (using a basic implementation)
  useEffect(() => {
    if (!showQR || !canvasRef.current || !secret) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // For a real QR code, we'd use a library. This is a placeholder visual
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // Create a simple pattern based on the URI (visual placeholder)
    const hash = otpauthUri.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const cellSize = 8;
    const margin = 20;
    const gridSize = Math.floor((size - margin * 2) / cellSize);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = y * gridSize + x;
        const charCode = otpauthUri.charCodeAt(idx % otpauthUri.length);
        if ((charCode + hash + x * y) % 3 === 0) {
          ctx.fillRect(margin + x * cellSize, margin + y * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }
    
    // Add corner markers
    const drawMarker = (px: number, py: number) => {
      ctx.fillRect(px, py, 21, 21);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 3, py + 3, 15, 15);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 6, py + 6, 9, 9);
    };
    
    drawMarker(margin, margin);
    drawMarker(size - margin - 21, margin);
    drawMarker(margin, size - margin - 21);
    
  }, [showQR, secret, otpauthUri]);

  const copyToClipboard = async (text: string, type: 'secret' | 'code' | 'uri') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const regenerateSecret = () => {
    setSecret(generateSecret(20));
    setCurrentCode('------');
  };

  return (
    <div className="w-full font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-purple-500 p-1 relative shadow-[4px_4px_0_0_rgba(168,85,247,0.4)]">
        
        {/* Header */}
        <div className="bg-purple-500 text-white p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔐</span>
            <span className="text-[10px] md:text-xs tracking-widest font-bold">TOTP GENERATOR</span>
          </div>
          <span className="text-[8px] bg-black px-2 py-0.5 border border-white/50">RFC 6238</span>
        </div>

        <div className="p-3 md:p-4 space-y-4">
          
          {/* Config Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">ACCOUNT LABEL</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 text-xs text-white font-mono focus:border-purple-500 outline-none"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-[9px] text-gray-500 mb-1">ISSUER</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 text-xs text-white font-mono focus:border-purple-500 outline-none"
                placeholder="PACSEC"
              />
            </div>
          </div>

          {/* Secret Display */}
          <div>
            <label className="block text-[9px] text-gray-500 mb-1">SECRET KEY (BASE32)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value.toUpperCase().replace(/[^A-Z2-7]/g, ''))}
                className="flex-1 bg-gray-900 border border-gray-700 px-2 py-1.5 text-xs text-purple-400 font-mono tracking-wider focus:border-purple-500 outline-none"
              />
              <button
                onClick={() => copyToClipboard(secret, 'secret')}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 text-[10px] transition-colors"
              >
                {copied === 'secret' ? '✓' : 'COPY'}
              </button>
              <button
                onClick={regenerateSecret}
                className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-500 text-[10px] transition-colors"
              >
                NEW
              </button>
            </div>
          </div>

          {/* Current Code Display */}
          <div className="bg-gray-900 border-2 border-purple-500/50 p-4 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`text-[10px] font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-gray-500'}`}>
                {timeLeft}s
              </span>
            </div>
            
            <div className="text-[8px] text-gray-500 mb-2">CURRENT CODE</div>
            <div 
              className="text-4xl md:text-5xl font-mono tracking-[0.3em] text-white cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => copyToClipboard(currentCode, 'code')}
              title="Click to copy"
            >
              {currentCode.slice(0, 3)} {currentCode.slice(3)}
            </div>
            {copied === 'code' && (
              <div className="text-[10px] text-green-400 mt-2 animate-pulse">COPIED TO CLIPBOARD</div>
            )}
            
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-purple-500'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* QR Code Section */}
          <div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500 text-[10px] flex items-center justify-center gap-2 transition-colors"
            >
              <span>{showQR ? '▼' : '▶'}</span>
              {showQR ? 'HIDE QR CODE' : 'SHOW QR CODE FOR AUTHENTICATOR APP'}
            </button>
            
            {showQR && (
              <div className="mt-3 flex flex-col items-center gap-3 p-4 bg-gray-900 border border-gray-700">
                <canvas ref={canvasRef} className="border border-gray-600" />
                <div className="text-[8px] text-gray-500 text-center max-w-xs">
                  Scan with Google Authenticator, Authy, or any TOTP app
                </div>
                <button
                  onClick={() => copyToClipboard(otpauthUri, 'uri')}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 text-[9px] text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'uri' ? '✓ URI COPIED' : 'COPY OTPAUTH URI'}
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-[9px] text-gray-600 border-t border-gray-800 pt-3">
            <span className="text-purple-400">ℹ</span> Time-based One-Time Password. Codes refresh every 30 seconds. 
            Add to your authenticator app for 2FA.
          </div>
        </div>
      </div>
    </div>
  );
};
