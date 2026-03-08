const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `        </div>

        {/* Content */}`;
const replacement = `        </div>

        {/* State Toggles */}
        <div className="flex items-center justify-between bg-hall-100 dark:bg-hall-900 p-3 rounded-xl">
          <label className="text-xs font-bold text-hall-700 dark:text-hall-300 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            Hover State
          </label>
          <button
            onClick={() => setIsHoverMode(!isHoverMode)}
            className={\`w-8 h-4 rounded-full transition-colors relative \${isHoverMode ? 'bg-amber-500' : 'bg-hall-300 dark:bg-hall-700'}\`}
          >
            <div className={\`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all \${isHoverMode ? 'left-[18px]' : 'left-0.5'}\`} />
          </button>
        </div>

        {/* Content */}`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
