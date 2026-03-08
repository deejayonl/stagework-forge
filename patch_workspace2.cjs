const fs = require('fs');
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

code = code.replace(
    "'w-full rounded-[32px] border border-hall-200 dark:border-hall-800'",
    "'w-full rounded-2xl md:rounded-[32px] border-x-0 md:border-x border-y border-hall-200 dark:border-hall-800'"
);

code = code.replace(
    'bg-hall-50 dark:bg-hall-900/50 rounded-t-2xl md:rounded-t-3xl',
    'bg-hall-50 dark:bg-hall-900/50 rounded-t-2xl md:rounded-t-[32px]'
);

fs.writeFileSync('src/components/Workspace.tsx', code);
