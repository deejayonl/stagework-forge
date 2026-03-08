const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ProjectSidebar.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Update Props
code = code.replace(
  "  onClose: () => void;\n}", 
  "  onClose: () => void;\n  onLoadFromBFF?: () => void;\n  isSyncing?: boolean;\n}"
);

// Update Component Signature
code = code.replace(
  "  isOpen,\n  onClose\n}) => {",
  "  isOpen,\n  onClose,\n  onLoadFromBFF,\n  isSyncing\n}) => {"
);

// Add Load Button
const loadBtn = `
          <div className="p-4 shrink-0 flex gap-2">
            <button
              onClick={() => { onNew(); if (window.innerWidth < 768) onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-hall-900 bg-hall-950 text-ink text-hall-950 rounded-2xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-spring"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            {onLoadFromBFF && (
              <button
                onClick={() => { onLoadFromBFF(); }}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-500/20 transition-all duration-300 ease-spring disabled:opacity-50"
                title="Load from BFF State Store"
              >
                <FolderGit2 className="w-4 h-4" />
                {isSyncing ? 'Syncing...' : 'Load'}
              </button>
            )}
          </div>
`;

code = code.replace(
  /<div className="p-4 shrink-0">[\s\S]*?<\/div>/,
  loadBtn
);

fs.writeFileSync(filePath, code);
console.log("Patched ProjectSidebar.tsx");
