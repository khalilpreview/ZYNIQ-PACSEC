import * as React from 'react';
import { useState } from 'react';
import { encryptAES, decryptAES, generateSecureHex } from '../utils/cryptoUtils';

export const GhostLinkCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'OPEN'>('CREATE');
  
  // Create State
  const [input, setInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Open State
  const [linkInput, setLinkInput] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [error, setError] = useState('');
  
  // Create Link Logic
  const handleCreate = async () => {
      if (!input) return;
      setIsProcessing(true);
      
      // 1. Generate random key
      const key = generateSecureHex(256); // 32 bytes = 256 bits
      
      // 2. Encrypt input with key
      try {
          const encrypted = await encryptAES(input, key);
          
          // 3. Construct Link: [CurrentURL]?ghost=[encrypted]#[key]
          // Using window.location.origin to simulate a real link structure
          const params = new URLSearchParams();
          params.set('p', encrypted); // Payload
          
          // We put key in hash so it's technically not sent to server (if we had one)
          const fakeLink = `${window.location.origin}/#ghost?d=${encodeURIComponent(encrypted)}&k=${key}`;
          setGeneratedLink(fakeLink);
      } catch (e) {
          console.error(e);
      }
      setIsProcessing(false);
  };

  // Open Link Logic
  const handleOpen = async () => {
      setError('');
      setDecryptedContent('');
      
      if (!linkInput) return;
      
      try {
          // Parse the fake link
          // Expected format: .../#ghost?d=...&k=...
          // For simplicity in this tool, we just look for d= and k= params in the string
          
          const urlObj = new URL(linkInput);
          const hash = urlObj.hash; // #ghost?d=...&k=...
          
          if (!hash.includes('ghost')) {
              throw new Error("INVALID LINK FORMAT");
          }
          
          const queryString = hash.split('?')[1];
          const params = new URLSearchParams(queryString);
          const encryptedData = params.get('d');
          const key = params.get('k');
          
          if (!encryptedData || !key) {
               throw new Error("MISSING PAYLOAD OR KEY");
          }
          
          const decrypted = await decryptAES(decodeURIComponent(encryptedData), key);
          setDecryptedContent(decrypted);
          
      } catch (e) {
          setError("DECRYPTION FAILED: LINK CORRUPT OR KEY INVALID");
      }
  };
  
  const copyLink = () => {
      navigator.clipboard.writeText(generatedLink);
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-violet-500 p-1 relative shadow-[4px_4px_0_0_rgba(139,92,246,0.4)]">
            
            {/* Header */}
            <div className="bg-violet-500 text-black p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">👻</span>
                    <span className="text-[10px] md:text-xs tracking-widest font-bold">GHOST LINK (PASTEBIN)</span>
                </div>
                <div className="flex bg-black border border-black p-0.5 gap-0.5">
                    <button 
                        onClick={() => setActiveTab('CREATE')}
                        className={`text-[8px] px-2 py-0.5 ${activeTab === 'CREATE' ? 'bg-violet-500 text-black' : 'bg-gray-900 text-gray-500'}`}
                    >
                        CREATE
                    </button>
                    <button 
                        onClick={() => setActiveTab('OPEN')}
                        className={`text-[8px] px-2 py-0.5 ${activeTab === 'OPEN' ? 'bg-violet-500 text-black' : 'bg-gray-900 text-gray-500'}`}
                    >
                        OPEN
                    </button>
                </div>
            </div>

            <div className="p-2 space-y-3">
                
                {activeTab === 'CREATE' && (
                    <>
                        <div>
                            <label className="text-[9px] text-violet-400 block mb-1">SECRET CONTENT</label>
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-violet-100 font-mono text-xs p-2 h-24 focus:border-violet-500 focus:outline-none resize-none"
                                placeholder="ENTER TEXT TO SHARE SECURELY..."
                            />
                            <p className="text-[8px] text-gray-500 mt-1">DATA IS ENCRYPTED IN URL. NO SERVER STORAGE.</p>
                        </div>

                        <button 
                            onClick={handleCreate}
                            disabled={!input || isProcessing}
                            className="w-full py-2 bg-violet-600 border-2 border-violet-600 text-black text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:border-white shadow-[2px_2px_0_0_black] disabled:opacity-50"
                        >
                            {isProcessing ? 'ENCRYPTING...' : 'GENERATE SECURE LINK'}
                        </button>
                        
                        {generatedLink && (
                            <div className="mt-2 bg-gray-900 border border-violet-800 p-2">
                                <label className="text-[9px] text-violet-400 block mb-1">SHAREABLE GHOST LINK</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={generatedLink} 
                                        className="flex-1 bg-black border border-gray-700 text-[9px] text-gray-300 p-1 font-mono"
                                    />
                                    <button 
                                        onClick={copyLink}
                                        className="text-[9px] px-3 bg-violet-500 text-black border border-violet-500 hover:bg-white"
                                    >
                                        COPY
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'OPEN' && (
                    <>
                         <div>
                            <label className="text-[9px] text-violet-400 block mb-1">PASTE GHOST LINK</label>
                            <input 
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-xs p-2 focus:border-violet-500 focus:outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        
                        <button 
                            onClick={handleOpen}
                            disabled={!linkInput}
                            className="w-full py-2 bg-gray-800 border-2 border-gray-600 text-gray-300 text-[10px] uppercase font-bold tracking-wider hover:bg-violet-600 hover:border-violet-600 hover:text-black shadow-[2px_2px_0_0_black]"
                        >
                            DECRYPT & VIEW
                        </button>
                        
                        {error && (
                            <div className="p-2 bg-red-900/20 border border-red-500 text-red-500 text-[9px] font-mono text-center animate-pulse">
                                {error}
                            </div>
                        )}
                        
                        {decryptedContent && (
                            <div className="bg-black border-2 border-green-500 p-3 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]">
                                <div className="text-[9px] text-green-500 mb-1">DECRYPTED PAYLOAD</div>
                                <div className="font-mono text-sm text-green-300 break-all whitespace-pre-wrap">
                                    {decryptedContent}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    </div>
  );
};