const fs = require('fs');
const path = './src/components/Workspace.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add imports
code = code.replace("import { PagesManager } from './PagesManager';", "import { PagesManager } from './PagesManager';\nimport { CollectionsPanel } from './CollectionsPanel';");
code = code.replace("import { Settings2, AlignLeft, Library, Database, Palette, Settings } from 'lucide-react';", "import { Settings2, AlignLeft, Library, Database, Palette, Settings, List } from 'lucide-react';");

// Add state
code = code.replace("const [isVariablesOpen, setIsVariablesOpen] = useState(false);", "const [isVariablesOpen, setIsVariablesOpen] = useState(false);\n  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);");

// Add props
code = code.replace("seo?: Record<string, string>;", "seo?: Record<string, string>;\n  collections?: Record<string, any>;");
code = code.replace("onUpdateSEO?: (seo: Record<string, string>) => void;", "onUpdateSEO?: (seo: Record<string, string>) => void;\n  onUpdateCollections?: (collections: Record<string, any>) => void;");
code = code.replace("seo = {},", "seo = {},\n  collections = {},");
code = code.replace("onUpdateSEO,", "onUpdateSEO,\n  onUpdateCollections,");

// Sync collections to iframe
code = code.replace(/iframe\.contentWindow\.postMessage\(\{\s*type: 'FORGE_UPDATE_SEO',\s*seo\s*\}, '\*'\);/g, `iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_SEO',
        seo
      }, '*');
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_COLLECTIONS',
        collections
      }, '*');`);

// Add button
const buttonHtml = `
           <button
             onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
             className={\`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 \${isCollectionsOpen ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}\`}
             aria-label="Collections"
           >
             <List className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Data Collections
             </div>
           </button>
`;
code = code.replace("aria-label=\"Variables\"", "aria-label=\"Variables\"\n           >" + "\n           " + buttonHtml.replace("aria-label=\"Variables\"", "aria-label=\"Variables_old\""));

// Add panel
const panelHtml = `
        {/* Collections Panel */}
        <div className={\`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 \${isCollectionsOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}\`}>
          <CollectionsPanel 
            collections={collections}
            onUpdateCollections={(newColls) => {
              if (onUpdateCollections) {
                onUpdateCollections(newColls);
              }
            }}
            onClose={() => setIsCollectionsOpen(false)} 
          />
        </div>
`;
code = code.replace("{/* Theme Editor Panel */}", panelHtml + "\n        {/* Theme Editor Panel */}");

fs.writeFileSync(path, code);
