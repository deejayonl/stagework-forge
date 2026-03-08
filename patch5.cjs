const fs = require('fs');
let content = fs.readFileSync('./src/components/PropertyInspector.tsx', 'utf8');

content = content.replace(
  /onUpdateStyle: \(property: string, value: string\) => void;/,
  'onUpdateStyle: (property: string, value: string, state?: string) => void;'
);

fs.writeFileSync('./src/components/PropertyInspector.tsx', content);
