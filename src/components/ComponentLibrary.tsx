import React, { useState } from 'react';
import { MessageSquare, Mail, ShoppingCart, LayoutTemplate, CheckSquare, CreditCard, LayoutGrid, MousePointerClick, Table, Settings2, X, Search } from 'lucide-react';

interface ComponentLibraryProps {
  onInsertComponent: (html: string) => void;
  savedComponents?: Record<string, string>;
  onClose: () => void;
}

const COMPONENTS = [
  {
    category: 'Animations',
    icon: <LayoutGrid className="w-4 h-4" />,
    items: [
      {
        name: 'Lottie Animation',
        html: `<div class="w-64 h-64 mx-auto"><script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script><lottie-player src="https://assets2.lottiefiles.com/packages/lf20_UJNc2t.json" background="transparent" speed="1" style="width: 100%; height: 100%;" loop autoplay></lottie-player></div>`
      },
      {
        name: 'Rive Animation',
        html: `<div class="w-64 h-64 mx-auto"><canvas id="rive-canvas" width="500" height="500" style="width: 100%; height: 100%;"></canvas><script src="https://unpkg.com/@rive-app/canvas@2.7.0"></script><script>new rive.Rive({ src: 'https://cdn.rive.app/animations/vehicles.riv', canvas: document.getElementById('rive-canvas'), autoplay: true });</script></div>`
      }
    ]
  },
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
    category: 'Forms',
    icon: <MousePointerClick className="w-4 h-4" />,
    items: [
      {
        name: 'Contact Form',
        html: `<form class="max-w-md mx-auto p-6 bg-white dark:bg-black rounded-xl border border-hall-200 dark:border-hall-800 shadow-sm space-y-4"><div class="space-y-2"><label class="block text-sm font-medium text-hall-900 dark:text-ink">Name</label><input type="text" name="name" placeholder="John Doe" required class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" /></div><div class="space-y-2"><label class="block text-sm font-medium text-hall-900 dark:text-ink">Email</label><input type="email" name="email" placeholder="john@example.com" required class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" /></div><div class="space-y-2"><label class="block text-sm font-medium text-hall-900 dark:text-ink">Message</label><textarea name="message" rows="4" placeholder="How can we help?" required class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"></textarea></div><button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">Send Message</button></form>`
      },
      {
        name: 'Newsletter Signup',
        html: `<form class="max-w-xl mx-auto flex flex-col sm:flex-row gap-3"><input type="email" name="email" placeholder="Enter your email" required class="flex-1 px-4 py-3 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" /><button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap">Subscribe</button></form>`
      },
      {
        name: 'Input Field',
        html: `<input type="text" name="input" placeholder="Type here..." class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />`
      },
      {
        name: 'Textarea',
        html: `<textarea name="textarea" rows="4" placeholder="Type your message..." class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"></textarea>`
      },
      {
        name: 'Select Dropdown',
        html: `<select name="select" class="w-full px-4 py-2 border border-hall-200 dark:border-hall-800 rounded-lg bg-white dark:bg-black text-hall-900 dark:text-ink focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"><option value="">Select an option</option><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option></select>`
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


  {
    category: 'Forms',
    icon: <Mail className="w-4 h-4" />,
    items: [
      {
        name: 'Contact Form',
        html: `<section class="py-24 bg-white dark:bg-black"><div class="max-w-3xl mx-auto px-6"><div class="text-center mb-12"><h2 class="text-3xl font-bold text-hall-900 dark:text-ink">Get in touch</h2><p class="mt-4 text-hall-600 dark:text-hall-400">We'd love to hear from you. Please fill out this form.</p></div><form class="space-y-6 bg-hall-50 dark:bg-hall-950 p-8 rounded-2xl border border-hall-200 dark:border-hall-800"><div class="grid grid-cols-1 gap-6 sm:grid-cols-2"><div><label class="block text-sm font-medium text-hall-700 dark:text-hall-300">First name</label><input type="text" class="mt-2 block w-full rounded-md border-hall-300 dark:border-hall-700 bg-white dark:bg-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3" placeholder="Jane"></div><div><label class="block text-sm font-medium text-hall-700 dark:text-hall-300">Last name</label><input type="text" class="mt-2 block w-full rounded-md border-hall-300 dark:border-hall-700 bg-white dark:bg-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3" placeholder="Doe"></div></div><div><label class="block text-sm font-medium text-hall-700 dark:text-hall-300">Email</label><input type="email" class="mt-2 block w-full rounded-md border-hall-300 dark:border-hall-700 bg-white dark:bg-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3" placeholder="you@example.com"></div><div><label class="block text-sm font-medium text-hall-700 dark:text-hall-300">Message</label><textarea rows="4" class="mt-2 block w-full rounded-md border-hall-300 dark:border-hall-700 bg-white dark:bg-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3" placeholder="How can we help?"></textarea></div><button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">Send message</button></form></div></section>`
      },
      {
        name: 'Newsletter Signup',
        html: `<section class="py-16 bg-indigo-600 dark:bg-indigo-900"><div class="max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:justify-between"><div class="lg:w-0 lg:flex-1"><h2 class="text-3xl font-extrabold text-white sm:text-4xl">Sign up for our newsletter</h2><p class="mt-4 max-w-3xl text-lg text-indigo-100">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.</p></div><div class="mt-8 lg:mt-0 lg:ml-8"><form class="sm:flex"><label for="email-address" class="sr-only">Email address</label><input id="email-address" name="email" type="email" autocomplete="email" required class="w-full px-5 py-3 border border-transparent placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white focus:border-white sm:max-w-xs rounded-md" placeholder="Enter your email"><div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0"><button type="submit" class="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white">Notify me</button></div></form><p class="mt-3 text-sm text-indigo-200">We care about the protection of your data. Read our <a href="#" class="text-white font-medium underline">Privacy Policy.</a></p></div></div></section>`
      }
    ]
  },
  {
    category: 'Testimonials',
    icon: <MessageSquare className="w-4 h-4" />,
    items: [
      {
        name: 'Testimonial Grid',
        html: `<section class="py-24 bg-hall-50 dark:bg-hall-950"><div class="max-w-7xl mx-auto px-6"><h2 class="text-center text-3xl font-bold text-hall-900 dark:text-ink mb-16">Loved by developers</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8"><div class="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-hall-200 dark:border-hall-800"><div class="flex gap-1 text-yellow-400 mb-4"><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div><p class="text-hall-700 dark:text-hall-300 mb-6">"This platform has completely transformed how we build products. The speed is unmatched."</p><div class="flex items-center gap-4"><img src="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" alt="Avatar" class="w-10 h-10 rounded-full" /><div><h4 class="text-sm font-bold text-hall-900 dark:text-ink">Sarah Jenkins</h4><p class="text-xs text-hall-500">CTO at TechCorp</p></div></div></div><div class="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-hall-200 dark:border-hall-800"><div class="flex gap-1 text-yellow-400 mb-4"><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div><p class="text-hall-700 dark:text-hall-300 mb-6">"I can't imagine going back to our old workflow. This saves us hundreds of hours."</p><div class="flex items-center gap-4"><img src="https://ui-avatars.com/api/?name=Michael+Chen&background=random" alt="Avatar" class="w-10 h-10 rounded-full" /><div><h4 class="text-sm font-bold text-hall-900 dark:text-ink">Michael Chen</h4><p class="text-xs text-hall-500">Lead Developer</p></div></div></div><div class="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-hall-200 dark:border-hall-800"><div class="flex gap-1 text-yellow-400 mb-4"><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div><p class="text-hall-700 dark:text-hall-300 mb-6">"The cleanest, most intuitive interface I have ever used. Highly recommended."</p><div class="flex items-center gap-4"><img src="https://ui-avatars.com/api/?name=Emma+Davis&background=random" alt="Avatar" class="w-10 h-10 rounded-full" /><div><h4 class="text-sm font-bold text-hall-900 dark:text-ink">Emma Davis</h4><p class="text-xs text-hall-500">Product Manager</p></div></div></div></div></div></section>`
      },
      {
        name: 'Featured Quote',
        html: `<section class="py-24 bg-indigo-600 dark:bg-indigo-900 overflow-hidden"><div class="relative max-w-7xl mx-auto px-6"><div class="relative"><img class="mx-auto h-8" src="https://tailwindui.com/img/logos/workcation-logo-white.svg" alt="Workcation"><blockquote class="mt-10"><div class="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-white"><p>&ldquo;Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo expedita voluptas culpa sapiente alias molestiae. Numquam corrupti in laborum sed rerum et corporis.&rdquo;</p></div><footer class="mt-8"><div class="md:flex md:items-center md:justify-center"><div class="md:flex-shrink-0"><img class="mx-auto h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""></div><div class="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center"><div class="text-base font-medium text-white">Judith Black</div><svg class="hidden md:block mx-1 h-5 w-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path d="M11 0h3L9 20H6l5-20z" /></svg><div class="text-base font-medium text-indigo-200">CEO, Workcation</div></div></div></footer></blockquote></div></div></section>`
      }
    ]
  },

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onInsertComponent, savedComponents = {}, onClose }) => {
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
