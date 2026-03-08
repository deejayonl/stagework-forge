const fs = require('fs');
const file = './src/components/PropertyInspector.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/selectedElement\.getAttribute\('href'\)/g, "selectedElement.attributes?.href");

fs.writeFileSync(file, content);
