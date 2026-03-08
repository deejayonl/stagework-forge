const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "bottom-6 md:bottom-8 translate-y-0 scale-100",
  "bottom-[80px] md:bottom-8 translate-y-0 scale-100"
);

fs.writeFileSync(filePath, code);
console.log("Patched ForgeView.tsx for bottom spacing");
