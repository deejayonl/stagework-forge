const fs = require('fs');
const filePath = 'src/utils/injectEditorScript.ts';
let content = fs.readFileSync(filePath, 'utf8');
const regex = /\/\/ Inject Google Font[\s\S]*?\/\/ Apply globally\s*document\.body\.style\.fontFamily = \`"\\?\${theme\.fontFamily}", sans-serif\`;\s*\}/;
console.log(regex.test(content));
