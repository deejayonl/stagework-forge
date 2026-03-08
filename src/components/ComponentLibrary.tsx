import React from 'react';
import { LayoutTemplate, CheckSquare, CreditCard, LayoutGrid, MousePointerClick, Table, Settings2, X } from 'lucide-react';

interface ComponentLibraryProps {
  onInsertComponent: (html: string) => void;
  savedComponents?: Record<string, string>;
  onClose: () => void;
}

const COMPONENTS = [
  {
    category: 'Layout',
    icon: <LayoutTemplate className="w-4 h-4" />,
    items: [
      {
        name: 'Navbar (Simple)',
        html: `<nav class="bg-white dark:bg-black border-b border-hall-200 dark:border-hall-800 px-6 py-4 flex items-center justify-between"><div class="text-xl font-bold text-hall-900 dark:text-ink">Logo</div><ul class="flex gap-6"><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer transition-colors">Home</li><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer transition-colors">About</li><li class="text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink cursor-pointer transition-colors">Contact</li></ul></nav>`
      },
      {
        name: 'Footer (Simple)',
        html: `<footer class="bg-hall-50 dark:bg-hall-950 border-t border-hall-200 dark:border-hall-800 px-6 py-8 text-center text-hall-500 dark:text-hall-400 text-sm"><p>&copy; 2026 Your Company. All rights reserved.</p></footer>`
      },
      {
        name: 'Container (Max-W)',
        html: `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"><div class="bg-hall-100 dark:bg-hall-900 border border-dashed border-hall-300 dark:border-hall-700 rounded-xl p-8 text-center text-hall-500 dark:text-hall-400">Content goes here</div></div>`
      }
    ]
  },
  {
    category: 'Heroes',
    icon: <LayoutGrid className="w-4 h-4" />,
    items: [
      {
        name: 'Hero (Centered)',
        html: `<section class="px-6 py-24 text-center bg-white dark:bg-black"><div class="max-w-3xl mx-auto"><h1 class="text-5xl font-extrabold tracking-tight text-hall-900 dark:text-ink mb-6">Build something amazing today</h1><p class="text-xl text-hall-600 dark:text-hall-400 mb-10">Deploy faster, scale easier, and focus on what matters most: your product.</p><div class="flex justify-center gap-4"><button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-indigo-500/25">Get Started</button><button class="bg-hall-100 dark:bg-hall-900 hover:bg-hall-200 dark:hover:bg-hall-800 text-hall-900 dark:text-ink font-semibold py-3 px-8 rounded-full transition-all">Learn More</button></div></div></section>`
      },
      {
        name: 'Hero (Split)',
        html: `<section class="px-6 py-20 bg-hall-50 dark:bg-hall-950"><div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div class="space-y-8"><h1 class="text-4xl sm:text-5xl font-bold text-hall-900 dark:text-ink leading-tight">Data to enrich your online business</h1><p class="text-lg text-hall-600 dark:text-hall-400">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.</p><div class="flex gap-4"><button class="bg-black dark:bg-white text-white dark:text-black font-semibold py-3 px-6 rounded-lg transition-transform hover:scale-105">Get started</button></div></div><div class="relative"><img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" alt="Dashboard preview" class="rounded-2xl shadow-2xl border border-hall-200 dark:border-hall-800 w-full object-cover aspect-video" /></div></div></section>`
      }
    ]
  },
  {
    category: 'Features',
    icon: <CheckSquare className="w-4 h-4" />,
    items: [
      {
        name: 'Feature Grid (3x3)',
        html: `<section class="py-24 bg-white dark:bg-black"><div class="max-w-7xl mx-auto px-6"><div class="text-center mb-16"><h2 class="text-3xl font-bold text-hall-900 dark:text-ink">Everything you need</h2><p class="mt-4 text-hall-600 dark:text-hall-400 max-w-2xl mx-auto">Focus on your business, not the boilerplate.</p></div><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="p-6 bg-hall-50 dark:bg-hall-900 rounded-2xl border border-hall-100 dark:border-hall-800"><div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div><h3 class="text-xl font-bold text-hall-900 dark:text-ink mb-2">Lightning Fast</h3><p class="text-hall-600 dark:text-hall-400">Optimized for speed and performance out of the box.</p></div><div class="p-6 bg-hall-50 dark:bg-hall-900 rounded-2xl border border-hall-100 dark:border-hall-800"><div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mb-6"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div><h3 class="text-xl font-bold text-hall-900 dark:text-ink mb-2">Secure by Default</h3><p class="text-hall-600 dark:text-hall-400">Built-in security measures to protect your data.</p></div><div class="p-6 bg-hall-50 dark:bg-hall-900 rounded-2xl border border-hall-100 dark:border-hall-800"><div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div><h3 class="text-xl font-bold text-hall-900 dark:text-ink mb-2">Always Synced</h3><p class="text-hall-600 dark:text-hall-400">Real-time updates across all your devices.</p></div></div></div></section>`
      }
    ]
  },
  {
    category: 'Pricing',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        name: 'Pricing Cards',
        html: `<section class="py-24 bg-hall-50 dark:bg-hall-950"><div class="max-w-7xl mx-auto px-6"><div class="text-center mb-16"><h2 class="text-3xl font-bold text-hall-900 dark:text-ink">Simple, transparent pricing</h2></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"><div class="bg-white dark:bg-black rounded-3xl p-8 border border-hall-200 dark:border-hall-800 shadow-sm"><h3 class="text-lg font-semibold text-hall-900 dark:text-ink">Hobby</h3><p class="mt-4 text-sm text-hall-500 dark:text-hall-400">Perfect for side projects.</p><div class="my-6"><span class="text-4xl font-bold text-hall-900 dark:text-ink">$0</span><span class="text-hall-500 dark:text-hall-400">/mo</span></div><button class="w-full py-2.5 px-4 bg-hall-100 dark:bg-hall-900 hover:bg-hall-200 dark:hover:bg-hall-800 text-hall-900 dark:text-ink font-semibold rounded-xl transition-colors">Get Started</button><ul class="mt-8 space-y-3 text-sm text-hall-600 dark:text-hall-400"><li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>1 Project</li><li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Community Support</li></ul></div><div class="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 border border-indigo-500 shadow-xl relative scale-105"><div class="absolute top-0 right-6 transform -translate-y-1/2"><span class="bg-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</span></div><h3 class="text-lg font-semibold text-white">Pro</h3><p class="mt-4 text-sm text-indigo-100">For professional developers.</p><div class="my-6"><span class="text-4xl font-bold text-white">$29</span><span class="text-indigo-200">/mo</span></div><button class="w-full py-2.5 px-4 bg-white text-indigo-600 hover:bg-hall-50 font-semibold rounded-xl transition-colors shadow-sm">Start Free Trial</button><ul class="mt-8 space-y-3 text-sm text-indigo-100"><li class="flex items-center gap-3"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Unlimited Projects</li><li class="flex items-center gap-3"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Priority Support</li><li class="flex items-center gap-3"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Custom Domains</li></ul></div><div class="bg-white dark:bg-black rounded-3xl p-8 border border-hall-200 dark:border-hall-800 shadow-sm"><h3 class="text-lg font-semibold text-hall-900 dark:text-ink">Enterprise</h3><p class="mt-4 text-sm text-hall-500 dark:text-hall-400">For large scale teams.</p><div class="my-6"><span class="text-4xl font-bold text-hall-900 dark:text-ink">Custom</span></div><button class="w-full py-2.5 px-4 bg-hall-100 dark:bg-hall-900 hover:bg-hall-200 dark:hover:bg-hall-800 text-hall-900 dark:text-ink font-semibold rounded-xl transition-colors">Contact Sales</button><ul class="mt-8 space-y-3 text-sm text-hall-600 dark:text-hall-400"><li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Everything in Pro</li><li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>SLA Guarantee</li><li class="flex items-center gap-3"><svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Dedicated Success Manager</li></ul></div></div></div></section>`
      }
    ]
  },
  {
    category: 'Elements',
    icon: <MousePointerClick className="w-4 h-4" />,
    items: [
      {
        name: 'Primary Button',
        html: `<button class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-black">Click Me</button>`
      },
      {
        name: 'Secondary Button',
        html: `<button class="bg-white dark:bg-black hover:bg-hall-50 dark:hover:bg-hall-900 text-hall-900 dark:text-ink font-medium py-2 px-4 rounded-lg transition-colors border border-hall-200 dark:border-hall-800 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-hall-500 dark:focus:ring-offset-black">Secondary Action</button>`
      },
      {
        name: 'Card',
        html: `<div class="bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"><h3 class="text-lg font-bold text-hall-900 dark:text-ink mb-2">Card Title</h3><p class="text-hall-600 dark:text-hall-400 text-sm">This is a simple card component. Replace this text with your content.</p></div>`
      },
      {
        name: 'Input Field',
        html: `<div class="flex flex-col gap-1.5"><label class="text-sm font-medium text-hall-900 dark:text-ink">Email Address</label><input type="email" placeholder="you@example.com" class="w-full px-3 py-2 bg-white dark:bg-black border border-hall-300 dark:border-hall-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-ink sm:text-sm" /></div>`
      },
      {
        name: 'Image (Rounded)',
        html: `<img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Placeholder" class="w-full h-auto rounded-xl shadow-sm border border-hall-200 dark:border-hall-800 object-cover" />`
      },
      {
        name: 'Badge',
        html: `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">New Feature</span>`
      }
    ]
  },
  {
    category: 'Data Display',
    icon: <Table className="w-4 h-4" />,
    items: [
      {
        name: 'Table (Simple)',
        html: `<div class="w-full overflow-x-auto border border-hall-200 dark:border-hall-800 rounded-xl shadow-sm"><table class="w-full text-sm text-left text-hall-600 dark:text-hall-400"><thead class="text-xs text-hall-700 uppercase bg-hall-50 dark:bg-hall-900/50 dark:text-hall-300 border-b border-hall-200 dark:border-hall-800"><tr><th scope="col" class="px-6 py-4 font-semibold">Name</th><th scope="col" class="px-6 py-4 font-semibold">Role</th><th scope="col" class="px-6 py-4 font-semibold">Status</th></tr></thead><tbody class="divide-y divide-hall-200 dark:divide-hall-800"><tr class="bg-white dark:bg-black hover:bg-hall-50 dark:hover:bg-hall-900/20 transition-colors"><td class="px-6 py-4 font-medium text-hall-900 dark:text-ink">Jane Doe</td><td class="px-6 py-4">Admin</td><td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</span></td></tr><tr class="bg-white dark:bg-black hover:bg-hall-50 dark:hover:bg-hall-900/20 transition-colors"><td class="px-6 py-4 font-medium text-hall-900 dark:text-ink">John Smith</td><td class="px-6 py-4">User</td><td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hall-100 text-hall-800 dark:bg-hall-800 dark:text-hall-300">Offline</span></td></tr></tbody></table></div>`
      },
      {
        name: 'Stats Grid',
        html: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-6"><div class="bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-6 shadow-sm"><p class="text-sm font-medium text-hall-500 dark:text-hall-400 truncate">Total Revenue</p><div class="mt-2 flex items-baseline gap-2"><p class="text-3xl font-semibold text-hall-900 dark:text-ink">$71,897</p><p class="text-sm font-medium text-green-600 dark:text-green-400">+12%</p></div></div><div class="bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-6 shadow-sm"><p class="text-sm font-medium text-hall-500 dark:text-hall-400 truncate">Active Users</p><div class="mt-2 flex items-baseline gap-2"><p class="text-3xl font-semibold text-hall-900 dark:text-ink">12,450</p><p class="text-sm font-medium text-green-600 dark:text-green-400">+5.4%</p></div></div><div class="bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-xl p-6 shadow-sm"><p class="text-sm font-medium text-hall-500 dark:text-hall-400 truncate">New Signups</p><div class="mt-2 flex items-baseline gap-2"><p class="text-3xl font-semibold text-hall-900 dark:text-ink">892</p><p class="text-sm font-medium text-rose-600 dark:text-rose-400">-2.1%</p></div></div></div>`
      }
    ]
  }
];

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onInsertComponent, savedComponents = {}, onClose }) => {
  const customItems = Object.entries(savedComponents).map(([name, html]) => ({ name, html }));

  return (
    <div className="w-80 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-hall-900 dark:text-ink tracking-wide">Components</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-hall-500 hover:text-hall-900 hover:bg-hall-200 dark:hover:text-ink dark:hover:bg-hall-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        <div className="text-xs text-hall-500 dark:text-hall-400 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-2">
          <MousePointerClick className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p>Click a component to append it to the selected element on the Stage, or drag and drop it.</p>
        </div>

        {customItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2 px-1">
              <Settings2 className="w-3.5 h-3.5" />
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
                  className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg p-3 transition-colors group cursor-grab active:cursor-grabbing"
                >
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {item.name}
                  </span>
                  <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-indigo-600 dark:text-indigo-300 text-xs">+</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {COMPONENTS.map((group, i) => (
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
      </div>
    </div>
  );
};

export default ComponentLibrary;