const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/src/app.ts');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "import { projectRoutes } from './routes/projects.js';",
  "import { projectRoutes } from './routes/projects.js';\nimport { exportRoutes } from './routes/export.js';"
);

code = code.replace(
  "app.route('/api/projects', projectRoutes);",
  "app.route('/api/projects', projectRoutes);\napp.route('/api/export', exportRoutes);"
);

fs.writeFileSync(filePath, code);
console.log("Patched app.ts");
