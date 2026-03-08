const fs = require('fs');
let status = fs.readFileSync('STATUS.md', 'utf-8');
status = status.replace('## Phase 1: Thin Client & BFF Foundation\n*Status: In Progress*', '## Phase 1: Thin Client & BFF Foundation\n*Status: Complete*');
status = status.replace('## Phase 2: The "Script" Tab (Ideation & Input)\n*Status: Pending*', '## Phase 2: The "Script" Tab (Ideation & Input)\n*Status: In Progress*');
fs.writeFileSync('STATUS.md', status);
