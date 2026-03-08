const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

content = content.replace("const kebabProp = property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();", "const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());");

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched kebab regex');
