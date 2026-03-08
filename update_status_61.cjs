const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/STATUS.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '## Phase 61: Component Library Search & Filter Polish\n*Status: In Progress*',
  '## Phase 61: Component Library Search & Filter Polish\n*Status: Complete*'
);

fs.writeFileSync(path, content);
console.log('Status updated.');
