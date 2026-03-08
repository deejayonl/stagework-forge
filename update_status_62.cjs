const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/STATUS.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '- [ ] **Task 62.1: Forms & Inputs Components**',
  '- [x] **Task 62.1: Forms & Inputs Components**'
);
content = content.replace(
  '- [ ] **Task 62.2: Testimonials & Social Proof**',
  '- [x] **Task 62.2: Testimonials & Social Proof**'
);
content = content.replace(
  '## Phase 62: Extended UI Components\n*Status: In Progress*',
  '## Phase 62: Extended UI Components\n*Status: Complete*'
);

fs.writeFileSync(path, content);
console.log('Status updated for Phase 62.');
