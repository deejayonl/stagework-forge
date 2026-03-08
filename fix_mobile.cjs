const fs = require('fs');
const STATUS_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/STATUS.md';

let content = fs.readFileSync(STATUS_PATH, 'utf-8');
content = content.replace(/- \[x\] \*\*Task 4\.5\.1: Global Mobile Navigation\*\*/g, '- [ ] **Task 4.5.1: Global Mobile Navigation**');
content = content.replace(/- \[x\] \*\*Task 4\.5\.2: Responsive Script Tab\*\*/g, '- [ ] **Task 4.5.2: Responsive Script Tab**');
content = content.replace(/- \[x\] \*\*Task 4\.5\.3: Responsive Studio & Stage\*\*/g, '- [ ] **Task 4.5.3: Responsive Studio & Stage**');

fs.writeFileSync(STATUS_PATH, content);
