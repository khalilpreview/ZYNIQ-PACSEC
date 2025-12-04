import * as React from 'react';
import { useState, useMemo } from 'react';
import createDOMPurify from 'dompurify';

export const SanitizeCard: React.FC = () => {
  const [input, setInput] = useState('');
  const [clean, setClean] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  // Initialize DOMPurify safely
  const DOMPurify = useMemo(() => {
      if (typeof window !== 'undefined') {
          return createDOMPurify(window);
      }
      return null;
  }, []);

  const handleSanitize = () => {
      if (DOMPurify && input) {
          const sanitized = DOMPurify.sanitize(input);
          setClean(sanitized);
      }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(clean);
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-blue-400 p-1 relative shadow-[4px_4px_0_0_rgba(96,165,250,0.4)]">
            
            {/* Header */}
            <div className="bg-blue-400 text-black p-2 border-b-2 md:border-b-4 border-black flex items-center gap-2 mb-2">
                <span className="text-xl">🧼</span>
                <span className="text-[10px] md:text-xs tracking-widest font-bold">HTML DECON (SANITIZER)</span>
            </div>

            <div className="p-2 space-y-3">
                {/* Input */}
                <div>
                    <label className="text-[9px] text-blue-400 block mb-1">DIRTY HTML INPUT</label>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-blue-100 font-mono text-xs p-2 h-24 focus:border-blue-400 focus:outline-none resize-none"
                        placeholder="<script>alert('xss')</script><b>Safe</b>"
                    />
                </div>

                <button 
                    onClick={handleSanitize}
                    disabled={!input}
                    className="w-full py-2 bg-blue-500 border-2 border-blue-500 text-black text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:border-white shadow-[2px_2px_0_0_black] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    PURIFY CONTENT
                </button>

                {/* Output */}
                {clean && (
                    <div className="bg-gray-900 border border-blue-900 p-2 relative">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] text-blue-500">CLEAN OUTPUT</span>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowRaw(!showRaw)}
                                    className="text-[8px] text-gray-400 underline hover:text-white"
                                >
                                    {showRaw ? 'SHOW RENDER' : 'SHOW RAW HTML'}
                                </button>
                                <button 
                                    onClick={handleCopy}
                                    className="text-[8px] border border-blue-500 text-blue-500 px-2 hover:bg-blue-500 hover:text-black uppercase"
                                >
                                    COPY
                                </button>
                             </div>
                         </div>
                         
                         <div className="bg-black p-2 border border-gray-800 min-h-[40px]">
                             {showRaw ? (
                                 <code className="text-xs text-green-400 font-mono break-all block">{clean}</code>
                             ) : (
                                 <div className="text-white font-sans text-sm" dangerouslySetInnerHTML={{ __html: clean }} />
                             )}
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};