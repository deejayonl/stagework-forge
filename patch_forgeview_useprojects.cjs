const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

code = code.replace(
  "updateCurrentVersion,",
  "updateCurrentVersion,\n    addVersionToProject,"
);

fs.writeFileSync(forgeViewPath, code);
