const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

// We need to see the JSX structure
console.log(code.substring(code.indexOf('return ('), code.indexOf('return (') + 2000));
