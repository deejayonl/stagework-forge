const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

const animationSection = `
        {/* Animations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Animations</h4>
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Preset Animation</label>
              <select
                value={styles.animation || ''}
                onChange={(e) => handleStyleChange('animation', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">None</option>
                <option value="spin 1s linear infinite">Spin</option>
                <option value="ping 1s cubic-bezier(0, 0, 0.2, 1) infinite">Ping</option>
                <option value="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite">Pulse</option>
                <option value="bounce 1s infinite">Bounce</option>
                <option value="fadeIn 0.5s ease-in-out">Fade In</option>
                <option value="slideInUp 0.5s ease-out">Slide Up</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Duration (s)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={styles.animationDuration ? parseFloat(styles.animationDuration) : ''} 
                  onChange={(e) => handleStyleChange('animationDuration', e.target.value ? \`\${e.target.value}s\` : '')}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Delay (s)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={styles.animationDelay ? parseFloat(styles.animationDelay) : ''} 
                  onChange={(e) => handleStyleChange('animationDelay', e.target.value ? \`\${e.target.value}s\` : '')}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="e.g. 0.5"
                />
              </div>
            </div>
          </div>
        </div>
`;

if (!code.includes('Animations</h4>')) {
  code = code.replace('{/* Media & Interactions */}', animationSection + '\n        {/* Media & Interactions */}');
  fs.writeFileSync(path, code, 'utf8');
  console.log('Animation section added.');
} else {
  console.log('Animation section already exists.');
}
