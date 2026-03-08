const fs = require('fs');
const path = './STATUS.md';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("- [ ] **Task 21.1: Data Collections Sidebar Panel**", "- [x] **Task 21.1: Data Collections Sidebar Panel**");
code = code.replace("- [ ] **Task 21.2: BFF Schema Generation & Storage**", "- [x] **Task 21.2: BFF Schema Generation & Storage**");

fs.writeFileSync(path, code);
