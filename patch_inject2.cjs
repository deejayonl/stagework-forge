const fs = require('fs');
const path = './src/utils/injectEditorScript.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `} else if (e.data.type === 'FORGE_UPDATE_TEXT') {`,
  `} else if (e.data.type === 'FORGE_TOGGLE_CLASS') {\n            const { id, className, toggle } = e.data;\n            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);\n            if (el) {\n              if (toggle) el.classList.add(className);\n              else el.classList.remove(className);\n              updateBox(highlightBox, el);\n            }\n          } else if (e.data.type === 'FORGE_UPDATE_TEXT') {`
);

fs.writeFileSync(path, code);
