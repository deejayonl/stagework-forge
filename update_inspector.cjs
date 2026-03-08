const fs = require('fs');

const path = 'src/components/PropertyInspector.tsx';
let content = fs.readFileSync(path, 'utf8');

const startTag1 = '{/* Animations & Interactions */}';
const endTag1 = '{/* Background */}';

const startIndex1 = content.indexOf(startTag1);
const endIndex1 = content.indexOf(endTag1);

if (startIndex1 !== -1 && endIndex1 !== -1) {
  const newAnimations = `        {/* Animations & Interactions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Animations
          </h4>
          
          {/* Scroll Reveal */}
          <div className="flex items-center justify-between bg-hall-100 dark:bg-hall-900 p-3 rounded-xl mb-3">
            <label className="text-xs font-bold text-hall-700 dark:text-hall-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Animate on Scroll (AOS)
            </label>
            <button
              onClick={() => onToggleClass && onToggleClass('animate-on-scroll', !selectedElement.className?.includes('animate-on-scroll'))}
              className={\`w-8 h-4 rounded-full transition-colors relative \${selectedElement.className?.includes('animate-on-scroll') ? 'bg-amber-500' : 'bg-hall-300 dark:bg-hall-700'}\`}
            >
              <div className={\`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all \${selectedElement.className?.includes('animate-on-scroll') ? 'left-[18px]' : 'left-0.5'}\`} />
            </button>
          </div>

          {/* Entrance Presets */}
          <div className="space-y-2 mt-2 border-t border-hall-200 dark:border-hall-800 pt-2">
            <label className="text-[10px] text-hall-500 font-bold">Entrance Animations</label>
            <div className="grid grid-cols-2 gap-2">
              {['animate-fade-in', 'animate-fade-in-up', 'animate-zoom-in', 'animate-slide-in-right'].map(anim => {
                const prefix = activeBreakpoint === 'mobile' ? 'max-md:' : activeBreakpoint === 'tablet' ? 'md:' : '';
                const prefixedAnim = prefix + anim;
                const isActive = selectedElement.className?.includes(prefixedAnim);
                return (
                  <button
                    key={anim}
                    onClick={() => {
                      if (onToggleClass) {
                        ['animate-fade-in', 'animate-fade-in-up', 'animate-zoom-in', 'animate-slide-in-right', 'animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].forEach(a => {
                          if (a !== anim && selectedElement.className?.includes(prefix + a)) {
                            onToggleClass(prefix + a, false);
                          }
                        });
                        onToggleClass(prefixedAnim, !isActive);
                      }
                    }}
                    className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                  >
                    {anim.replace('animate-', '').replace(/-/g, ' ')}
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continuous Presets */}
          <div className="space-y-2 mt-2">
            <label className="text-[10px] text-hall-500 font-bold">Continuous Animations</label>
            <div className="grid grid-cols-2 gap-2">
              {['animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].map(anim => {
                const prefix = activeBreakpoint === 'mobile' ? 'max-md:' : activeBreakpoint === 'tablet' ? 'md:' : '';
                const prefixedAnim = prefix + anim;
                const isActive = selectedElement.className?.includes(prefixedAnim);
                return (
                  <button
                    key={anim}
                    onClick={() => {
                      if (onToggleClass) {
                        ['animate-fade-in', 'animate-fade-in-up', 'animate-zoom-in', 'animate-slide-in-right', 'animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].forEach(a => {
                          if (a !== anim && selectedElement.className?.includes(prefix + a)) {
                            onToggleClass(prefix + a, false);
                          }
                        });
                        onToggleClass(prefixedAnim, !isActive);
                      }
                    }}
                    className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                  >
                    {anim.replace('animate-', '')}
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hover Effects */}
          <div className="space-y-2 mt-2 border-t border-hall-200 dark:border-hall-800 pt-2">
            <label className="text-[10px] text-hall-500 font-bold">Hover Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {['hover:scale-105', 'hover:scale-110', 'hover:-translate-y-1', 'hover:-translate-y-2', 'hover:shadow-lg', 'hover:shadow-xl', 'hover:shadow-indigo-500/50', 'hover:opacity-80'].map(effect => {
                const prefix = activeBreakpoint === 'mobile' ? 'max-md:' : activeBreakpoint === 'tablet' ? 'md:' : '';
                const prefixedEffect = prefix + effect;
                const isActive = selectedElement.className?.includes(prefixedEffect);
                return (
                  <button
                    key={effect}
                    onClick={() => onToggleClass && onToggleClass(prefixedEffect, !isActive)}
                    className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                  >
                    {effect.replace('hover:', '')}
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                );
              })}
            </div>
          </div>
          
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Transitions</h4>
          <div className="grid grid-cols-2 gap-2">
            {['transition-all', 'transition-colors', 'transition-opacity', 'transition-transform'].map(trans => {
              const prefix = activeBreakpoint === 'mobile' ? 'max-md:' : activeBreakpoint === 'tablet' ? 'md:' : '';
              const prefixedTrans = prefix + trans;
              const isActive = selectedElement.className?.includes(prefixedTrans);
              return (
                <button
                  key={trans}
                  onClick={() => onToggleClass && onToggleClass(prefixedTrans, !isActive)}
                  className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                >
                  {trans.replace('transition-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Duration</label>
              <input 
                type="text" 
                value={styles.animationDuration || ''} 
                onChange={(e) => handleStyleChange('animationDuration', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 2s, 500ms"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Delay</label>
              <input 
                type="text" 
                value={styles.animationDelay || ''} 
                onChange={(e) => handleStyleChange('animationDelay', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 1s"
              />
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Timing Function (Easing)</label>
            <div className="flex gap-2">
              <select 
                value={styles.animationTimingFunction || ''} 
                onChange={(e) => handleStyleChange('animationTimingFunction', e.target.value)}
                className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">Default</option>
                <option value="linear">linear</option>
                <option value="ease">ease</option>
                <option value="ease-in">ease-in</option>
                <option value="ease-out">ease-out</option>
                <option value="ease-in-out">ease-in-out</option>
              </select>
              <input 
                type="text" 
                value={styles.animationTimingFunction || ''} 
                onChange={(e) => handleStyleChange('animationTimingFunction', e.target.value)}
                className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="cubic-bezier(...)"
              />
            </div>
          </div>

          <div className="space-y-1 mt-3 pt-3 border-t border-hall-200 dark:border-hall-800">
            <label className="text-[10px] text-hall-500 font-bold">Custom Animation</label>
            <div className="space-y-2">
              <input 
                type="text" 
                value={styles.animationName || ''} 
                onChange={(e) => handleStyleChange('animationName', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="Animation Name (e.g. slideIn)"
              />
              <textarea
                value={selectedElement.dataset?.keyframes || ''}
                onChange={(e) => {
                  if (onUpdateAttribute) {
                    onUpdateAttribute('data-keyframes', e.target.value);
                  }
                }}
                className="w-full h-20 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink font-mono"
                placeholder="@keyframes slideIn {\\n  from { opacity: 0; }\\n  to { opacity: 1; }\\n}"
              />
              <p className="text-[8px] text-hall-500">Define keyframes here and they will be injected automatically.</p>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-2 mt-2">
            {['duration-150', 'duration-300', 'duration-500', 'duration-700'].map(dur => {
              const prefix = activeBreakpoint === 'mobile' ? 'max-md:' : activeBreakpoint === 'tablet' ? 'md:' : '';
              const prefixedDur = prefix + dur;
              const isActive = selectedElement.className?.includes(prefixedDur);
              return (
                <button
                  key={dur}
                  onClick={() => onToggleClass && onToggleClass(prefixedDur, !isActive)}
                  className={\`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between \${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
                >
                  {dur.replace('duration-', '')}ms
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
        </div>

`;
  content = content.substring(0, startIndex1) + newAnimations + content.substring(endIndex1);
}

// Now remove the second block
const startTag2 = '{/* Animations */}';
const endTag2 = '{/* Media & Interactions */}';

const startIndex2 = content.indexOf(startTag2);
const endIndex2 = content.indexOf(endTag2);

if (startIndex2 !== -1 && endIndex2 !== -1) {
  content = content.substring(0, startIndex2) + content.substring(endIndex2);
}

fs.writeFileSync(path, content);
console.log('Updated PropertyInspector.tsx successfully');
