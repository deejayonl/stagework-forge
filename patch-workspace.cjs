const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

// Insert the Network button for APIs
const buttonHtml = `
           <button
             onClick={() => setIsApisOpen(!isApisOpen)}
             className={\`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 \${isApisOpen ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
             aria-label="APIs"
           >
             <Network className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               API Integrations
             </div>
           </button>`;

content = content.replace(
  /Data Collections\n             <\/div>\n           <\/button>/,
  `Data Collections\n             </div>\n           </button>${buttonHtml}`
);

// Insert the Panel rendering
const panelHtml = `
        {/* APIs Panel */}
        <div className={\`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 \${isApisOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}\`}>
          <ApiIntegrationsPanel 
            apis={apis}
            projectId={project?.id}
            onUpdate={(newApis) => {
              if (onUpdateApis) {
                onUpdateApis(newApis);
              }
            }}
            onClose={() => setIsApisOpen(false)} 
          />
        </div>`;

content = content.replace(
  /{\/\* Theme Editor Panel \*\//,
  `${panelHtml}\n\n        {/* Theme Editor Panel */`
);

fs.writeFileSync('src/components/Workspace.tsx', content);
