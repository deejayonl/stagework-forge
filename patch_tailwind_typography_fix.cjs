const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/PropertyInspector.tsx');
let content = fs.readFileSync(file, 'utf8');

// The script above already ran, so we need to replace the generated code.
// Let's just fix the select for text size:

content = content.replace(
  `classes.forEach(c => { if (c.startsWith('text-')) onToggleClass(c, false); });`,
  `classes.forEach(c => { if (['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'].includes(c)) onToggleClass(c, false); });`
);

content = content.replace(
  `value={(selectedElement.className || '').split(' ').find(c => c.startsWith('text-')) || ''}`,
  `value={(selectedElement.className || '').split(' ').find(c => ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl'].includes(c)) || ''}`
);

fs.writeFileSync(file, content);
