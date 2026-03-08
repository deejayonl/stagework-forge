const fs = require('fs');
let content = fs.readFileSync('STATUS.md', 'utf8');

content = content.replace(/## Phase 44\.5: Mobile Layout Finalization \(Stage\)\n\*Status: Pending\*/g, '## Phase 44.5: Mobile Layout Finalization (Stage)\n*Status: Completed*');
content = content.replace(/- \[ \] \*\*Task 44\.5\.1: Stage Input Viewport Fix\*\*/g, '- [x] **Task 44.5.1: Stage Input Viewport Fix**');
content = content.replace(/- \[ \] \*\*Task 44\.5\.2: Top Header & Iframe Resizing\*\*/g, '- [x] **Task 44.5.2: Top Header & Iframe Resizing**');

fs.writeFileSync('STATUS.md', content);
