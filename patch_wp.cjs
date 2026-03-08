const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/components/WorkspacePanel.tsx', 'utf8');

code = code.replace(
    'className="fixed top-20 left-4 right-4 md:absolute md:top-16 md:left-0 md:right-auto md:w-80 glass-panel rounded-3xl p-2 shadow-2xl border border-white/20 dark:border-white/10 origin-top md:origin-top-left animate-scale-in z-[100] flex flex-col overflow-hidden"',
    'className="fixed bottom-0 top-auto left-0 right-0 md:absolute md:top-16 md:bottom-auto md:left-0 md:right-auto md:w-80 glass-panel rounded-t-3xl md:rounded-3xl p-4 md:p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-2xl border-t md:border border-white/20 dark:border-white/10 origin-bottom md:origin-top-left animate-slide-up md:animate-scale-in z-[100] flex flex-col overflow-hidden max-h-[70vh] md:max-h-none"'
);

fs.writeFileSync('src/routes/studio/components/WorkspacePanel.tsx', code);
