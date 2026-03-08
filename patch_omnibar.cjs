const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/components/OmniBar.tsx', 'utf8');

code = code.replace(
    'className="absolute bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-[60]"',
    'className="fixed md:absolute bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-[60]"'
);

fs.writeFileSync('src/routes/studio/components/OmniBar.tsx', code);
