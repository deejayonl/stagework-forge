const fs = require('fs');
let code = fs.readFileSync('server/src/routes/export.ts', 'utf8');

code = code.replace(
    "export default function RootLayout({ children }: { children: React.ReactNode }) {",
    "import React from 'react'\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {"
);

fs.writeFileSync('server/src/routes/export.ts', code);
