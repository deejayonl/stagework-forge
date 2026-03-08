const fs = require('fs');
let status = fs.readFileSync('STATUS.md', 'utf8');

// Update Phase 3 status
status = status.replace(
  '## Phase 3: The "Studio" Tab (Design & Blueprint)\n*Status: In Progress*',
  '## Phase 3: The "Studio" Tab (Design & Blueprint)\n*Status: Complete*'
);

// Update Task 3.4
status = status.replace(
  '- [ ] **Task 3.4: Theatrical Transition (Studio -> Stage)**',
  '- [x] **Task 3.4: Theatrical Transition (Studio -> Stage)**'
);

// Update Phase 4 status
status = status.replace(
  '## Phase 4: The "Stage" Tab (Real-time Mutation)\n*Status: Pending*',
  '## Phase 4: The "Stage" Tab (Real-time Mutation)\n*Status: In Progress*'
);

fs.writeFileSync('STATUS.md', status);
console.log('Updated STATUS.md');
