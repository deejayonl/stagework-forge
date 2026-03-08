const fs = require('fs');
const path = './src/components/Workspace.tsx';
let code = fs.readFileSync(path, 'utf8');

const badCode = `aria-label="Variables"
           >
           
           <button`;
           
const goodCode = `aria-label="Variables"
           >
             <Database className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Variables
             </div>
           </button>

           <button`;

code = code.replace(badCode, goodCode);
fs.writeFileSync(path, code);
