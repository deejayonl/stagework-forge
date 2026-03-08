const fs = require('fs');
let content = fs.readFileSync('./src/components/PropertyInspector.tsx', 'utf8');

content = content.replace(
  /const handleMagicFix = async/g,
  `const handleStyleChange = (property: string, value: string) => {
    onUpdateStyle(property, value, isHoverMode ? 'hover' : undefined);
  };

  const handleMagicFix = async`
);

content = content.replace(/onUpdateStyle\(/g, 'handleStyleChange(');
// We need to revert the prop destructuring though
content = content.replace(/handleStyleChange: \(property: string, value: string, state\?: string\) => void;/g, 'onUpdateStyle: (property: string, value: string, state?: string) => void;');
content = content.replace(/handleStyleChange,\n  onToggleClass/g, 'onUpdateStyle,\n  onToggleClass');

fs.writeFileSync('./src/components/PropertyInspector.tsx', content);
