const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "    startNewProject,\n    canUndo",
  "    startNewProject,\n    loadProjectsFromBFF,\n    canUndo"
);

fs.writeFileSync(filePath, code);
console.log("Patched ForgeView.tsx destructuring");
