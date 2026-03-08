const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const regex = /const handleFileChange = \([\s\S]*?\}\s*\};\s*const handleFileChange = \(/;
content = content.replace(regex, 'const handleFileChange = (');

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Removed duplicate handleFileChange');
