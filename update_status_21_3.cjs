const fs = require('fs');
const path = './STATUS.md';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("- [ ] **Task 21.3: Data Binding to UI Components**", "- [x] **Task 21.3: Data Binding to UI Components**");

fs.writeFileSync(path, code);
