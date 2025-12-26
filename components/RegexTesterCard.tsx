import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

interface Match {
  index: number;
  length: number;
  text: string;
  groups?: Record<string, string>;
}

const commonPatterns = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
  { name: 'Date (ISO)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' },
  { name: 'Hex Color', pattern: '#[0-9A-Fa-f]{3,6}\\b' },
  { name: 'Credit Card', pattern: '\\b(?:\\d{4}[- ]?){3}\\d{4}\\b' },
];

export const RegexTesterCard: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [copied, setCopied] = useState(false);
  const [replaceWith, setReplaceWith] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const flagString = useMemo(() => 
    Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join(''),
    [flags]
  );

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flagString);
      setError(null);
      
      const found: Match[] = [];
      let match;
      
      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          found.push({
            index: match.index,
            length: match[0].length,
            text: match[0],
            groups: match.groups
          });
          if (match[0].length === 0) break; // Prevent infinite loop
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          found.push({
            index: match.index,
            length: match[0].length,
            text: match[0],
            groups: match.groups
          });
        }
      }
      
      setMatches(found);
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
    }
  }, [pattern, testString, flagString, flags.g]);

  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) return null;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`} className="text-gray-300">
            {testString.slice(lastIndex, match.index)}
          </span>
        );
      }
      // Add highlighted match
      parts.push(
        <span 
          key={`match-${i}`} 
          className="bg-green-500/30 text-green-400 border-b-2 border-green-500"
          title={`Match ${i + 1}: "${match.text}"`}
        >
          {match.text}
        </span>
      );
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < testString.length) {
      parts.push(
        <span key="text-end" className="text-gray-300">
          {testString.slice(lastIndex)}
        </span>
      );
    }
    
    return parts;
  }, [testString, matches]);

  const getReplacedText = (): string => {
    if (!pattern || !testString) return testString;
    try {
      const regex = new RegExp(pattern, flagString);
      return testString.replace(regex, replaceWith);
    } catch {
      return testString;
    }
  };

  const toggleFlag = (flag: 'g' | 'i' | 'm' | 's') => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const loadPattern = (p: string) => {
    setPattern(p);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flagString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full font-arcade animate-fade-in-up">
      <div className="bg-black border-2 md:border-4 border-lime-500 p-1 relative shadow-[4px_4px_0_0_rgba(132,204,22,0.4)]">
        
        {/* Header */}
        <div className="bg-lime-500 text-black p-1.5 md:p-2 border-b-2 md:border-b-4 border-black flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔎</span>
            <span className="text-[10px] md:text-xs tracking-widest font-bold">REGEX TESTER</span>
          </div>
          <span className="text-[8px] bg-black text-lime-400 px-2 py-0.5 border border-lime-400/50">LIVE</span>
        </div>

        <div className="p-3 md:p-4 space-y-4">
          
          {/* Pattern Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] text-gray-500">REGULAR EXPRESSION</label>
              <button
                onClick={copyToClipboard}
                className="text-[8px] text-lime-400 hover:text-lime-300"
              >
                {copied ? '✓ COPIED' : 'COPY REGEX'}
              </button>
            </div>
            <div className="flex items-center bg-gray-900 border border-gray-700 focus-within:border-lime-500">
              <span className="text-lime-500 px-2 text-lg">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className="flex-1 bg-transparent py-2 text-sm text-lime-400 font-mono focus:outline-none"
                spellCheck={false}
              />
              <span className="text-lime-500 px-1 text-lg">/</span>
              <span className="text-lime-400 pr-3 text-sm font-mono">{flagString}</span>
            </div>
            
            {error && (
              <div className="mt-2 text-[10px] text-red-400 bg-red-900/20 border border-red-500/30 px-2 py-1">
                ✗ {error}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] text-gray-500">FLAGS:</span>
            {[
              { key: 'g' as const, label: 'Global', desc: 'Find all matches' },
              { key: 'i' as const, label: 'Ignore Case', desc: 'Case insensitive' },
              { key: 'm' as const, label: 'Multiline', desc: '^ and $ match line starts/ends' },
              { key: 's' as const, label: 'Dotall', desc: '. matches newlines' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                title={f.desc}
                className={`px-2 py-1 text-[9px] border transition-colors ${
                  flags[f.key]
                    ? 'border-lime-500 text-lime-400 bg-lime-900/30'
                    : 'border-gray-700 text-gray-500'
                }`}
              >
                {f.key} <span className="text-[7px] opacity-70">({f.label})</span>
              </button>
            ))}
          </div>

          {/* Common Patterns */}
          <div>
            <label className="block text-[9px] text-gray-500 mb-2">COMMON PATTERNS</label>
            <div className="flex flex-wrap gap-1">
              {commonPatterns.map(p => (
                <button
                  key={p.name}
                  onClick={() => loadPattern(p.pattern)}
                  className="px-2 py-1 bg-gray-800 border border-gray-700 text-[8px] text-gray-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test String */}
          <div>
            <label className="block text-[9px] text-gray-500 mb-2">TEST STRING</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="w-full h-24 bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-gray-300 font-mono resize-none focus:border-lime-500 outline-none"
              spellCheck={false}
            />
          </div>

          {/* Highlighted Results */}
          {testString && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] text-gray-500">
                  MATCHES: <span className={matches.length > 0 ? 'text-lime-400' : 'text-gray-500'}>{matches.length}</span>
                </label>
              </div>
              <div className="bg-gray-900 border border-gray-700 p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[60px]">
                {highlightedText || <span className="text-gray-500">No matches</span>}
              </div>
            </div>
          )}

          {/* Match Details */}
          {matches.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 p-3 max-h-32 overflow-y-auto">
              <div className="text-[9px] text-gray-500 mb-2">MATCH DETAILS</div>
              <div className="space-y-1">
                {matches.slice(0, 10).map((match, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px]">
                    <span className="text-gray-600 w-6">#{i + 1}</span>
                    <span className="text-lime-400 font-mono">"{match.text}"</span>
                    <span className="text-gray-500">@ index {match.index}</span>
                  </div>
                ))}
                {matches.length > 10 && (
                  <div className="text-[9px] text-gray-500">...and {matches.length - 10} more</div>
                )}
              </div>
            </div>
          )}

          {/* Replace Toggle */}
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="w-full py-2 border border-gray-700 text-gray-500 hover:text-lime-400 hover:border-lime-500/50 text-[10px] transition-colors"
          >
            {showReplace ? '▼ HIDE' : '▶ SHOW'} REPLACE MODE
          </button>

          {showReplace && (
            <div className="space-y-3 border border-gray-700 p-3 bg-gray-900/50">
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">REPLACE WITH</label>
                <input
                  type="text"
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                  placeholder="Replacement text (use $1, $2 for groups)"
                  className="w-full bg-gray-900 border border-gray-700 px-2 py-1.5 text-sm text-white font-mono focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-gray-500 mb-1">RESULT</label>
                <div className="bg-gray-800 border border-gray-700 p-2 font-mono text-sm text-gray-300 whitespace-pre-wrap break-all min-h-[40px]">
                  {getReplacedText()}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-[9px] text-gray-600 border-t border-gray-800 pt-3">
            <span className="text-lime-400">ℹ</span> Real-time regex testing. 
            Matches are highlighted in green. Use capture groups with $1, $2 in replace.
          </div>
        </div>
      </div>
    </div>
  );
};
