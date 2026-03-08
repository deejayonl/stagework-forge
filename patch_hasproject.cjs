const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

code = code.replace(
  "const hasProject = currentFiles.length > 0;",
  "const hasProject = currentFiles.length > 0 || projects.length > 0;"
);

fs.writeFileSync(forgeViewPath, code);
