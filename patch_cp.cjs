const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/components/ControlPanel.tsx', 'utf8');

code = code.replace(
    'className="fixed top-20 left-4 right-4 md:absolute md:top-16 md:right-0 md:left-auto md:w-72 glass-panel rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 origin-top md:origin-top-right animate-scale-in z-[100] flex flex-col overflow-hidden"',
    'className="fixed bottom-0 top-auto left-0 right-0 md:absolute md:top-16 md:bottom-auto md:right-0 md:left-auto md:w-72 glass-panel rounded-t-3xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-2xl border-t md:border border-white/20 dark:border-white/10 origin-bottom md:origin-top-right animate-slide-up md:animate-scale-in z-[100] flex flex-col overflow-hidden max-h-[80vh] md:max-h-none"'
);

fs.writeFileSync('src/routes/studio/components/ControlPanel.tsx', code);
