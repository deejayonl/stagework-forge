const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let content = fs.readFileSync(file, 'utf8');

const anchor = `        {/* Layout */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Layout</h4>`;

const injection = `        {/* Tailwind Layout */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Tailwind Layout</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] text-hall-500 font-bold">Display</label>
            <div className="flex bg-hall-100 dark:bg-hall-900 p-1 rounded-lg gap-1">
              {['block', 'flex', 'grid', 'hidden'].map(mode => {
                const isActive = (selectedElement.className || '').split(' ').includes(mode);
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (onToggleClass) {
                        ['block', 'flex', 'grid', 'hidden'].forEach(m => {
                          if (m !== mode && (selectedElement.className || '').split(' ').includes(m)) {
                            onToggleClass(m, false);
                          }
                        });
                        onToggleClass(mode, !isActive);
                      }
                    }}
                    className={\`flex-1 text-[10px] py-1 rounded-md font-medium transition-all \${isActive ? 'bg-amber-500 text-white shadow-sm' : 'text-hall-500 hover:text-hall-700 dark:hover:text-hall-300'}\`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {((selectedElement.className || '').split(' ').includes('flex') || (selectedElement.className || '').split(' ').includes('inline-flex')) && (
            <div className="space-y-2 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
              <label className="text-[10px] text-hall-500 font-bold">Flex Direction</label>
              <div className="grid grid-cols-2 gap-1">
                {['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'].map(dir => {
                  const isActive = (selectedElement.className || '').split(' ').includes(dir);
                  return (
                    <button
                      key={dir}
                      onClick={() => {
                        if (onToggleClass) {
                          ['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'].forEach(d => {
                            if (d !== dir && (selectedElement.className || '').split(' ').includes(d)) {
                              onToggleClass(d, false);
                            }
                          });
                          onToggleClass(dir, !isActive);
                        }
                      }}
                      className={\`text-[9px] py-1 rounded-sm font-medium transition-all \${isActive ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}\`}
                    >
                      {dir}
                    </button>
                  );
                })}
              </div>

              <label className="text-[10px] text-hall-500 font-bold mt-2 block">Justify Content</label>
              <div className="grid grid-cols-3 gap-1">
                {['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly'].map(justify => {
                  const isActive = (selectedElement.className || '').split(' ').includes(justify);
                  return (
                    <button
                      key={justify}
                      onClick={() => {
                        if (onToggleClass) {
                          ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly'].forEach(j => {
                            if (j !== justify && (selectedElement.className || '').split(' ').includes(j)) {
                              onToggleClass(j, false);
                            }
                          });
                          onToggleClass(justify, !isActive);
                        }
                      }}
                      className={\`text-[9px] py-1 rounded-sm font-medium transition-all \${isActive ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}\`}
                    >
                      {justify.replace('justify-', '')}
                    </button>
                  );
                })}
              </div>

              <label className="text-[10px] text-hall-500 font-bold mt-2 block">Align Items</label>
              <div className="grid grid-cols-3 gap-1">
                {['items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch'].map(align => {
                  const isActive = (selectedElement.className || '').split(' ').includes(align);
                  return (
                    <button
                      key={align}
                      onClick={() => {
                        if (onToggleClass) {
                          ['items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch'].forEach(a => {
                            if (a !== align && (selectedElement.className || '').split(' ').includes(a)) {
                              onToggleClass(a, false);
                            }
                          });
                          onToggleClass(align, !isActive);
                        }
                      }}
                      className={\`text-[9px] py-1 rounded-sm font-medium transition-all \${isActive ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}\`}
                    >
                      {align.replace('items-', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {((selectedElement.className || '').split(' ').includes('grid') || (selectedElement.className || '').split(' ').includes('inline-grid')) && (
            <div className="space-y-2 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
              <label className="text-[10px] text-hall-500 font-bold">Grid Columns</label>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(col => {
                  const cls = \`grid-cols-\${col}\`;
                  const isActive = (selectedElement.className || '').split(' ').includes(cls);
                  return (
                    <button
                      key={col}
                      onClick={() => {
                        if (onToggleClass) {
                          for(let i=1; i<=12; i++) {
                            const c = \`grid-cols-\${i}\`;
                            if (c !== cls && (selectedElement.className || '').split(' ').includes(c)) {
                              onToggleClass(c, false);
                            }
                          }
                          onToggleClass(cls, !isActive);
                        }
                      }}
                      className={\`text-[9px] py-1 rounded-sm font-medium transition-all \${isActive ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}\`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
              
              <label className="text-[10px] text-hall-500 font-bold mt-2 block">Gap</label>
              <div className="grid grid-cols-4 gap-1">
                {['0', '1', '2', '4', '6', '8', '10', '12'].map(gap => {
                  const cls = \`gap-\${gap}\`;
                  const isActive = (selectedElement.className || '').split(' ').includes(cls);
                  return (
                    <button
                      key={gap}
                      onClick={() => {
                        if (onToggleClass) {
                          ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24'].forEach(g => {
                            const c = \`gap-\${g}\`;
                            if (c !== cls && (selectedElement.className || '').split(' ').includes(c)) {
                              onToggleClass(c, false);
                            }
                          });
                          onToggleClass(cls, !isActive);
                        }
                      }}
                      className={\`text-[9px] py-1 rounded-sm font-medium transition-all \${isActive ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}\`}
                    >
                      {gap}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Inline Layout */}
        <div className="space-y-3 mt-4">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Inline Styles Layout</h4>`;

content = content.replace(anchor, injection);
fs.writeFileSync(file, content);
