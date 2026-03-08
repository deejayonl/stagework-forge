const fs = require('fs');
let content = fs.readFileSync('./src/components/PropertyInspector.tsx', 'utf8');

content = content.replace(
  /const \[isFixing, setIsFixing\] = useState\(false\);/,
  'const [isFixing, setIsFixing] = useState(false);\n  const [isHoverMode, setIsHoverMode] = useState(false);'
);

fs.writeFileSync('./src/components/PropertyInspector.tsx', content);
