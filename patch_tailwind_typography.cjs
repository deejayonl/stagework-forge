const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let content = fs.readFileSync(file, 'utf8');

const anchor = `        {/* Typography */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Typography</h4>`;

const generateSelectClasses = (prefix, options) => `
              <select 
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                onChange={(e) => {
                  if (onToggleClass) {
                    const classes = (selectedElement.className || '').split(' ');
                    classes.forEach(c => { if (c.startsWith('${prefix}')) onToggleClass(c, false); });
                    if (e.target.value) onToggleClass(e.target.value, true);
                  }
                }}
                value={(selectedElement.className || '').split(' ').find(c => c.startsWith('${prefix}')) || ''}
              >
                <option value="">default</option>
                {${JSON.stringify(options)}.map(v => <option key={v} value={v}>{v.replace('${prefix}', '')}</option>)}
              </select>
`;

const textSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'];
const fontWeights = ['font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'];
const textColors = ['text-transparent', 'text-current', 'text-black', 'text-white', 'text-gray-500', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-yellow-500', 'text-lime-500', 'text-green-500', 'text-emerald-500', 'text-teal-500', 'text-cyan-500', 'text-sky-500', 'text-blue-500', 'text-indigo-500', 'text-violet-500', 'text-purple-500', 'text-fuchsia-500', 'text-pink-500', 'text-rose-500'];

const injection = `        {/* Tailwind Typography */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Tailwind Typography</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Text Size</label>
              ${generateSelectClasses('text-', textSizes)}
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Font Weight</label>
              ${generateSelectClasses('font-', fontWeights)}
            </div>
          </div>

          <div className="space-y-2 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
            <label className="text-[10px] text-hall-500 font-bold">Text Alignment</label>
            <div className="flex gap-1">
              {['text-left', 'text-center', 'text-right', 'text-justify'].map(align => {
                const isActive = (selectedElement.className || '').split(' ').includes(align);
                return (
                  <button
                    key={align}
                    onClick={() => {
                      if (onToggleClass) {
                        ['text-left', 'text-center', 'text-right', 'text-justify'].forEach(a => {
                          if (a !== align && (selectedElement.className || '').split(' ').includes(a)) {
                            onToggleClass(a, false);
                          }
                        });
                        onToggleClass(align, !isActive);
                      }
                    }}
                    className={\`flex-1 text-[10px] py-1 rounded-md font-medium transition-all \${isActive ? 'bg-amber-500 text-white shadow-sm' : 'text-hall-500 hover:text-hall-700 dark:hover:text-hall-300'}\`}
                  >
                    {align.replace('text-', '')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-hall-500">Text Color</label>
            <select 
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              onChange={(e) => {
                if (onToggleClass) {
                  const classes = (selectedElement.className || '').split(' ');
                  classes.forEach(c => { 
                    if (c.startsWith('text-') && !['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl', 'text-left', 'text-center', 'text-right', 'text-justify'].includes(c)) {
                      onToggleClass(c, false); 
                    }
                  });
                  if (e.target.value) onToggleClass(e.target.value, true);
                }
              }}
              value={(selectedElement.className || '').split(' ').find(c => c.startsWith('text-') && !['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl', 'text-left', 'text-center', 'text-right', 'text-justify'].includes(c)) || ''}
            >
              <option value="">default</option>
              {${JSON.stringify(textColors)}.map(v => <option key={v} value={v}>{v.replace('text-', '')}</option>)}
            </select>
          </div>
        </div>

        {/* Inline Typography */}
        <div className="space-y-3 mt-4">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Inline Styles Typography</h4>`;

content = content.replace(anchor, injection);
fs.writeFileSync(file, content);
