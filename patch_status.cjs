const fs = require('fs');
const file = 'STATUS.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '- [ ] **Task 44.5.3: Script Tab Typography bounds**',
  '- [x] **Task 44.5.3: Script Tab Typography bounds**'
);

content = content.replace(
  '## Phase 45: Advanced Layout Controls (Flexbox/Grid GUI)\n*Status: Pending*',
  '## Phase 45: Advanced Layout Controls (Flexbox/Grid GUI)\n*Status: Complete*'
);

content = content.replace(
  '- [ ] **Task 45.1: Flexbox Visual Editor**',
  '- [x] **Task 45.1: Flexbox Visual Editor**'
);

content = content.replace(
  '- [ ] **Task 45.2: Grid Visual Editor**',
  '- [x] **Task 45.2: Grid Visual Editor**'
);

content = content.replace(
  '- [ ] **Task 45.3: Tailwind Class Sync**',
  '- [x] **Task 45.3: Tailwind Class Sync**'
);

fs.writeFileSync(file, content);
