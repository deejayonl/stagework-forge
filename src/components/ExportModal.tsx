import * as React from 'react';
import { useState } from 'react';
import { Download, X, Code2, FileJson, Globe, Github } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (framework: string) => void;
  onDeploy?: (framework: string, provider: string) => void;
  projectName: string;
}

const FRAMEWORKS = [
  { id: 'vite', name: 'React + Vite', icon: <Code2 className="w-5 h-5" />, desc: 'Production-ready React application with Tailwind CSS.' },
  { id: 'html', name: 'HTML / Tailwind', icon: <Globe className="w-5 h-5" />, desc: 'Simple static HTML file with embedded Tailwind CSS.' },
  { id: 'nextjs', name: 'Next.js', icon: <FileJson className="w-5 h-5" />, desc: 'Full-stack Next.js app router setup with Tailwind CSS.' },
  { id: 'vue', name: 'Vue 3', icon: <Code2 className="w-5 h-5" />, desc: 'Vue 3 Single File Component setup with Tailwind CSS.' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, onDeploy }) => {
  const [framework, setFramework] = useState('vite');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-black w-full max-w-2xl rounded-2xl shadow-2xl border border-hall-200 dark:border-hall-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-hall-200 dark:border-hall-800">
          <h2 className="text-xl font-bold text-hall-900 dark:text-ink flex items-center gap-2">
            <Download className="w-6 h-6 text-indigo-500" />
            Export Project
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-hall-400 hover:text-hall-900 dark:hover:text-ink transition-colors rounded-lg hover:bg-hall-100 dark:hover:bg-hall-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Framework Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-hall-900 dark:text-ink uppercase tracking-wider">1. Choose Format</h3>
            <div className="space-y-3">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    framework === fw.id 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' 
                      : 'border-hall-200 dark:border-hall-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-hall-50 dark:hover:bg-hall-900/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${framework === fw.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-hall-100 dark:bg-hall-800 text-hall-500 dark:text-hall-400'}`}>
                    {fw.icon}
                  </div>
                  <div>
                    <div className={`font-bold ${framework === fw.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-hall-900 dark:text-ink'}`}>
                      {fw.name}
                    </div>
                    <div className="text-xs text-hall-500 dark:text-hall-400 mt-1">
                      {fw.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-hall-900 dark:text-ink uppercase tracking-wider">2. Export Action</h3>
            
            <div className="bg-hall-50 dark:bg-hall-900/50 rounded-xl p-5 border border-hall-200 dark:border-hall-800 space-y-4">
              <button 
                onClick={() => onExport(framework)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download ZIP
              </button>
              <p className="text-xs text-center text-hall-500 dark:text-hall-400">
                Downloads a complete ZIP file with all source code and assets.
              </p>
            </div>

            {onDeploy && (
              <div className="bg-hall-50 dark:bg-hall-900/50 rounded-xl p-5 border border-hall-200 dark:border-hall-800 space-y-4">
                <button 
                  onClick={() => onDeploy(framework, 'vercel')}
                  className="w-full py-3 px-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
                  Deploy to Vercel
                </button>

                <button 
                  onClick={() => onDeploy(framework, 'netlify')}
                  className="w-full py-3 px-4 bg-[#00c7b7] hover:bg-[#00b3a4] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 115 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M57.5 115C89.2564 115 115 89.2564 115 57.5C115 25.7436 89.2564 0 57.5 0C25.7436 0 0 25.7436 0 57.5C0 89.2564 25.7436 115 57.5 115Z" fill="currentColor"/><path d="M25 57.5L57.5 25L90 57.5L57.5 90L25 57.5Z" fill="white"/></svg>
                  Deploy to Netlify
                </button>
                
                <button 
                  onClick={() => onDeploy(framework, 'github')}
                  className="w-full py-3 px-4 bg-[#24292e] dark:bg-hall-800 hover:bg-[#1b1f23] dark:hover:bg-hall-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Push to GitHub
                </button>
                <p className="text-xs text-center text-hall-500 dark:text-hall-400">
                  Instantly deploy your project to a live URL.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
