const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'STATUS.md');
let code = fs.readFileSync(filePath, 'utf8');

const target = `## Phase 14: Animation & Interaction Engine
*Status: In Progress*`;
const replacement = `## Phase 14: Animation & Interaction Engine
*Status: Completed*`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
