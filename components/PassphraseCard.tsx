import * as React from 'react';
import { useState } from 'react';

// Diceware-style word list (subset for demo - expand as needed)
const WORDLIST = [
  'apple', 'brave', 'crane', 'delta', 'eagle', 'flame', 'grape', 'horse',
  'ivory', 'jolly', 'karma', 'lemon', 'mango', 'noble', 'ocean', 'piano',
  'queen', 'river', 'solar', 'tiger', 'ultra', 'vivid', 'whale', 'xenon',
  'yacht', 'zebra', 'amber', 'blaze', 'comet', 'drift', 'ember', 'frost',
  'ghost', 'haven', 'index', 'jumbo', 'knack', 'lunar', 'metro', 'nexus',
  'orbit', 'prism', 'quartz', 'radar', 'storm', 'torch', 'urban', 'vapor',
  'wrist', 'xerox', 'youth', 'zonal', 'arrow', 'beach', 'cloud', 'dream',
  'earth', 'flora', 'glory', 'heart', 'image', 'jewel', 'knife', 'light',
  'magic', 'night', 'omega', 'pearl', 'quest', 'realm', 'shine', 'truth',
  'unity', 'voice', 'water', 'xylot', 'yearn', 'zesty', 'alpha', 'bravo',
  'cyber', 'drone', 'epoch', 'forge', 'guild', 'hyper', 'intel', 'judge',
  'krypto', 'logic', 'macro', 'ninja', 'oxide', 'pixel', 'quake', 'royal',
  'sigma', 'titan', 'umbra', 'vault', 'wired', 'xpert', 'yield', 'zeros'
];

interface PassphraseCardProps {
  wordCount?: number;
  separator?: string;
  capitalize?: boolean;
  includeNumber?: boolean;
}

export const PassphraseCard: React.FC<PassphraseCardProps> = ({
  wordCount: initialWordCount = 4,
  separator: initialSeparator = '-',
  capitalize: initialCapitalize = true,
  includeNumber: initialIncludeNumber = false
}) => {
  const [wordCount, setWordCount] = useState(initialWordCount);
  const [separator, setSeparator] = useState(initialSeparator);
  const [capitalize, setCapitalize] = useState(initialCapitalize);
  const [includeNumber, setIncludeNumber] = useState(initialIncludeNumber);
  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);

  const generatePassphrase = () => {
    const words: string[] = [];
    const array = new Uint32Array(wordCount);
    crypto.getRandomValues(array);

    for (let i = 0; i < wordCount; i++) {
      let word = WORDLIST[array[i] % WORDLIST.length];
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }

    let result = words.join(separator);

    // Optionally append a random number
    if (includeNumber) {
      const numArray = new Uint8Array(1);
      crypto.getRandomValues(numArray);
      result += separator + (numArray[0] % 100).toString().padStart(2, '0');
    }

    setPassphrase(result);
    
    // Calculate entropy (log2 of possible combinations)
    const wordEntropy = Math.log2(WORDLIST.length) * wordCount;
    const numberEntropy = includeNumber ? Math.log2(100) : 0;
    setEntropy(Math.round(wordEntropy + numberEntropy));
  };

  const handleCopy = async () => {
    if (!passphrase) return;
    await navigator.clipboard.writeText(passphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate on mount
  React.useEffect(() => {
    generatePassphrase();
  }, []);

  return (
    <div className="bg-black/50 border border-pac-yellow/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-arcade text-pac-yellow uppercase tracking-widest">
          PASSPHRASE GENERATOR
        </span>
        <span className="text-[10px] font-mono text-green-400">
          {entropy} bits entropy
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-gray-500 block mb-1">Words</label>
          <select
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          >
            {[3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n} words</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-gray-500 block mb-1">Separator</label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
          >
            <option value="-">Dash (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
            <option value=" ">Space</option>
            <option value="">None</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={capitalize}
            onChange={(e) => setCapitalize(e.target.checked)}
            className="accent-pac-yellow"
          />
          <span className="text-gray-400">Capitalize</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumber}
            onChange={(e) => setIncludeNumber(e.target.checked)}
            className="accent-pac-yellow"
          />
          <span className="text-gray-400">Add Number</span>
        </label>
      </div>

      {/* Generated Passphrase */}
      <div className="bg-gray-900 rounded p-3 font-mono text-lg text-center break-all text-pac-ghostCyan">
        {passphrase || '---'}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={generatePassphrase}
          className="flex-1 px-4 py-2 bg-pac-yellow text-black font-arcade text-[10px] rounded hover:bg-white transition-colors"
        >
          🎲 REGENERATE
        </button>
        <button
          onClick={handleCopy}
          className={`flex-1 px-4 py-2 font-arcade text-[10px] rounded transition-colors ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {copied ? '✓ COPIED!' : '📋 COPY'}
        </button>
      </div>
    </div>
  );
};

export default PassphraseCard;
