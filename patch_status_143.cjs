const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'STATUS.md');
let code = fs.readFileSync(filePath, 'utf8');

const target = '- [ ] **Task 14.3: Scroll Triggers (Intersection Observer)**';
const replacement = '- [x] **Task 14.3: Scroll Triggers (Intersection Observer)**';

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
