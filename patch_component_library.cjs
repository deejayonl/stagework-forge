const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ComponentLibrary.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for Search icon
content = content.replace(
  "import { ShoppingCart, LayoutTemplate, CheckSquare, CreditCard, LayoutGrid, MousePointerClick, Table, Settings2, X } from 'lucide-react';",
  "import { ShoppingCart, LayoutTemplate, CheckSquare, CreditCard, LayoutGrid, MousePointerClick, Table, Settings2, X, Search } from 'lucide-react';"
);

// Add state for search
content = content.replace(
  "const [hoveredItem, setHoveredItem] = useState<{name: string, html: string} | null>(null);",
  "const [hoveredItem, setHoveredItem] = useState<{name: string, html: string} | null>(null);\n  const [searchTerm, setSearchTerm] = useState('');"
);

// Add search input UI
const searchUI = `
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
`;

content = content.replace(
  /<div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 bg-white\/50 dark:bg-black\/50 backdrop-blur-md">[\s\S]*?<\/div>\s*<\/div>/,
  searchUI.trim()
);

// Add filtering logic
const filteringLogic = `
  const filteredCustomItems = customItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredComponents = COMPONENTS.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const hasResults = filteredCustomItems.length > 0 || filteredComponents.length > 0;
`;

content = content.replace(
  "return (",
  filteringLogic + "\n  return ("
);

// Replace customItems with filteredCustomItems
content = content.replace(/customItems\.length > 0/g, "filteredCustomItems.length > 0");
content = content.replace(/customItems\.map/g, "filteredCustomItems.map");

// Replace COMPONENTS with filteredComponents
content = content.replace(/COMPONENTS\.map/g, "filteredComponents.map");

// Add Empty State UI
const emptyStateUI = `
        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-hall-100 dark:bg-hall-800 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-hall-400" />
            </div>
            <h4 className="text-sm font-bold text-hall-900 dark:text-ink mb-1">No components found</h4>
            <p className="text-xs text-hall-500">Try adjusting your search term.</p>
          </div>
        )}
`;

content = content.replace(
  /{filteredCustomItems\.length > 0 && \(/,
  emptyStateUI + "\n        {filteredCustomItems.length > 0 && ("
);

fs.writeFileSync(filePath, content);
console.log('ComponentLibrary patched successfully');
