import React, { useState, useEffect } from 'react';

interface ThemeEditorProps {
  theme?: Record<string, string>;
  onUpdateTheme: (theme: Record<string, string>) => void;
  onClose: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme = {}, onUpdateTheme, onClose }) => {
  const [localTheme, setLocalTheme] = useState<Record<string, string>>({
    primary: theme.primary || '#3b82f6',
    secondary: theme.secondary || '#64748b',
    accent: theme.accent || '#8b5cf6',
    fontFamily: theme.fontFamily || 'Inter',
  });

  useEffect(() => {
    setLocalTheme({
      primary: theme.primary || '#3b82f6',
      secondary: theme.secondary || '#64748b',
      accent: theme.accent || '#8b5cf6',
      fontFamily: theme.fontFamily || 'Inter',
    });
  }, [theme]);

  const handleChange = (key: string, value: string) => {
    const newTheme = { ...localTheme, [key]: value };
    setLocalTheme(newTheme);
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
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Colors</h4>
          
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
              <label className="text-sm font-medium text-hall-700 dark:text-hall-300">Google Font</label>
              <select 
                value={localTheme.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Fira Code">Fira Code (Monospace)</option>
              </select>
            </div>
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
