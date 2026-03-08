const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/document\.querySelector\(\`\[data-forge-id="\$\{id\}"\]\`\)/g, 'document.querySelector(\`[data-forge-id="\${id}"]\`)');
fs.writeFileSync(filePath, code);
console.log('patched');
