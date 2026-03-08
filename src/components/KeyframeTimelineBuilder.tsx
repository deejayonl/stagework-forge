import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Trash2 } from 'lucide-react';

interface Keyframe {
  id: string;
  percentage: number;
  cssText: string;
}

interface KeyframeTimelineBuilderProps {
  initialKeyframes?: string;
  onSave: (keyframes: string) => void;
  onClose: () => void;
}

export const KeyframeTimelineBuilder: React.FC<KeyframeTimelineBuilderProps> = ({ initialKeyframes, onSave, onClose }) => {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [animationName, setAnimationName] = useState('customAnim');

  useEffect(() => {
    if (initialKeyframes) {
      // Very basic parser for initial keyframes string
      // e.g. @keyframes customAnim { 0% { opacity: 0; } 100% { opacity: 1; } }
      const nameMatch = initialKeyframes.match(/@keyframes\s+([a-zA-Z0-9_-]+)/);
      if (nameMatch) setAnimationName(nameMatch[1]);
      
      const frames: Keyframe[] = [];
      const regex = /([0-9]+)%|from|to\s*\{\s*([^}]+)\s*\}/g;
      let match;
      while ((match = regex.exec(initialKeyframes)) !== null) {
        let pct = 0;
        if (match[0].includes('from')) pct = 0;
        else if (match[0].includes('to')) pct = 100;
        else pct = parseInt(match[1]);
        
        frames.push({
          id: Math.random().toString(36).substr(2, 9),
          percentage: pct,
          cssText: match[2]?.trim() || ''
        });
      }
      
      if (frames.length > 0) {
        setKeyframes(frames.sort((a, b) => a.percentage - b.percentage));
      } else {
        setKeyframes([
          { id: '1', percentage: 0, cssText: 'opacity: 0; transform: scale(0.9);' },
          { id: '2', percentage: 100, cssText: 'opacity: 1; transform: scale(1);' }
        ]);
      }
    } else {
      setKeyframes([
        { id: '1', percentage: 0, cssText: 'opacity: 0; transform: translateY(20px);' },
        { id: '2', percentage: 100, cssText: 'opacity: 1; transform: translateY(0);' }
      ]);
    }
  }, [initialKeyframes]);

  const addKeyframe = () => {
    setKeyframes([...keyframes, { id: Math.random().toString(36).substr(2, 9), percentage: 50, cssText: '' }].sort((a, b) => a.percentage - b.percentage));
  };

  const updateKeyframe = (id: string, field: 'percentage' | 'cssText', value: any) => {
    setKeyframes(keyframes.map(kf => kf.id === id ? { ...kf, [field]: value } : kf).sort((a, b) => a.percentage - b.percentage));
  };

  const removeKeyframe = (id: string) => {
    setKeyframes(keyframes.filter(kf => kf.id !== id));
  };

  const handleSave = () => {
    let css = `@keyframes ${animationName} {\n`;
    keyframes.forEach(kf => {
      css += `  ${kf.percentage}% { ${kf.cssText} }\n`;
    });
    css += `}`;
    onSave(css);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-hall-50 dark:bg-hall-950 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-hall-200 dark:border-hall-800 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 bg-white dark:bg-black">
          <h2 className="text-lg font-bold text-hall-900 dark:text-ink flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-500" />
            Keyframe Timeline Builder
          </h2>
          <button onClick={onClose} className="p-2 text-hall-500 hover:text-hall-900 dark:hover:text-ink rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Animation Name</label>
            <input 
              type="text" 
              value={animationName} 
              onChange={(e) => setAnimationName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-3 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. bounceIn"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Timeline Nodes</label>
              <button onClick={addKeyframe} className="text-xs flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                <Plus className="w-3 h-3" /> Add Keyframe
              </button>
            </div>
            
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-hall-200 dark:before:bg-hall-800">
              {keyframes.map((kf, index) => (
                <div key={kf.id} className="flex gap-4 relative z-10 items-start">
                  <div className="flex flex-col items-center mt-2">
                    <div className="w-14 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-4 ring-hall-50 dark:ring-hall-950">
                      {kf.percentage}%
                    </div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={kf.percentage} 
                        onChange={(e) => updateKeyframe(kf.id, 'percentage', parseInt(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <button onClick={() => removeKeyframe(kf.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea 
                      value={kf.cssText}
                      onChange={(e) => updateKeyframe(kf.id, 'cssText', e.target.value)}
                      className="w-full bg-hall-50 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-lg p-2 text-xs font-mono text-hall-900 dark:text-ink focus:ring-1 focus:ring-indigo-500 outline-none resize-y min-h-[60px]"
                      placeholder="transform: scale(1.1); opacity: 1;"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-hall-200 dark:border-hall-800 bg-hall-100 dark:bg-hall-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-hall-700 dark:text-hall-300 hover:bg-hall-200 dark:hover:bg-hall-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all">
            Save Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
