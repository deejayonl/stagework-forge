const fs = require('fs');
const path = './src/utils/injectEditorScript.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `tagName: selectedElement.tagName.toLowerCase(),\n              path: getElementPath(selectedElement),`,
  `tagName: selectedElement.tagName.toLowerCase(),\n              className: selectedElement.className,\n              path: getElementPath(selectedElement),`
);

fs.writeFileSync(path, code);
