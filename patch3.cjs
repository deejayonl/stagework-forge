const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf8');

content = content.replace(
  /const handleUpdateStyle = \(property: string, value: string\) => \{/,
  'const handleUpdateStyle = (property: string, value: string, state?: string) => {'
);

content = content.replace(
  /property\,\n\s*value\,\n\s*breakpoint: activeBreakpoint\n\s*\}\);/,
  'property,\n        value,\n        breakpoint: activeBreakpoint,\n        state\n      });'
);

fs.writeFileSync('./src/components/Workspace.tsx', content);
