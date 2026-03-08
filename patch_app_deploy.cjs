const fs = require('fs');
let appCode = fs.readFileSync('server/src/app.ts', 'utf8');

appCode = appCode.replace(
  "import { autofixRoutes } from './routes/autofix.js';",
  "import { autofixRoutes } from './routes/autofix.js';\nimport { deployRoutes } from './routes/deploy.js';"
);

appCode = appCode.replace(
  "app.route('/api/autofix', autofixRoutes);",
  "app.route('/api/autofix', autofixRoutes);\napp.route('/api/deploy', deployRoutes);"
);

fs.writeFileSync('server/src/app.ts', appCode);
