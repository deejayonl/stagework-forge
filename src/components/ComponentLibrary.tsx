import React from 'react';

interface ComponentLibraryProps {
  onInsertComponent: (html: string) => void;
  savedComponents?: Record<string, string>;
  onClose: () => void;
}

const COMPONENTS = [
  {
    category: 'Layout',
    items: [
      {
        name: 'Navbar',
        html: `<nav class="bg-white dark:bg-black border-b border-hall-200 dark:border-hall-800 px-6 py-4 flex items-center justify-between"><div class="text-xl font-bold text-hall-900 dark:text-ink">Logo</div><ul class="flex gap-6"><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer">Home</li><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer">About</li><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer">Contact</li></ul></nav>`
      },
      {
        name: 'Footer',
        html: `<footer class="bg-hall-50 dark:bg-hall-950 border-t border-hall-200 dark:border-hall-800 px-6 py-8 text-center text-hall-500 dark:text-hall-400 text-sm"><p>&copy; 2026 Your Company. All rights reserved.</p></footer>`
      }
    ]
  },
  {
    category: 'Elements',
    items: [
      {
        name: 'Primary Button',
        html: `<button class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Click Me</button>`
      },
      {
        name: 'Card',
        html: `<div class="bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-6 shadow-sm"><h3 class="text-lg font-bold text-hall-900 dark:text-ink mb-2">Card Title</h3><p class="text-hall-600 dark:text-hall-400 text-sm">This is a simple card component. Replace this text with your content.</p></div>`
      },
      {
        name: 'Image',
        html: `<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Placeholder" class="w-full h-auto rounded-xl shadow-sm border border-hall-200 dark:border-hall-800" />`
      },
      {
        name: 'Badge',
        html: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">Badge</span>`
      }
    ]
  }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onInsertComponent, savedComponents = {}, onClose }) => {
  const customItems = Object.entries(savedComponents).map(([name, html]) => ({ name, html }));

  return (
    <div className="w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 sticky top-0 bg-inherit z-10">
        <h3 className="text-sm font-bold text-hall-900 dark:text-ink">Component Library</h3>
        <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6">
        <div className="text-xs text-hall-500 dark:text-hall-400">
          Click a component to append it to the selected element, or the body if nothing is selected.
        </div>

        {customItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Saved Components
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {customItems.map((item, j) => (
                <button
                  key={j}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/html', item.html);
                    e.dataTransfer.setData('application/forge-component', item.name);
                  }}
                  onClick={() => onInsertComponent(item.html)}
                  className="text-left bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-3 transition-colors group cursor-grab active:cursor-grabbing"
                >
                  <div className="text-sm font-medium text-indigo-900 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {COMPONENTS.map((group, i) => (
          <div key={i} className="space-y-3">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">
              {group.category}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {group.items.map((item, j) => (
                <button
                  key={j}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/html', item.html);
                    e.dataTransfer.setData('application/forge-component', item.name);
                  }}
                  onClick={() => onInsertComponent(item.html)}
                  className="text-left bg-white dark:bg-black border border-hall-200 dark:border-hall-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-3 transition-colors group cursor-grab active:cursor-grabbing"
                >
                  <div className="text-sm font-medium text-hall-900 dark:text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentLibrary;
