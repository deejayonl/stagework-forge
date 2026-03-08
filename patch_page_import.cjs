const fs = require('fs');
let code = fs.readFileSync('server/src/routes/export.ts', 'utf8');

code = code.replace(
    "archive.append(`export default function Home() {",
    "archive.append(`import React from 'react'\n\nexport default function Home() {"
);

fs.writeFileSync('server/src/routes/export.ts', code);
