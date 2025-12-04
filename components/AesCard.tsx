import * as React from 'react';
import { useState } from 'react';
import { encryptAES, decryptAES } from '../utils/cryptoUtils';

export const AesCard: React.FC = () => {
  const [mode, setMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const process = async () => {
    if (!input || !password) return;
    setIsProcessing(true);
    setError('');
    try {
        if (mode === 'ENCRYPT') {
            const result = await encryptAES(input, password);
            setOutput(result);
        } else {
            const result = await decryptAES(input, password);
            setOutput(result);
        }
    } catch (err) {
        setError('OPERATION FAILED: INVALID KEY OR CORRUPT DATA');
        setOutput('');
    }
    setIsProcessing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-emerald-500 p-1 relative shadow-[4px_4px_0_0_rgba(16,185,129,0.4)]">
            
            {/* Header */}
            <div className="bg-emerald-500 text-black p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <span className="text-[10px] md:text-xs tracking-widest font-bold">AES-256-GCM ENIGMA</span>
                </div>
                <div className="flex bg-black border border-black p-0.5 gap-0.5">
                    <button 
                        onClick={() => { setMode('ENCRYPT'); setOutput(''); setError(''); }}
                        className={`text-[8px] px-2 py-0.5 ${mode === 'ENCRYPT' ? 'bg-emerald-500 text-black' : 'bg-gray-900 text-gray-500'}`}
                    >
                        ENC
                    </button>
                    <button 
                        onClick={() => { setMode('DECRYPT'); setOutput(''); setError(''); }}
                        className={`text-[8px] px-2 py-0.5 ${mode === 'DECRYPT' ? 'bg-emerald-500 text-black' : 'bg-gray-900 text-gray-500'}`}
                    >
                        DEC
                    </button>
                </div>
            </div>

            <div className="p-2 space-y-3">
                {/* Inputs */}
                <div>
                    <label className="text-[9px] text-emerald-600 block mb-1">
                        {mode === 'ENCRYPT' ? 'PLAINTEXT' : 'ENCRYPTED PAYLOAD'}
                    </label>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-emerald-100 font-mono text-xs p-2 h-20 focus:border-emerald-500 focus:outline-none resize-none"
                        placeholder={mode === 'ENCRYPT' ? "ENTER TEXT TO SECURE..." : "PASTE ENCRYPTED STRING..."}
                    />
                </div>

                <div>
                    <label className="text-[9px] text-emerald-600 block mb-1">PASSPHRASE</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-xs p-2 focus:border-emerald-500 focus:outline-none"
                        placeholder="ENCRYPTION KEY..."
                    />
                </div>

                <button 
                    onClick={process}
                    disabled={!input || !password || isProcessing}
                    className={`w-full py-2 border-2 text-[10px] uppercase font-bold tracking-wider transition-all shadow-[2px_2px_0_0_black] ${!input || !password ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 border-emerald-500 text-black hover:bg-white hover:border-white'}`}
                >
                    {isProcessing ? 'PROCESSING...' : mode}
                </button>

                {/* Output */}
                {error && (
                    <div className="p-2 bg-red-900/20 border border-red-500 text-red-500 text-[9px] font-mono text-center animate-pulse">
                        {error}
                    </div>
                )}

                {output && (
                    <div className="relative group">
                        <div className="bg-gray-900 border border-emerald-800 p-2">
                             <div className="text-[9px] text-emerald-700 mb-1">OUTPUT RESULT</div>
                             <div className="font-mono text-xs text-emerald-300 break-all leading-relaxed">
                                 {output}
                             </div>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className={`absolute top-2 right-2 text-[8px] px-2 py-0.5 border uppercase ${copied ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-black'}`}
                        >
                            {copied ? 'COPIED' : 'COPY'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};