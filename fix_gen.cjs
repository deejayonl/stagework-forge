const fs = require('fs');
const path = require('path');
let f2 = path.join(__dirname, 'server/src/routes/generate.ts');
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/image\.image/g, "image?.image");
fs.writeFileSync(f2, c2);
console.log("Fixed generate.ts");
