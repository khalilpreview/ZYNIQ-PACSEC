import * as React from 'react';
import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Open Command Palette / Menu', category: 'Navigation' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close Modal / Cancel', category: 'Navigation' },
  
  // Chat
  { keys: ['Enter'], description: 'Send Message', category: 'Chat' },
  { keys: ['Ctrl', 'L'], description: 'Clear Chat History', category: 'Chat' },
  { keys: ['Ctrl', 'E'], description: 'Export Chat', category: 'Chat' },
  
  // Tools
  { keys: ['Ctrl', 'Shift', 'P'], description: 'Generate Password', category: 'Tools' },
  { keys: ['Ctrl', 'Shift', 'J'], description: 'Generate JWT Secret', category: 'Tools' },
  { keys: ['Ctrl', 'Shift', 'U'], description: 'Generate UUID', category: 'Tools' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'New Secure Note', category: 'Tools' },
  
  // Theme
  { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Theme', category: 'Appearance' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Toggle Sound Effects', category: 'Appearance' },
];

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) acc[shortcut.category] = [];
  acc[shortcut.category].push(shortcut);
  return acc;
}, {} as Record<string, Shortcut[]>);

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-2xl w-full bg-gray-900 border-2 border-pac-yellow rounded-xl overflow-hidden shadow-[0_0_60px_rgba(242,201,76,0.2)] animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-pac-yellow text-black p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⌨️</span>
            <span className="font-arcade text-sm tracking-widest">KEYBOARD SHORTCUTS</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/20 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-arcade text-xs text-pac-yellow mb-3 tracking-widest">{category.toUpperCase()}</h3>
                <div className="space-y-2">
                  {items.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 bg-black/30 border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <span className="text-xs text-gray-400">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-gray-600 text-xs">+</span>}
                            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-white min-w-[24px] text-center">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-3 bg-black/30">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px]">Esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
