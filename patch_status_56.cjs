const fs = require('fs');
const path = 'STATUS.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "## Phase 56: Advanced Animation & Interaction Engine\n*Status: Pending*\n\n- [ ] **Task 56.1",
  "## Phase 56: Advanced Animation & Interaction Engine\n*Status: Complete*\n\n- [x] **Task 56.1"
);

content = content.replace(
  "- [ ] **Task 56.2",
  "- [x] **Task 56.2"
);

content = content.replace(
  "- [ ] **Task 56.3",
  "- [x] **Task 56.3"
);

fs.writeFileSync(path, content);
console.log('Patched STATUS.md');
