const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('value="fadeIn 0.5s ease-in-out"', 'value="fade-in 0.5s ease-in-out"');
code = code.replace('value="slideInUp 0.5s ease-out"', 'value="fade-in-up 0.5s ease-out"');

fs.writeFileSync(path, code, 'utf8');
