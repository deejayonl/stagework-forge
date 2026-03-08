const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/components/ContextualTuningChat.tsx', 'utf8');

code = code.replace(
    'className="absolute right-4 top-24 w-[calc(100vw-2rem)] md:w-96 max-h-[calc(100vh-12rem)] md:max-h-[calc(100vh-8rem)] bg-hall-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-hall-700/50 z-[60] flex flex-col animate-fade-in"',
    'className="fixed bottom-0 right-0 left-0 md:absolute md:top-24 md:bottom-auto md:left-auto md:right-4 w-full md:w-96 max-h-[85vh] md:max-h-[calc(100vh-8rem)] bg-hall-900/90 backdrop-blur-xl rounded-t-3xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl border-t md:border border-hall-700/50 z-[100] md:z-[60] flex flex-col animate-slide-up md:animate-fade-in"'
);

fs.writeFileSync('src/routes/studio/components/ContextualTuningChat.tsx', code);
