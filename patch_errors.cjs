const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix 1: Add `pages` to destructured props
code = code.replace(
  'onSaveComponent\n}) => {',
  'onSaveComponent,\n  pages = []\n}) => {'
);

// Fix 2: Add `(c: any)` to `Object.values(collections).map(c =>`
code = code.replace(
  'Object.values(collections).map(c => (',
  'Object.values(collections).map((c: any) => ('
);

fs.writeFileSync(path, code);
