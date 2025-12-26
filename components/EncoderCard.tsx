import * as React from 'react';
import { useState } from 'react';

type EncodingMode = 'base64' | 'hex' | 'url' | 'html';

export const EncoderCard: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<EncodingMode>('base64');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const processText = () => {
    setError('');
    try {
      let result = '';
      
      if (direction === 'encode') {
        switch (mode) {
          case 'base64':
            result = btoa(unescape(encodeURIComponent(input)));
            break;
          case 'hex':
            result = Array.from(new TextEncoder().encode(input))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            break;
          case 'url':
            result = encodeURIComponent(input);
            break;
          case 'html':
            result = input
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
            break;
        }
      } else {
        switch (mode) {
          case 'base64':
            result = decodeURIComponent(escape(atob(input)));
            break;
          case 'hex':
            const hexPairs = input.match(/.{1,2}/g) || [];
            result = hexPairs.map(h => String.fromCharCode(parseInt(h, 16))).join('');
            break;
          case 'url':
            result = decodeURIComponent(input);
            break;
          case 'html':
            const textarea = document.createElement('textarea');
            textarea.innerHTML = input;
            result = textarea.value;
            break;
        }
      }
      
      setOutput(result);
    } catch (e) {
      setError('Invalid input for selected encoding');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="bg-black/50 border border-pac-ghostCyan/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-arcade text-pac-ghostCyan uppercase tracking-widest">
          ENCODER / DECODER
        </span>
        <div className="flex gap-1">
          {(['base64', 'hex', 'url', 'html'] as EncodingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 text-[9px] font-mono uppercase rounded transition-colors ${
                mode === m 
                  ? 'bg-pac-ghostCyan text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Direction Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setDirection('encode')}
          className={`px-3 py-1 text-xs font-arcade rounded transition-colors ${
            direction === 'encode' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
              : 'text-gray-500'
          }`}
        >
          ENCODE
        </button>
        <button
          onClick={handleSwap}
          className="p-1 text-gray-500 hover:text-white transition-colors"
          title="Swap input/output"
        >
          ⇄
        </button>
        <button
          onClick={() => setDirection('decode')}
          className={`px-3 py-1 text-xs font-arcade rounded transition-colors ${
            direction === 'decode' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
              : 'text-gray-500'
          }`}
        >
          DECODE
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="text-[10px] text-gray-500 block mb-1">INPUT</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode/decode..."
          className="w-full h-24 bg-gray-900 border border-gray-700 rounded p-2 text-sm font-mono text-white placeholder-gray-600 resize-none focus:border-pac-ghostCyan focus:outline-none"
        />
      </div>

      {/* Process Button */}
      <button
        onClick={processText}
        className="w-full py-2 bg-pac-ghostCyan text-black font-arcade text-[11px] rounded hover:bg-white transition-colors"
      >
        {direction === 'encode' ? '→ ENCODE →' : '← DECODE ←'}
      </button>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-gray-500">OUTPUT</label>
          {error && <span className="text-[10px] text-red-400">{error}</span>}
        </div>
        <div className="relative">
          <textarea
            value={output}
            readOnly
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded p-2 text-sm font-mono text-pac-yellow resize-none"
            placeholder="Result will appear here..."
          />
          {output && (
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 px-2 py-1 text-[9px] font-arcade rounded transition-colors ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {copied ? '✓' : '📋'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncoderCard;
