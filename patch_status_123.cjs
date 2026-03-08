const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'STATUS.md');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '- [ ] **Task 12.3: Custom Domains**',
  '- [x] **Task 12.3: Custom Domains**'
);

content = content.replace(
  '*Status: In Progress*',
  '*Status: Complete*'
);

fs.writeFileSync(filePath, content);
console.log('Updated STATUS.md for Task 12.3');
