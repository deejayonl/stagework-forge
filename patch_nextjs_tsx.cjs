const fs = require('fs');
let code = fs.readFileSync('server/src/routes/export.ts', 'utf8');

code = code.replace(
    "}`, { name: 'app/layout.jsx' });",
    "}`, { name: 'app/layout.tsx' });"
);

code = code.replace(
    "}`, { name: 'app/page.jsx' });",
    "}`, { name: 'app/page.tsx' });"
);

code = code.replace(
    "export default function RootLayout({ children }) {",
    "export default function RootLayout({ children }: { children: React.ReactNode }) {"
);

fs.writeFileSync('server/src/routes/export.ts', code);
