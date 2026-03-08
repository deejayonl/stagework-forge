const fs = require('fs');
let status = fs.readFileSync('STATUS.md', 'utf8');

status = status.replace(
  '- [ ] **Task 12.2: GitHub Integration**',
  '- [x] **Task 12.2: GitHub Integration**'
);

fs.writeFileSync('STATUS.md', status);
