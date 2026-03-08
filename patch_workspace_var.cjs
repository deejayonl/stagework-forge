const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Workspace.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/breakpoint: activeBreakpoint,/g, 'breakpoint,');
fs.writeFileSync(filePath, code);
console.log('patched');
