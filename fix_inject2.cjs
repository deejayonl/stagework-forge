const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let code = fs.readFileSync(filePath, 'utf8');

const target = 'const el = document.querySelector(`[data-forge-id="${id}"]`);';
const replacement = 'const el = document.querySelector(`[data-forge-id="${id}"]`);'.replace(/\`/g, '\\`').replace(/\$\{/g, '\\${');

code = code.split(target).join(replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
