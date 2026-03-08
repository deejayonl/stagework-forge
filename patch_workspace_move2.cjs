const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Workspace.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldStr = `          <DOMTreeExplorer 
            tree={domTree} 
            selectedNodeId={selectedElement?.id || null} 
            onSelectNode={handleSelectNode}
            onClose={() => setIsTreeOpen(false)} 
          />`;

const newStr = `          <DOMTreeExplorer 
            tree={domTree} 
            selectedNodeId={selectedElement?.id || null} 
            onSelectNode={handleSelectNode}
            onMoveNode={handleMoveNode}
            onClose={() => setIsTreeOpen(false)} 
          />`;

content = content.replace(oldStr, newStr);

fs.writeFileSync(file, content);
console.log('Patched Workspace.tsx for onMoveNode');
