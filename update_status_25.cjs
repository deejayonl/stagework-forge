const fs = require('fs');
const file = './STATUS.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /- \[ \] \*\*Task 25.1: Form Element Support in Editor\*\*/g,
  `- [x] **Task 25.1: Form Element Support in Editor**`
);
content = content.replace(
  /- \[ \] \*\*Task 25.2: Form Submission Handling\*\*/g,
  `- [x] **Task 25.2: Form Submission Handling**`
);
content = content.replace(
  /- \[ \] \*\*Task 25.3: Input Validation UI\*\*/g,
  `- [x] **Task 25.3: Input Validation UI**`
);
content = content.replace(
  /\*Status: In Progress\*/g,
  `*Status: Complete*`
);

fs.writeFileSync(file, content);
