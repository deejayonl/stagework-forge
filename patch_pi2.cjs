const fs = require('fs');
const path = 'src/components/PropertyInspector.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStr = "import { KeyframeTimelineBuilder } from './KeyframeTimelineBuilder';";
if (!content.includes('KeyframeTimelineBuilder')) {
  content = content.replace("import { LogicGeneratorModal } from './LogicGeneratorModal';", "import { LogicGeneratorModal } from './LogicGeneratorModal';\n" + importStr);
}

const stateStr = "const [isTimelineBuilderOpen, setIsTimelineBuilderOpen] = useState(false);";
if (!content.includes('isTimelineBuilderOpen')) {
  content = content.replace("const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);", "const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);\n  " + stateStr);
}

// Find the Custom Animation block and replace it
const oldCustomAnim = `<div className="space-y-1 mt-3 pt-3 border-t border-hall-200 dark:border-hall-800">
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
          </div>`;

const newCustomAnim = `<div className="space-y-1 mt-3 pt-3 border-t border-hall-200 dark:border-hall-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-hall-500 font-bold">Custom Animation</label>
              <button 
                onClick={() => setIsTimelineBuilderOpen(true)}
                className="text-[9px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-bold"
              >
                Timeline Builder
              </button>
            </div>
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
            </div>
          </div>`;

content = content.replace(oldCustomAnim, newCustomAnim);

// Add the modal at the end of the return statement
const modalStr = `
      {isTimelineBuilderOpen && (
        <KeyframeTimelineBuilder
          initialKeyframes={selectedElement.dataset?.keyframes}
          onSave={(css) => {
            if (onUpdateAttribute) {
              onUpdateAttribute('data-keyframes', css);
              
              const match = css.match(/@keyframes\\s+([a-zA-Z0-9_-]+)/);
              if (match) {
                handleStyleChange('animationName', match[1]);
              }
            }
          }}
          onClose={() => setIsTimelineBuilderOpen(false)}
        />
      )}
    </div>
  );
};
`;

content = content.replace(/<\/div>\s*<\/div>\s*\);\s*};\s*$/, modalStr);

fs.writeFileSync(path, content);
console.log('Patched PropertyInspector.tsx');
