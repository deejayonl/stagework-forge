import { Smartphone, Tablet, Monitor, Globe, LayoutDashboard, Terminal, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFromBFF } from '../../shared/api/api-client';
import { useState, useEffect, useRef } from 'react';

const TARGETS = [
  { id: 'mobile-phone', label: 'Mobile App (Phone)', icon: Smartphone },
  { id: 'mobile-tablet', label: 'Mobile App (Tablet)', icon: Tablet },
  { id: 'web-portfolio', label: 'Web Portfolio', icon: Globe },
  { id: 'web-landing', label: 'Business Landing Page', icon: Monitor },
  { id: 'saas-dashboard', label: 'Internal SaaS Dashboard', icon: LayoutDashboard },
  { id: 'macos-desktop', label: 'MacOS Desktop App', icon: Terminal },
  { id: 'windows-desktop', label: 'Windows Desktop App', icon: Terminal },
];

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
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['web-landing']);
  const [scriptText, setScriptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev: string[]) => 
      prev.includes(id) ? prev.filter((t: string) => t !== id) : [...prev, id]
    );
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [scriptText]);

  const handleSubmit = async () => {
    if (!scriptText.trim() || selectedTargets.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetchFromBFF('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          script: scriptText,
          targets: selectedTargets
        })
      });
      
      
      
      // Ensure the user sees at least some of the cool terminal logs
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
    <div className="w-full min-h-full flex flex-col bg-hall-950 text-ink p-2 sm:p-4 md:p-8 lg:p-12 relative isolate">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40vh] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-start relative z-10 pt-6 pb-20 sm:pt-10 sm:pb-24">
        
        {/* Typography & Slogan Section */}
        <div className="text-center mb-12 space-y-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-hall-100 via-hall-300 to-hall-500 leading-tight">
            Great inputs make for <br className="hidden md:block"/> even greater outputs.
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-hall-400 max-w-2xl mx-auto px-4 sm:px-0 font-medium leading-relaxed">
            Spend some time thinking about what it is you want to build. Jot down all your notes... etc
          </p>
        </div>

        {/* Device Target Sliding Window */}
        <div className="w-full max-w-3xl mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {TARGETS.map(({ id, label, icon: Icon }) => {
              const isSelected = selectedTargets.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleTarget(id)}
                  className={`snap-center shrink-0 flex items-center gap-2.5 px-4 py-3 min-h-[48px] rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isSelected 
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' 
                      : 'bg-hall-900/50 border-hall-800/50 text-hall-500 hover:text-hall-300 hover:bg-hall-800 hover:border-hall-700'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-indigo-400' : 'text-hall-500'} />
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Immersive Scripting Textarea */}
        <div className="w-full max-w-3xl relative group">
          {error && (
            <div className="absolute -top-12 left-0 w-full p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-hall-900/80 border border-hall-700/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col">
            <textarea
              ref={textareaRef}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Describe your vision here... e.g., 'I want a dark-mode SaaS dashboard for managing fitness clients. It needs a sidebar, a main metrics area with charts, and a recent activity feed.'"
              className="w-full min-h-[200px] bg-transparent text-hall-100 placeholder:text-hall-600 p-4 md:p-6 lg:p-8 resize-none outline-none text-base md:text-lg lg:text-xl leading-relaxed focus:ring-0"
              style={{ overflowY: 'auto' }}
              disabled={isGenerating}
            />
            
            <div className="flex items-center justify-between p-4 bg-hall-900/50 border-t border-hall-800/50">
              <div className="text-hall-500 text-sm font-medium px-4">
                {scriptText.length} characters
              </div>
              <button
                onClick={handleSubmit}
                disabled={!scriptText.trim() || selectedTargets.length === 0 || isGenerating}
                className="flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>{isGenerating ? 'Compacting...' : 'Compact & Generate'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

