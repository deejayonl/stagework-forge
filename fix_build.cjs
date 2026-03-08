const fs = require('fs');
const path = require('path');

let f1 = path.join(__dirname, 'server/src/routes/export.ts');
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace("archive.on('error', (err) => stream.close());", "archive.on('error', (_err) => stream.close());");
fs.writeFileSync(f1, c1);

let f2 = path.join(__dirname, 'server/src/routes/generate.ts');
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace("image.image.imageBytes", "image.image?.imageBytes");
c2 = c2.replace("image.image.imageBytes", "image.image?.imageBytes");
fs.writeFileSync(f2, c2);

console.log("Fixed build errors");
