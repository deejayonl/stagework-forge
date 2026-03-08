const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyInspector.tsx', 'utf8');

code = code.replace(
    'className="w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-l border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-y-auto"',
    'className="w-full md:w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-t md:border-l md:border-t-0 border-hall-200 dark:border-hall-800 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl z-50 overflow-y-auto rounded-t-3xl md:rounded-none"'
);

fs.writeFileSync('src/components/PropertyInspector.tsx', code);
