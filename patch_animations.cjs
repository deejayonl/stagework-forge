const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `          <div className="grid grid-cols-2 gap-2">
            {['animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].map(anim => {`;

const replacement = `          <div className="flex items-center justify-between bg-hall-100 dark:bg-hall-900 p-3 rounded-xl mb-3">
            <label className="text-xs font-bold text-hall-700 dark:text-hall-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Animate on Scroll
            </label>
            <button
              onClick={() => onToggleClass && onToggleClass('animate-on-scroll', !selectedElement.className?.includes('animate-on-scroll'))}
              className={\`w-8 h-4 rounded-full transition-colors relative \${selectedElement.className?.includes('animate-on-scroll') ? 'bg-amber-500' : 'bg-hall-300 dark:bg-hall-700'}\`}
            >
              <div className={\`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all \${selectedElement.className?.includes('animate-on-scroll') ? 'left-[18px]' : 'left-0.5'}\`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].map(anim => {`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
