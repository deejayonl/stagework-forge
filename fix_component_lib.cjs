const fs = require('fs');

const path = '/home/agent/workspace/projects/stagework-forge/src/components/ComponentLibrary.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('export const ComponentLibrary: React.FC<ComponentLibraryProps> =');

if (startIndex === -1) {
  console.error('Could not find ComponentLibrary export');
  process.exit(1);
}

const newComponent = `export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onInsertComponent, savedComponents = {}, onClose }) => {
  const customItems = Object.entries(savedComponents).map(([name, html]) => ({ name, html }));
  const [hoveredItem, setHoveredItem] = useState<{name: string, html: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomItems = customItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredComponents = COMPONENTS.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const hasResults = filteredCustomItems.length > 0 || filteredComponents.length > 0;

  return (
    <div className="w-80 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-hall-900 dark:text-ink tracking-wide">Components</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-hall-500 hover:text-hall-900 hover:bg-hall-200 dark:hover:text-ink dark:hover:bg-hall-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hall-400" />
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-hall-100 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-lg text-sm text-hall-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-hall-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-hall-300 dark:scrollbar-thumb-hall-700">
        {!hasResults ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Search className="w-8 h-8 text-hall-300 dark:text-hall-700 mb-3" />
            <p className="text-sm font-medium text-hall-900 dark:text-ink">No components found</p>
            <p className="text-xs text-hall-500 dark:text-hall-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            {filteredCustomItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider flex items-center gap-2 px-1">
                  <Settings2 className="w-4 h-4" />
                  Custom Components
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredCustomItems.map((item, i) => (
                    <button
                      key={i}
                      draggable
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/html', item.html);
                        e.dataTransfer.setData('application/forge-component', item.name);
                      }}
                      onClick={() => onInsertComponent(item.html)}
                      className="flex items-center justify-between bg-white dark:bg-black border border-hall-200 dark:border-hall-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-3 transition-all group cursor-grab active:cursor-grabbing hover:shadow-md"
                    >
                      <span className="text-sm font-medium text-hall-700 dark:text-hall-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {item.name}
                      </span>
                      <div className="w-6 h-6 rounded bg-hall-100 dark:bg-hall-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-hall-600 dark:text-hall-400 text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400">+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredComponents.map((group, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider flex items-center gap-2 px-1">
                  {group.icon}
                  {group.category}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {group.items.map((item, j) => (
                    <button
                      key={j}
                      draggable
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/html', item.html);
                        e.dataTransfer.setData('application/forge-component', item.name);
                      }}
                      onClick={() => onInsertComponent(item.html)}
                      className="flex items-center justify-between bg-white dark:bg-black border border-hall-200 dark:border-hall-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-3 transition-all group cursor-grab active:cursor-grabbing hover:shadow-md"
                    >
                      <span className="text-sm font-medium text-hall-700 dark:text-hall-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {item.name}
                      </span>
                      <div className="w-6 h-6 rounded bg-hall-100 dark:bg-hall-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-hall-600 dark:text-hall-400 text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400">+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {hoveredItem && (
        <div className="fixed left-[330px] top-24 w-[600px] bg-white dark:bg-black rounded-xl shadow-2xl border border-hall-200 dark:border-hall-800 z-[100] overflow-hidden pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-hall-50 dark:bg-hall-950 border-b border-hall-200 dark:border-hall-800 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider">{hoveredItem.name} Preview</span>
          </div>
          <div className="p-0 bg-hall-100/50 dark:bg-hall-900/20 max-h-[500px] overflow-hidden flex justify-center items-start relative">
            <div 
              className="origin-top w-[200%] transform scale-50 pointer-events-none"
              dangerouslySetInnerHTML={{ __html: hoveredItem.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentLibrary;
`;

fs.writeFileSync(path, content.substring(0, startIndex) + newComponent);
console.log('Fixed ComponentLibrary.tsx');
