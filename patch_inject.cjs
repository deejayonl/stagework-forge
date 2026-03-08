const fs = require('fs');
const file = './src/utils/injectEditorScript.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /path: getElementPath\(selectedElement\),/g,
  `path: getElementPath(selectedElement),
              attributes: Array.from(selectedElement.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              }, {}),`
);

fs.writeFileSync(file, content);
