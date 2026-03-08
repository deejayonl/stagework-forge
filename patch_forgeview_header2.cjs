const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  /onOpenCloudConfig=\{\(\) => setIsCloudConfigOpen\(true\)\}/,
  ""
);

code = code.replace(
  /isSyncing=\{isSyncing\}/,
  ""
);

code = code.replace(
  /syncError=\{syncError\}/,
  ""
);

fs.writeFileSync(filePath, code);
console.log("Patched ForgeView.tsx header again");
