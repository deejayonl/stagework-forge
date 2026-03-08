const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let code = fs.readFileSync(filePath, 'utf8');

const target = `        scrollStyle.textContent = \`
          .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
          }
        \`;`;

const replacement = `        scrollStyle.textContent = '.animate-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; } .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }';`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
