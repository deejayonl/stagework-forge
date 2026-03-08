const fs = require('fs');

let content = fs.readFileSync('./STATUS.md', 'utf-8');

content = content.replace('- [ ] **Task 8.3: Inline Text Editing**', '- [x] **Task 8.3: Inline Text Editing**');
content = content.replace('- [ ] **Task 8.4: Layout Controls (Flex/Grid)**', '- [x] **Task 8.4: Layout Controls (Flex/Grid)**');

// Wait, Phase 8 is now fully complete! Let's update its status.
content = content.replace('## Phase 8: NoCode Visual Editor Engine\n*Status: In Progress*', '## Phase 8: NoCode Visual Editor Engine\n*Status: Complete*');

fs.writeFileSync('./STATUS.md', content);
console.log('Patched STATUS.md complete');
