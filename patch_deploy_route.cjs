const fs = require('fs');
let code = fs.readFileSync('server/src/routes/deploy.ts', 'utf8');

code = code.replace(
  "deployRoutes.get('/:id', async (c) => {",
  "deployRoutes.get('/vercel/:id', async (c) => {"
);

fs.writeFileSync('server/src/routes/deploy.ts', code);
