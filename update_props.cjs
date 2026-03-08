const fs = require('fs');
const filePath = 'src/components/PropertyInspector.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  activeBreakpoint?: 'desktop' | 'tablet' | 'mobile';
}`,
  `  activeBreakpoint?: 'desktop' | 'tablet' | 'mobile';
  theme?: Record<string, string>;
}`
);

content = content.replace(
  `  activeBreakpoint = 'desktop'
}) => {`,
  `  activeBreakpoint = 'desktop',
  theme = {}
}) => {`
);

fs.writeFileSync(filePath, content);
