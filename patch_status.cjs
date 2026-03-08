const fs = require('fs');
let code = fs.readFileSync('STATUS.md', 'utf8');

code = code.replace(
    /## Phase 49: Advanced Export & Deployment Options\n\*Status: Pending\*\n\n- \[ \] \*\*Task 49\.1: Next\.js App Router Export\*\*\n  - Add support for exporting the project as a Next\.js App Router application \(using `app\/page\.tsx` structure\)\.\n- \[ \] \*\*Task 49\.2: Vue 3 Export\*\*\n  - Add support for exporting the project as a Vue 3 Single File Component \(`\.vue`\)\./,
    `## Phase 49: Advanced Export & Deployment Options\n*Status: Complete*\n\n- [x] **Task 49.1: Next.js App Router Export**\n  - Add support for exporting the project as a Next.js App Router application (using \`app/page.tsx\` structure).\n- [x] **Task 49.2: Vue 3 Export**\n  - Add support for exporting the project as a Vue 3 Single File Component (\`.vue\`).`
);

fs.writeFileSync('STATUS.md', code);
