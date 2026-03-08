const fs = require('fs');
let content = fs.readFileSync('STATUS.md', 'utf8');

content = content.replace(
  "## Phase 36: Mobile Live Preview & Sync Enhancements\n*Status: In Progress*",
  "## Phase 36: Mobile Live Preview & Sync Enhancements\n*Status: Complete*"
);

fs.writeFileSync('STATUS.md', content);
