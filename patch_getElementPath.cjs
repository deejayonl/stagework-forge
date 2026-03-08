const fs = require('fs');
let content = fs.readFileSync('./src/utils/injectEditorScript.ts', 'utf-8');

const newGetElementPath = `
        function getElementPath(el) {
          const path = [];
          let current = el;
          while (current && current !== document.body && current !== document.documentElement) {
            let index = 0;
            let sibling = current.previousElementSibling;
            while (sibling) {
              index++;
              sibling = sibling.previousElementSibling;
            }
            path.unshift(index);
            current = current.parentElement;
          }
          return path;
        }
`;

content = content.replace(/function getElementPath[\s\S]*?return path\.join\(' > '\);\n        \}/, newGetElementPath.trim());

fs.writeFileSync('./src/utils/injectEditorScript.ts', content);
console.log('Patched getElementPath');
