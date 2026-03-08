const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf8');

content = content.replace(
  /type: 'FORGE_UPDATE_STYLE',\n\s*id: selectedElement\.id,\n\s*property,\n\s*value,\n\s*breakpoint\n\s*\}, '\*'\);/,
  `type: 'FORGE_UPDATE_STYLE',
        id: selectedElement.id,
        property,
        value,
        breakpoint: activeBreakpoint,
        state
      }, '*');`
);

fs.writeFileSync('./src/components/Workspace.tsx', content);
