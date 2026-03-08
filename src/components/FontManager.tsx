import React, { useState } from 'react';

const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Poppins", "Playfair Display", "Merriweather", "Fira Code",
  "Nunito", "Raleway", "Ubuntu", "Oswald", "Outfit",
  "Plus Jakarta Sans", "Work Sans", "Rubik", "Quicksand",
  "Lora", "PT Serif", "Noto Serif", "Crimson Pro", "Space Grotesk",
  "Space Mono", "JetBrains Mono", "DM Sans", "Manrope", "Syne",
  "Bebas Neue", "Anton", "Josefin Sans", "Cabin", "Karla",
  "Pacifico", "Dancing Script", "Caveat", "Satisfy", "Cinzel",
  "Cormorant Garamond", "Abril Fatface", "Righteous", "Permanent Marker"
].sort();

interface FontManagerProps {
  customFonts: string[];
  onUpdateFonts: (fonts: string[]) => void;
  onClose: () => void;
}

export const FontManager: React.FC<FontManagerProps> = ({ customFonts = [], onUpdateFonts, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFonts = GOOGLE_FONTS.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleFont = (font: string) => {
    if (customFonts.includes(font)) {
      onUpdateFonts(customFonts.filter(f => f !== font));
    } else {
      onUpdateFonts([...customFonts, font]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-hall-950 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-hall-200 dark:border-hall-800">
        <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-hall-900 dark:text-ink">Font Manager</h2>
            <p className="text-xs text-hall-500">Select Google Fonts to make available in your project</p>
          </div>
          <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">
            ✕
          </button>
        </div>
        
        <div className="p-4 border-b border-hall-200 dark:border-hall-800">
          <input 
            type="text" 
            placeholder="Search fonts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-hall-50 dark:bg-black/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredFonts.map(font => (
              <button
                key={font}
                onClick={() => toggleFont(font)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  customFonts.includes(font)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                    : 'border-hall-200 dark:border-hall-800 bg-white dark:bg-hall-900 hover:border-hall-300 dark:hover:border-hall-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-hall-500">{font}</span>
                  {customFonts.includes(font) && (
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">✓</span>
                  )}
                </div>
                <div 
                  className="text-lg text-hall-900 dark:text-ink truncate"
                  style={{ fontFamily: `"${font}", sans-serif` }}
                >
                  Ag
                </div>
              </button>
            ))}
          </div>
          {filteredFonts.length === 0 && (
            <div className="text-center py-8 text-hall-500 text-sm">
              No fonts found matching "{searchTerm}"
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-hall-200 dark:border-hall-800 bg-white dark:bg-hall-950 flex justify-between items-center">
          <div className="text-xs text-hall-500">
            {customFonts.length} font{customFonts.length !== 1 ? 's' : ''} selected
          </div>
          <button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontManager;
