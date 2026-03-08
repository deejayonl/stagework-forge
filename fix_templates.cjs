const fs = require('fs');
const FILE_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/routes/script/ScriptView.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf-8');

// Replace the imports to add LayoutTemplate and X
content = content.replace(
  /import { Sparkles, Loader2, Terminal } from 'lucide-react';/,
  "import { Sparkles, Loader2, Terminal, LayoutTemplate, X, FileCode2, ShoppingBag, TerminalSquare } from 'lucide-react';"
);

// Add the SCRIPT_TEMPLATES and State
content = content.replace(
  /const \[error, setError\] = useState<string \| null>\(null\);/,
  `const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const SCRIPT_TEMPLATES = [
    { title: "SaaS Dashboard", icon: LayoutTemplate, desc: "A sleek dark-mode dashboard for managing clients and metrics.", text: "I want a sleek dark-mode SaaS dashboard for managing fitness clients. It needs a sidebar, a main metrics area with charts, and a recent activity feed." },
    { title: "Minimalist Portfolio", icon: FileCode2, desc: "Full-screen masonry grid with subtle animations.", text: "A minimalist portfolio for a photographer. Full-screen masonry grid, subtle fade-in animations, and a sleek contact modal." },
    { title: "E-Commerce Store", icon: ShoppingBag, desc: "Modern storefront with product grid and cart.", text: "A modern e-commerce storefront for an apparel brand. Needs a hero section, a product grid with hover effects, and a slide-out shopping cart." },
    { title: "Link-in-Bio Page", icon: TerminalSquare, desc: "Mobile-first social links page with gradients.", text: "A mobile-first link-in-bio page for a creator. It should have a glassy blurred background, a profile avatar, social icon row, and large rounded buttons for links." }
  ];`
);

// Replace the two buttons with a single "Templates" button that toggles the modal
content = content.replace(
  /<div className="flex gap-2 px-2">\s*<button onClick=\{\(\) => setScriptText\("I want a sleek dark-mode SaaS dashboard for managing fitness clients\. It needs a sidebar, a main metrics area with charts, and a recent activity feed\."\)\} className="px-3 py-1\.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors">\s*SaaS Template\s*<\/button>\s*<button onClick=\{\(\) => setScriptText\("A minimalist portfolio for a photographer\. Full-screen masonry grid, subtle fade-in animations, and a sleek contact modal\."\)\} className="px-3 py-1\.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors hidden sm:block">\s*Portfolio Template\s*<\/button>\s*<\/div>/,
  `<div className="flex gap-2 px-2">
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hall-800 hover:bg-hall-700 text-hall-300 text-xs font-medium transition-colors">
            <LayoutTemplate size={14} />
            <span>Templates</span>
          </button>
        </div>`
);

// Add the Modal
content = content.replace(
  /<\/div>\n  \);\n}\n*$/,
  `
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
}`
);

fs.writeFileSync(FILE_PATH, content);
