const fs = require('fs');
const path = './STATUS.md';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('- [ ] **Task 33.1', '- [x] **Task 33.1');
code = code.replace('*Status: In Progress*', '*Status: Complete*');

fs.writeFileSync(path, code, 'utf8');
