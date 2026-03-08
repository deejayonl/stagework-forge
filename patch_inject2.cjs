const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /id: el\.dataset\.forgeId,\n            tagName: el\.tagName\.toLowerCase\(\),\n            className: el\.className,\n            children\n          \};/,
  \`id: el.dataset.forgeId,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            children,
            path: getElementPath(el)
          };\`
);

fs.writeFileSync(file, content);
console.log('Patched injectEditorScript.ts for path');
