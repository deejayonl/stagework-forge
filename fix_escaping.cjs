const fs = require('fs');
const path = require('path');

function fixFile(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/\\`/g, '`');
  code = code.replace(/\\\$/g, '$');
  fs.writeFileSync(filePath, code);
  console.log("Fixed escaping in", file);
}

fixFile('server/src/routes/generate.ts');
fixFile('server/src/routes/mutate.ts');
