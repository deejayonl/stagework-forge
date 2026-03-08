import React, { useState, useEffect } from 'react';
import { generatePalette } from '../utils/colors';

interface ThemeEditorProps {
  theme?: Record<string, string>;
  onUpdateTheme: (theme: Record<string, string>) => void;
  onClose: () => void;
}

const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Poppins", "Playfair Display", "Merriweather", "Fira Code"
];

const FONT_PRESETS = [
  { name: "Modern Tech", heading: "Inter", body: "Inter" },
  { name: "Elegant Serif", heading: "Playfair Display", body: "Lato" },
  { name: "Friendly & Round", heading: "Poppins", body: "Open Sans" },
  { name: "Editorial", heading: "Merriweather", body: "Inter" },
  { name: "Bold & Clean", heading: "Montserrat", body: "Roboto" },
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme = {}, onUpdateTheme, onClose }) => {
  const [localTheme, setLocalTheme] = useState<Record<string, string>>({
    primary: theme.primary || '#3b82f6',
    secondary: theme.secondary || '#64748b',
    accent: theme.accent || '#8b5cf6',
    fontFamily: theme.fontFamily || 'Inter',
    headingFontFamily: theme.headingFontFamily || theme.fontFamily || 'Inter',
  });

  useEffect(() => {
    setLocalTheme({
      primary: theme.primary || '#3b82f6',
      secondary: theme.secondary || '#64748b',
      accent: theme.accent || '#8b5cf6',
      fontFamily: theme.fontFamily || 'Inter',
      headingFontFamily: theme.headingFontFamily || theme.fontFamily || 'Inter',
    });
  }, [theme]);

  const handleChange = (key: string, value: string) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleGeneratePalette = () => {
    const { secondary, accent } = generatePalette(localTheme.primary);
    setLocalTheme(prev => ({ ...prev, secondary, accent }));
  };

  const applyFontPreset = (heading: string, body: string) => {
    setLocalTheme(prev => ({ ...prev, headingFontFamily: heading, fontFamily: body }));
  };

  const handleApply = () => {
    onUpdateTheme(localTheme);
  };

  return (
    <div className="w-80 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 sticky top-0 bg-inherit z-10">
        <h3 className="text-sm font-bold text-hall-900 dark:text-ink">Global Theme</h3>
        <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">
          ✕
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-hall-200 dark:border-hall-800 pb-1">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider">Colors</h4>
            <button 
              onClick={handleGeneratePalette}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              title="Generate complementary colors from Primary"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Auto-Generate
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Primary</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={localTheme.primary} 
                  onChange={(e) => handleChange('primary', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={localTheme.primary} 
                  onChange={(e) => handleChange('primary', e.target.value)}
                  className="w-20 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1 text-xs text-hall-900 dark:text-ink uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Secondary</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={localTheme.secondary} 
                  onChange={(e) => handleChange('secondary', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={localTheme.secondary} 
                  onChange={(e) => handleChange('secondary', e.target.value)}
                  className="w-20 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1 text-xs text-hall-900 dark:text-ink uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Accent</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={localTheme.accent} 
                  onChange={(e) => handleChange('accent', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={localTheme.accent} 
                  onChange={(e) => handleChange('accent', e.target.value)}
                  className="w-20 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1 text-xs text-hall-900 dark:text-ink uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Typography</h4>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Heading Font</label>
              <select 
                value={localTheme.headingFontFamily}
                onChange={(e) => handleChange('headingFontFamily', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Body Font</label>
              <select 
                value={localTheme.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Font Presets</h4>
          <div className="grid grid-cols-1 gap-2">
            {FONT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyFontPreset(preset.heading, preset.body)}
                className="text-left px-3 py-2 rounded border border-hall-200 dark:border-hall-800 hover:bg-hall-100 dark:hover:bg-hall-900 transition-colors text-xs"
              >
                <div className="font-bold text-hall-900 dark:text-ink">{preset.name}</div>
                <div className="text-hall-500 dark:text-hall-400 mt-0.5">
                  {preset.heading} / {preset.body}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleApply}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"></path></svg>
          Apply Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeEditor;
