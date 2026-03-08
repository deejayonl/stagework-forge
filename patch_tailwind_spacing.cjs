const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let content = fs.readFileSync(file, 'utf8');

const anchor = `        {/* Spacing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Spacing</h4>`;

const spacingScale = ['0','px','0.5','1','1.5','2','2.5','3','4','5','6','8','10','12','16','20','24','32','40','48','64','auto'];

const generateSelect = (prefix, label) => `
              <div className="space-y-1">
                <label className="text-[9px] text-hall-500">${label}</label>
                <select 
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  onChange={(e) => {
                    if (onToggleClass) {
                      const classes = (selectedElement.className || '').split(' ');
                      classes.forEach(c => { if (c.match(/^${prefix}-\\d+(\\.\\d+)?$/) || c === '${prefix}-auto' || c === '${prefix}-px') onToggleClass(c, false); });
                      if (e.target.value) onToggleClass(\`${prefix}-\${e.target.value}\`, true);
                    }
                  }}
                  value={(selectedElement.className || '').split(' ').find(c => c.match(/^${prefix}-\\d+(\\.\\d+)?$/) || c === '${prefix}-auto' || c === '${prefix}-px')?.replace('${prefix}-', '') || ''}
                >
                  <option value="">none</option>
                  {['0','px','0.5','1','1.5','2','2.5','3','4','5','6','8','10','12','16','20','24','32','40','48','64','auto'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>`;

const injection = `        {/* Tailwind Spacing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Tailwind Spacing</h4>
          
          <div className="space-y-2 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
            <label className="text-[10px] text-hall-500 font-bold">Padding</label>
            <div className="grid grid-cols-3 gap-2">
              ${generateSelect('p', 'All (p)')}
              ${generateSelect('px', 'X-Axis (px)')}
              ${generateSelect('py', 'Y-Axis (py)')}
              ${generateSelect('pt', 'Top (pt)')}
              ${generateSelect('pr', 'Right (pr)')}
              ${generateSelect('pb', 'Bottom (pb)')}
              ${generateSelect('pl', 'Left (pl)')}
            </div>
          </div>

          <div className="space-y-2 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
            <label className="text-[10px] text-hall-500 font-bold">Margin</label>
            <div className="grid grid-cols-3 gap-2">
              ${generateSelect('m', 'All (m)')}
              ${generateSelect('mx', 'X-Axis (mx)')}
              ${generateSelect('my', 'Y-Axis (my)')}
              ${generateSelect('mt', 'Top (mt)')}
              ${generateSelect('mr', 'Right (mr)')}
              ${generateSelect('mb', 'Bottom (mb)')}
              ${generateSelect('ml', 'Left (ml)')}
            </div>
          </div>
        </div>

        {/* Inline Spacing */}
        <div className="space-y-3 mt-4">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Inline Styles Spacing</h4>`;

content = content.replace(anchor, injection);
fs.writeFileSync(file, content);
