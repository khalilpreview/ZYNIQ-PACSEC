import * as React from 'react';
import { useState } from 'react';

export type ThemeName = 'default' | 'crt' | 'cyberpunk' | 'matrix' | 'neon' | 'retro';

export interface Theme {
  name: ThemeName;
  label: string;
  icon: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    text: string;
  };
  cssVars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    name: 'default',
    label: 'Pac-Man Blue',
    icon: '👾',
    description: 'Classic arcade blue theme',
    colors: {
      primary: '#00bbd4',
      secondary: '#1a1a2e',
      accent: '#ffde03',
      bg: '#0f0f1a',
      text: '#ffffff'
    },
    cssVars: {
      '--pac-blue': '#00bbd4',
      '--pac-yellow': '#ffde03',
      '--pac-pink': '#ff6eb5',
      '--pac-orange': '#ff8800',
      '--pac-red': '#ff0000',
      '--pac-green': '#00ff88',
      '--scanline-opacity': '0.03'
    }
  },
  {
    name: 'crt',
    label: 'CRT Green',
    icon: '🖥️',
    description: 'Retro terminal phosphor glow',
    colors: {
      primary: '#33ff33',
      secondary: '#001100',
      accent: '#66ff66',
      bg: '#000800',
      text: '#33ff33'
    },
    cssVars: {
      '--pac-blue': '#33ff33',
      '--pac-yellow': '#99ff33',
      '--pac-pink': '#66ff99',
      '--pac-orange': '#88ff44',
      '--pac-red': '#ff3333',
      '--pac-green': '#44ff44',
      '--scanline-opacity': '0.1'
    }
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    icon: '🌆',
    description: 'Neon purple city nights',
    colors: {
      primary: '#ff00ff',
      secondary: '#120024',
      accent: '#00ffff',
      bg: '#0a0014',
      text: '#ffffff'
    },
    cssVars: {
      '--pac-blue': '#00ffff',
      '--pac-yellow': '#ffff00',
      '--pac-pink': '#ff00ff',
      '--pac-orange': '#ff6600',
      '--pac-red': '#ff0066',
      '--pac-green': '#00ff66',
      '--scanline-opacity': '0.05'
    }
  },
  {
    name: 'matrix',
    label: 'Matrix',
    icon: '🔢',
    description: 'Digital rain aesthetic',
    colors: {
      primary: '#00ff41',
      secondary: '#001100',
      accent: '#008f11',
      bg: '#000000',
      text: '#00ff41'
    },
    cssVars: {
      '--pac-blue': '#00ff41',
      '--pac-yellow': '#88ff00',
      '--pac-pink': '#00ff88',
      '--pac-orange': '#44ff00',
      '--pac-red': '#ff0000',
      '--pac-green': '#00ff00',
      '--scanline-opacity': '0.08'
    }
  },
  {
    name: 'neon',
    label: 'Neon Sunset',
    icon: '🌅',
    description: 'Synthwave sunset vibes',
    colors: {
      primary: '#ff6ec7',
      secondary: '#2a0845',
      accent: '#feca57',
      bg: '#1a0533',
      text: '#ffffff'
    },
    cssVars: {
      '--pac-blue': '#00d4ff',
      '--pac-yellow': '#feca57',
      '--pac-pink': '#ff6ec7',
      '--pac-orange': '#ff9f43',
      '--pac-red': '#ff4757',
      '--pac-green': '#7bed9f',
      '--scanline-opacity': '0.04'
    }
  },
  {
    name: 'retro',
    label: 'Retro Amber',
    icon: '📺',
    description: 'Warm amber monitor glow',
    colors: {
      primary: '#ffb000',
      secondary: '#1a1100',
      accent: '#ffd700',
      bg: '#0a0800',
      text: '#ffb000'
    },
    cssVars: {
      '--pac-blue': '#ffb000',
      '--pac-yellow': '#ffd700',
      '--pac-pink': '#ff8844',
      '--pac-orange': '#ff9900',
      '--pac-red': '#ff3300',
      '--pac-green': '#88ff00',
      '--scanline-opacity': '0.08'
    }
  }
];

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange
}) => {
  const [hovered, setHovered] = useState<ThemeName | null>(null);

  if (!isOpen) return null;

  const previewTheme = hovered ? themes.find(t => t.name === hovered) : themes.find(t => t.name === currentTheme);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="relative w-full max-w-2xl bg-gray-900 border-2 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up"
        style={{ borderColor: previewTheme?.colors.primary }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: previewTheme?.colors.primary + '40' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="font-arcade text-lg" style={{ color: previewTheme?.colors.primary }}>
                THEME SELECT
              </h2>
              <p className="text-xs text-gray-500">Choose your visual style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map(theme => {
            const isActive = currentTheme === theme.name;
            
            return (
              <button
                key={theme.name}
                onClick={() => {
                  onThemeChange(theme.name);
                  onClose();
                }}
                onMouseEnter={() => setHovered(theme.name)}
                onMouseLeave={() => setHovered(null)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                  isActive 
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900' 
                    : 'hover:scale-105'
                }`}
                style={{
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.bg,
                  boxShadow: isActive ? `0 0 20px ${theme.colors.primary}40` : 'none',
                  // @ts-ignore - ringColor is a valid Tailwind CSS variable
                  '--tw-ring-color': theme.colors.primary
                } as React.CSSProperties}
              >
                {/* Active badge */}
                {isActive && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-black text-sm font-bold"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    ✓
                  </div>
                )}

                {/* Theme preview bar */}
                <div className="flex gap-1 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                </div>

                {/* Icon */}
                <div className="text-3xl mb-2">{theme.icon}</div>

                {/* Name */}
                <div 
                  className="font-arcade text-sm mb-1"
                  style={{ color: theme.colors.primary }}
                >
                  {theme.label}
                </div>

                {/* Description */}
                <div 
                  className="text-[10px] opacity-70"
                  style={{ color: theme.colors.text }}
                >
                  {theme.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div 
          className="p-4 border-t"
          style={{ 
            borderColor: previewTheme?.colors.primary + '40',
            backgroundColor: previewTheme?.colors.bg
          }}
        >
          <div className="text-[10px] font-arcade mb-3" style={{ color: previewTheme?.colors.primary }}>
            PREVIEW
          </div>
          <div 
            className="p-4 rounded-lg border flex items-center gap-4"
            style={{ 
              borderColor: previewTheme?.colors.primary + '60',
              backgroundColor: previewTheme?.colors.secondary + '40'
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-arcade"
              style={{ 
                backgroundColor: previewTheme?.colors.primary,
                color: previewTheme?.colors.bg
              }}
            >
              P
            </div>
            <div className="flex-1">
              <div 
                className="font-medium text-sm"
                style={{ color: previewTheme?.colors.text }}
              >
                Sample Message
              </div>
              <div 
                className="text-xs opacity-70"
                style={{ color: previewTheme?.colors.text }}
              >
                This is how your chat will look with this theme
              </div>
            </div>
            <div 
              className="px-3 py-1.5 rounded-lg text-xs font-arcade"
              style={{ 
                backgroundColor: previewTheme?.colors.accent,
                color: previewTheme?.colors.bg
              }}
            >
              ACTION
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-black/30 text-center" style={{ borderColor: previewTheme?.colors.primary + '40' }}>
          <p className="text-[10px] text-gray-500">
            Theme preference is saved locally
          </p>
        </div>
      </div>
    </div>
  );
};

// Utility to apply theme CSS variables to document
export const applyTheme = (themeName: ThemeName) => {
  const theme = themes.find(t => t.name === themeName) || themes[0];
  const root = document.documentElement;
  
  Object.entries(theme.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Store preference
  localStorage.setItem('pac-sec-theme', themeName);
};

// Get saved theme from localStorage
export const getSavedTheme = (): ThemeName => {
  const saved = localStorage.getItem('pac-sec-theme');
  if (saved && themes.some(t => t.name === saved)) {
    return saved as ThemeName;
  }
  return 'default';
};
