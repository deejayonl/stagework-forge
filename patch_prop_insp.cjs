const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldText = `                  {anim.replace('animate-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
        </div>`;

const newText = `                  {anim.replace('animate-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
          
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Transitions</h4>
          <div className="grid grid-cols-2 gap-2">
            {['transition-all', 'transition-colors', 'transition-opacity', 'transition-transform'].map(trans => {
              const isActive = selectedElement.className?.includes(trans);
              return (
                <button
                  key={trans}
                  onClick={() => onToggleClass && onToggleClass(trans, !isActive)}
                  className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                >
                  {trans.replace('transition-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['duration-150', 'duration-300', 'duration-500', 'duration-700'].map(dur => {
              const isActive = selectedElement.className?.includes(dur);
              return (
                <button
                  key={dur}
                  onClick={() => onToggleClass && onToggleClass(dur, !isActive)}
                  className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                >
                  {dur.replace('duration-', '')}ms
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
        </div>`;

content = content.replace(oldText, newText);

// Also update the Events & Actions text hint
const oldHint = `Actions: <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">setVariable:key:value</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">toggleVariable:key</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">alert:message</code>`;
const newHint = `Actions: <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">navigate:page</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">setVariable:k:v</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">toggleVariable:k</code>`;
content = content.replace(oldHint, newHint);

fs.writeFileSync(path, content);
console.log('Patched PropertyInspector.tsx');
