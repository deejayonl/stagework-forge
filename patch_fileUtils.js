const fs = require('fs');

const fileContent = fs.readFileSync('./src/utils/fileUtils.ts', 'utf-8');
const injectScriptImport = `import { injectEditorScript } from './injectEditorScript';\n`;

// Add import at the top
let newContent = injectScriptImport + fileContent;

// Find flattenFilesForPreview
const targetString = `return htmlContent;`;
const replacementString = `return injectEditorScript(htmlContent);`;

newContent = newContent.replace(targetString, replacementString);

fs.writeFileSync('./src/utils/fileUtils.ts', newContent);
console.log('Patched fileUtils.ts');
