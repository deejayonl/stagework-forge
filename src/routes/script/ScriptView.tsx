import { Sparkles, Loader2, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFromBFF } from '../../shared/api/api-client';
import { useState, useEffect } from 'react';

const TERMINAL_LOGS = [
  "> Prepping microphone...",
  "> Tuning acoustics...",
  "> Drafting setlist...",
  "> Compacting ideas..."
];

function TerminalLoader() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev: number) => (prev < TERMINAL_LOGS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-hall-950 text-green-400 font-mono p-8 absolute inset-0 z-50">
      <div className="max-w-2xl w-full bg-hall-900/50 border border-hall-800 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6 border-b border-hall-800 pb-4">
          <Terminal size={20} className="text-hall-500" />
          <span className="text-hall-400 text-sm tracking-wider">SYSTEM.COMPILER</span>
        </div>
        <div className="space-y-3 min-h-[120px]">
          {TERMINAL_LOGS.slice(0, logIndex + 1).map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-sm md:text-base">
              <span className="text-indigo-400">{log.split(' ')[0]}</span>
              <span className="text-hall-300">{log.split(' ').slice(1).join(' ')}</span>
              {i === logIndex && (
                <span className="w-2 h-4 bg-green-400 animate-pulse inline-block ml-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ScriptView() {
  const navigate = useNavigate();
  const [scriptText, setScriptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!scriptText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetchFromBFF('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          script: scriptText,
          targets: ['Master Blueprint']
        })
      });
      
      setTimeout(() => {
        navigate('/studio', { state: { plan: response } });
      }, 2000);

    } catch (err: any) {
      console.error("Failed to generate executable plan:", err);
      setError(err.message || "Failed to generate plan. Please try again.");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <TerminalLoader />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-hall-950 text-ink relative isolate overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[40vh] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Header / Typography */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-hall-100 via-hall-300 to-hall-500 leading-tight">
          Great inputs make for even greater outputs.
        </h1>
        <p className="text-hall-400 mt-2 text-lg font-medium">
          Spend some time thinking about what it is you want to build. Jot down all your notes, features, and ideas.
        </p>
      </div>

      {/* Infinite Notepad Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col">
        {error && (
          <div className="absolute top-0 left-6 right-6 p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2 z-20">
            {error}
          </div>
        )}
        
        <textarea
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Start typing your vision here... e.g., 'I want a dark-mode SaaS dashboard for managing fitness clients. It needs a sidebar, a main metrics area with charts, and a recent activity feed...'"
          className="w-full h-full bg-transparent text-hall-100 placeholder:text-hall-700 resize-none outline-none text-xl leading-relaxed focus:ring-0 scrollbar-hide py-4"
          disabled={isGenerating}
          autoFocus
        />
      </div>

      {/* Floating Action Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-hall-900/80 backdrop-blur-xl border border-hall-800 p-2 rounded-2xl shadow-2xl z-20">
        
        <div className="flex gap-2 px-2">
          <button onClick={() => setScriptText("I want a sleek dark-mode SaaS dashboard for managing fitness clients. It needs a sidebar, a main metrics area with charts, and a recent activity feed.")} className="px-3 py-1.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors">
            SaaS Template
          </button>
          <button onClick={() => setScriptText("A minimalist portfolio for a photographer. Full-screen masonry grid, subtle fade-in animations, and a sleek contact modal.")} className="px-3 py-1.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors hidden sm:block">
            Portfolio Template
          </button>
        </div>
        <div className="w-px h-6 bg-hall-800 mx-2"></div>
        <div className="text-hall-500 text-sm font-medium px-2 min-w-[100px] text-right">
          {scriptText.length} chars
        </div>
  
        <button
          onClick={handleSubmit}
          disabled={!scriptText.trim() || isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>{isGenerating ? 'Compacting...' : 'Organize in Studio'}</span>
        </button>
      </div>
    </div>
  );
}
