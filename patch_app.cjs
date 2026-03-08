const fs = require('fs');
const path = './server/src/app.ts';

let content = fs.readFileSync(path, 'utf8');

// Add import
const importTarget = `import { auditRoutes } from './routes/audit.js';`;
const importReplacement = `import { auditRoutes } from './routes/audit.js';\nimport { logicRoutes } from './routes/logic.js';`;

// Add route
const routeTarget = `app.route('/api/audit', auditRoutes);`;
const routeReplacement = `app.route('/api/audit', auditRoutes);\napp.route('/api/generate-logic', logicRoutes);`;

if (content.includes(importTarget)) {
  content = content.replace(importTarget, importReplacement);
}
if (content.includes(routeTarget)) {
  content = content.replace(routeTarget, routeReplacement);
}

fs.writeFileSync(path, content);
console.log("Successfully added logic route to app.ts");
