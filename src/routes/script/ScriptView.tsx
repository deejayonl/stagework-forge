import { Sparkles, Loader2, Terminal, LayoutTemplate, X, FileCode2, ShoppingBag, TerminalSquare } from 'lucide-react';
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
  const [showTemplates, setShowTemplates] = useState(false);

  const SCRIPT_TEMPLATES = [
    { title: "SaaS Dashboard", icon: LayoutTemplate, desc: "A sleek dark-mode dashboard for managing clients and metrics.", text: `SaaS Dashboard Blueprint

1. What is the primary purpose of this dashboard?
[ e.g., Manage fitness clients, track financial metrics, monitor server health... ]

2. What key metrics need to be visible on the main overview?
[ e.g., MRR, Active Users, Churn Rate... ]

3. What navigation links should be in the sidebar?
[ e.g., Overview, Users, Settings, Billing... ]

4. Any specific styling preferences?
[ e.g., Dark mode, neon green accents, glassmorphism... ]` },
    { title: "Minimalist Portfolio", icon: FileCode2, desc: "Full-screen masonry grid with subtle animations.", text: `Minimalist Portfolio Blueprint

1. Who is this portfolio for?
[ e.g., Photographer, 3D Artist, Copywriter... ]

2. How should the work be displayed?
[ e.g., Full-screen masonry grid, horizontal scroll, single column... ]

3. What sections are required?
[ e.g., Hero introduction, Selected Works, About Me, Contact Form... ]

4. What is the desired vibe or animation style?
[ e.g., Monospaced fonts, subtle fade-ins, stark black and white... ]` },
    { title: "E-Commerce Store", icon: ShoppingBag, desc: "Modern storefront with product grid and cart.", text: `E-Commerce Store Blueprint

1. What type of products are being sold?
[ e.g., Luxury apparel, digital courses, handmade ceramics... ]

2. What are the key features of the product grid?
[ e.g., Hover to see alternate image, quick add-to-cart, filter sidebar... ]

3. Do you need specific components like a promotional banner or newsletter signup?
[ e.g., Yes, a scrolling marquee at the top and a footer signup... ]

4. What is the brand's primary color palette?
[ e.g., Earth tones, bold primary colors, pastel minimalism... ]` },
    { title: "Link-in-Bio Page", icon: TerminalSquare, desc: "Mobile-first social links page with gradients.", text: `Link-in-Bio Blueprint

1. Who is the creator or brand?
[ e.g., Twitch Streamer, Indie Musician, Local Bakery... ]

2. What are the top 3-5 links that need to be featured?
[ e.g., Latest YouTube video, Merch Store, Discord server, Spotify... ]

3. What social icons should be included at the bottom?
[ e.g., Instagram, TikTok, X (Twitter)... ]

4. Describe the background visual.
[ e.g., Animated gradient, blurred photo, solid dark color... ]` }
  ];

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

      {/* Main Header / Typography - Hides when typing starts to create an immersive notepad */}
      <div className={`w-full max-w-5xl mx-auto px-6 flex-shrink-0 transition-all duration-500 ease-in-out ${scriptText.trim().length > 0 ? 'opacity-0 h-0 overflow-hidden pt-0 pb-0' : 'opacity-100 pt-12 pb-4'}`}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-hall-100 via-hall-300 to-hall-500 leading-tight">
          Great inputs make for even greater outputs.
        </h1>
        <p className="text-hall-400 mt-2 text-lg font-medium">
          Spend some time thinking about what it is you want to build. Jot down all your notes, features, and ideas.
        </p>
      </div>

      {/* Infinite Notepad Area */}
      <div className={`flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col transition-all duration-500 ${scriptText.trim().length > 0 ? 'pt-12' : ''}`}>
        {error && (
          <div className="absolute top-0 left-6 right-6 p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center animate-in fade-in slide-in-from-top-2 z-20">
            {error}
          </div>
        )}
        
        <textarea id="script-textarea" value={scriptText}
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
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors">
            <LayoutTemplate size={14} />
            <span>Templates</span>
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
    
      {/* Templates Modal Overlay */}
      {showTemplates && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-hall-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-hall-900 border border-hall-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-hall-800/50 bg-hall-900/50">
              <h3 className="text-hall-100 font-semibold flex items-center gap-2">
                <LayoutTemplate size={18} className="text-indigo-400" />
                Script Templates
              </h3>
              <button onClick={() => setShowTemplates(false)} className="text-hall-500 hover:text-hall-300 transition-colors p-1 rounded-md hover:bg-hall-800">
                <X size={18} />
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto flex flex-col gap-2 scrollbar-hide">
              {SCRIPT_TEMPLATES.map((tpl, i) => {
                const Icon = tpl.icon;
                return (
                  <button 
                    key={i} 
                    onClick={() => { setScriptText(tpl.text); setShowTemplates(false); }} 
                    className="w-full text-left p-4 hover:bg-hall-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-hall-700/50 flex gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-hall-800 flex items-center justify-center text-hall-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-hall-100 font-medium">{tpl.title}</span>
                      <span className="text-hall-400 text-sm leading-relaxed">{tpl.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}