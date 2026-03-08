const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'px-2 pb-safe shadow',
  'px-2 pb-[env(safe-area-inset-bottom)] shadow'
);

fs.writeFileSync(filePath, code);
console.log("Patched App.tsx for safe area");
