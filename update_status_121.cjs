const fs = require('fs');
let status = fs.readFileSync('STATUS.md', 'utf8');

status = status.replace(
  '- [ ] **Task 12.1: Vercel Integration**',
  '- [x] **Task 12.1: Vercel Integration**'
);

fs.writeFileSync('STATUS.md', status);
