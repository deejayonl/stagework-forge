const fs = require('fs');
let code = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

code = code.replace(
    "absolute left-0 right-0 bottom-0 top-[64px] z-10 px-2 pb-24 md:px-4 md:pb-32",
    "absolute left-0 right-0 bottom-0 top-[64px] z-10 px-1 sm:px-2 pb-24 md:px-4 md:pb-32"
);

fs.writeFileSync('src/routes/forge/ForgeView.tsx', code);
