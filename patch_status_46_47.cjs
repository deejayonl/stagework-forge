const fs = require('fs');
const file = 'STATUS.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '## Phase 46: Advanced Spacing Controls (Tailwind Margin/Padding GUI)\n*Status: Pending*',
  '## Phase 46: Advanced Spacing Controls (Tailwind Margin/Padding GUI)\n*Status: Complete*'
);

content = content.replace(
  '- [ ] **Task 46.1: Margin Visual Editor**',
  '- [x] **Task 46.1: Margin Visual Editor**'
);

content = content.replace(
  '- [ ] **Task 46.2: Padding Visual Editor**',
  '- [x] **Task 46.2: Padding Visual Editor**'
);

content = content.replace(
  '- [ ] **Task 46.3: Tailwind Class Sync**',
  '- [x] **Task 46.3: Tailwind Class Sync**'
);

content = content.replace(
  '## Phase 47: Advanced Typography Controls (Tailwind GUI)\n*Status: Pending*',
  '## Phase 47: Advanced Typography Controls (Tailwind GUI)\n*Status: Complete*'
);

content = content.replace(
  '- [ ] **Task 47.1: Text Size & Weight**',
  '- [x] **Task 47.1: Text Size & Weight**'
);

content = content.replace(
  '- [ ] **Task 47.2: Text Alignment & Color**',
  '- [x] **Task 47.2: Text Alignment & Color**'
);

fs.writeFileSync(file, content);
