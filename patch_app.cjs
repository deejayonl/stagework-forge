const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<div className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] bg-surface/90 backdrop-blur-md border-t border-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">',
    '<div className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] bg-surface/80 backdrop-blur-xl border-t border-border/50 z-[100] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">'
);

code = code.replace(
    '`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${',
    '`flex flex-col items-center justify-center w-full min-h-[44px] space-y-1 transition-all duration-300 ${'
);

fs.writeFileSync('src/App.tsx', code);
