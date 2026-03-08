const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `onUpdateStyle: (property: string, value: string) => void;`,
  `onUpdateStyle: (property: string, value: string) => void;\n  onToggleClass?: (className: string, toggle: boolean) => void;`
);

code = code.replace(
  `onUpdateStyle, \n  onUpdateText,`,
  `onUpdateStyle, \n  onToggleClass,\n  onUpdateText,`
);

// Add the Animation section before the bottom padding/div closure
code = code.replace(
  `        {/* Background */}`,
  `        {/* Animations & Interactions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Animations
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {['animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].map(anim => {
              const isActive = selectedElement.className?.includes(anim);
              return (
                <button
                  key={anim}
                  onClick={() => onToggleClass && onToggleClass(anim, !isActive)}
                  className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                >
                  {anim.replace('animate-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background */}`
);

fs.writeFileSync(path, code);
