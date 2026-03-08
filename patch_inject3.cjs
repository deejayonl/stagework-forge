const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let content = fs.readFileSync(file, 'utf8');

const oldStr = `          return {
            id: el.dataset.forgeId,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            children
          };`;

const newStr = `          return {
            id: el.dataset.forgeId,
            tagName: el.tagName.toLowerCase(),
            className: el.className,
            children,
            path: getElementPath(el)
          };`;

content = content.replace(oldStr, newStr);

fs.writeFileSync(file, content);
console.log('Patched injectEditorScript.ts for path');
