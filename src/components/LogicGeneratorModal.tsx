import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface LogicGeneratorModalProps {
  isOpen: boolean;
  payments?: Record<string, string>;
  onClose: () => void;
  onGenerate: (logic: string) => void;
}

export const LogicGeneratorModal: React.FC<LogicGeneratorModalProps> = ({
  isOpen,
  payments = {},
  onClose,
  onGenerate
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-logic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, payments })
      });
      
      if (!response.ok) throw new Error('Failed to generate logic');
      const data = await response.json();
      onGenerate(data.logic);
      setPrompt('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to generate logic. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-hall-900 rounded-2xl w-full max-w-lg shadow-2xl border border-hall-200 dark:border-hall-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex justify-between items-center bg-hall-50/50 dark:bg-hall-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-hall-900 dark:text-ink">AI Logic Generator</h2>
          </div>
          <button onClick={onClose} className="p-1 text-hall-500 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-hall-600 dark:text-hall-400">
            Describe what should happen when this event is triggered. The AI will generate the necessary JavaScript.
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Fetch weather data for the city in the input field and update the text element below it."
            className="w-full h-32 bg-hall-50 dark:bg-hall-950 border border-hall-200 dark:border-hall-800 rounded-xl p-3 text-sm text-hall-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder-hall-400"
          />
        </div>
        
        <div className="p-4 border-t border-hall-200 dark:border-hall-800 bg-hall-50/50 dark:bg-hall-950/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Logic
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
