import * as React from 'react';
import { useState } from 'react';
import { generateSHA1 } from '../utils/cryptoUtils';

export const BreachRadarCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'EMAIL'>('PASSWORD');
  
  // Password Scan State
  const [password, setPassword] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ found: boolean, count: number } | null>(null);
  const [error, setError] = useState('');

  // Email Scan State
  const [email, setEmail] = useState('');

  const scanPassword = async () => {
      if (!password) return;
      setIsScanning(true);
      setResult(null);
      setError('');

      try {
          // 1. Hash the password with SHA-1
          const hash = await generateSHA1(password);
          const prefix = hash.substring(0, 5);
          const suffix = hash.substring(5);

          // 2. Query HIBP API (k-Anonymity)
          const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
          if (!response.ok) throw new Error("API UNREACHABLE");

          const text = await response.text();
          
          // 3. Parse result
          // Response format: SUFFIX:COUNT
          const lines = text.split('\n');
          const match = lines.find(line => line.toUpperCase().startsWith(suffix));
          
          if (match) {
              const count = parseInt(match.split(':')[1], 10);
              setResult({ found: true, count });
          } else {
              setResult({ found: false, count: 0 });
          }
      } catch (e) {
          setError("NETWORK ERROR: UNABLE TO REACH SCANNER NODES");
      }
      setIsScanning(false);
  };

  const scanEmail = () => {
      if (!email) return;
      // Redirect to HIBP official site for the specific email
      // This is the "Safe/Free" way to provide this service without API keys
      window.open(`https://haveibeenpwned.com/unifiedsearch/${encodeURIComponent(email)}`, '_blank');
  };

  return (
    <div className="w-full mt-4 animate-fade-in-up font-arcade">
        <div className="bg-black border-2 md:border-4 border-red-600 p-1 relative shadow-[4px_4px_0_0_rgba(220,38,38,0.4)]">
            
            {/* Header */}
            <div className="bg-red-600 text-white p-2 border-b-2 md:border-b-4 border-black flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl animate-pulse">☢️</span>
                    <span className="text-[10px] md:text-xs tracking-widest font-bold">BREACH RADAR</span>
                </div>
                <div className="flex bg-black border border-black p-0.5 gap-0.5">
                    <button 
                        onClick={() => setActiveTab('PASSWORD')}
                        className={`text-[8px] px-2 py-0.5 ${activeTab === 'PASSWORD' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-500'}`}
                    >
                        PASSWORDS
                    </button>
                    <button 
                        onClick={() => setActiveTab('EMAIL')}
                        className={`text-[8px] px-2 py-0.5 ${activeTab === 'EMAIL' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-500'}`}
                    >
                        EMAIL
                    </button>
                </div>
            </div>

            <div className="p-2 space-y-3">
                
                {activeTab === 'PASSWORD' && (
                    <>
                        <div>
                            <label className="text-[9px] text-red-400 block mb-1">PASSWORD CHECK (K-ANONYMITY SAFE)</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-xs p-2 focus:border-red-500 focus:outline-none placeholder-red-900/50"
                                placeholder="ENTER PASSWORD TO CHECK..."
                            />
                            <p className="text-[8px] text-gray-500 mt-1">
                                SECURE: ONLY FIRST 5 CHARS OF HASH SENT. PASSWORD NEVER LEAVES DEVICE.
                            </p>
                        </div>

                        <button 
                            onClick={scanPassword}
                            disabled={!password || isScanning}
                            className={`w-full py-2 border-2 text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:border-white shadow-[2px_2px_0_0_black] disabled:opacity-50 transition-all ${isScanning ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-red-600 border-red-600 text-white'}`}
                        >
                            {isScanning ? 'SCANNING DARK WEB...' : 'SCAN FOR LEAKS'}
                        </button>

                        {error && (
                             <div className="p-2 bg-red-900/20 border border-red-500 text-red-500 text-[9px] font-mono text-center animate-pulse">
                                {error}
                             </div>
                        )}

                        {result && (
                            <div className={`border-2 p-3 text-center ${result.found ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
                                <div className={`text-xl mb-1 ${result.found ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                    {result.found ? '⚠️ COMPROMISED ⚠️' : '✅ SAFE ✅'}
                                </div>
                                <div className={`font-mono text-xs ${result.found ? 'text-red-300' : 'text-green-300'}`}>
                                    {result.found 
                                        ? `FOUND IN ${result.count.toLocaleString()} DATA BREACHES. CHANGE IMMEDIATELY.`
                                        : 'NO MATCHES FOUND IN KNOWN BREACHES.'}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'EMAIL' && (
                    <>
                         <div>
                            <label className="text-[9px] text-red-400 block mb-1">EMAIL SEARCH</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white font-mono text-xs p-2 focus:border-red-500 focus:outline-none"
                                placeholder="name@example.com"
                            />
                        </div>
                        
                        <button 
                            onClick={scanEmail}
                            disabled={!email}
                            className="w-full py-2 bg-gray-800 border-2 border-gray-600 text-gray-300 text-[10px] uppercase font-bold tracking-wider hover:bg-red-600 hover:border-red-600 hover:text-white shadow-[2px_2px_0_0_black] disabled:opacity-50"
                        >
                            OPEN PUBLIC RECORDS SCAN
                        </button>
                        
                        <div className="p-2 border border-gray-800 bg-gray-900/50">
                            <p className="text-[8px] text-gray-400 font-mono text-center">
                                REDIRECTS TO OFFICIAL 'HAVE I BEEN PWNED' SEARCH.
                            </p>
                        </div>
                    </>
                )}

            </div>
        </div>
    </div>
  );
};