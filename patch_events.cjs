const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';

let content = fs.readFileSync(path, 'utf8');

const oldEventsSection = `        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Events & Actions</h4>
          
          <div className="space-y-2">
            {['click', 'change', 'submit', 'mouseEnter', 'mouseLeave'].map(eventName => {
              const attrKey = \`data-on-\${eventName.toLowerCase()}\`;
              const datasetKey = \`on\${eventName.charAt(0).toUpperCase() + eventName.slice(1)}\`;
              const currentValue = selectedElement.dataset?.[datasetKey] || '';

              return (
                <div key={eventName} className="space-y-1 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
                  <label className="text-[10px] font-mono text-hall-600 dark:text-hall-400">on{eventName.charAt(0).toUpperCase() + eventName.slice(1)}</label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => onUpdateAttribute?.(attrKey, e.target.value)}
                    placeholder="e.g. setVariable:isOpen:true"
                    className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-hall-500 leading-tight">
            Actions: <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">navigate:page</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">setVariable:k:v</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">toggleVariable:k</code>
          </p>
        </div>`;

const newEventsSection = `        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-hall-200 dark:border-hall-800 pb-1">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider">Events & Actions</h4>
            <Sparkles className="w-3 h-3 text-indigo-500" />
          </div>
          
          <div className="space-y-2">
            {['click', 'change', 'submit', 'mouseEnter', 'mouseLeave'].map(eventName => {
              const attrKey = \`data-on-\${eventName.toLowerCase()}\`;
              const datasetKey = \`on\${eventName.charAt(0).toUpperCase() + eventName.slice(1)}\`;
              const currentValue = selectedElement.dataset?.[datasetKey] || '';

              return (
                <div key={eventName} className="space-y-1 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-hall-600 dark:text-hall-400">on{eventName.charAt(0).toUpperCase() + eventName.slice(1)}</label>
                    <button 
                      onClick={() => {
                        setActiveLogicEvent(attrKey);
                        setIsLogicModalOpen(true);
                      }}
                      className="text-[9px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Logic
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => onUpdateAttribute?.(attrKey, e.target.value)}
                    placeholder="e.g. setVariable:isOpen:true or custom JS"
                    className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-hall-500 leading-tight">
            Use AI to generate complex JavaScript, or use built-in actions: <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">navigate:page</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">setVariable:k:v</code>
          </p>
        </div>`;

if (content.includes(oldEventsSection)) {
  content = content.replace(oldEventsSection, newEventsSection);
  fs.writeFileSync(path, content);
  console.log("Successfully replaced Events section.");
} else {
  console.log("Could not find the old Events section.");
}
