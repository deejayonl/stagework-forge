const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

const matches = [...code.matchAll(/return \(/g)];
const mainReturn = matches[matches.length - 1];
console.log(code.substring(mainReturn.index, mainReturn.index + 2000));
