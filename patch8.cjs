const fs = require('fs');
let content = fs.readFileSync('./src/components/PropertyInspector.tsx', 'utf8');

content = content.replace(
  /handleStyleChange\(property, value, isHoverMode \? 'hover' : undefined\);/,
  "onUpdateStyle(property, value, isHoverMode ? 'hover' : undefined);"
);

fs.writeFileSync('./src/components/PropertyInspector.tsx', content);
