const fs = require('fs');
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

code = code.replace(
  'onDeploy?: (framework: string) => void;',
  'onDeploy?: (framework: string, provider: string) => void;'
);

code = code.replace(
  '<button \n              onClick={() => onDeploy(framework)}\n              className="px-6 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"\n            >\n              <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>\n              Deploy to Vercel\n            </button>',
  `<button 
              onClick={() => onDeploy(framework, 'vercel')}
              className="px-6 py-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
              Deploy to Vercel
            </button>
            <button 
              onClick={() => onDeploy(framework, 'github')}
              className="px-6 py-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Push to GitHub
            </button>`
);

fs.writeFileSync('src/components/ExportModal.tsx', code);
