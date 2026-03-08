const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/DOMTreeExplorer.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onDrop=\{\(e\) => \{\n.*?setDragOverPos\(null\);\n      \}\}\n  \n        className=\{`flex items-center gap-1 py-1 px-2 cursor-pointer transition-colors \$\{dragOverPos === 'top' \? 'border-t-2 border-amber-500' : dragOverPos === 'bottom' \? 'border-b-2 border-amber-500' : dragOverPos === 'center' \? 'bg-amber-500\/30' : ''\} \$\{/s,
  \`onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== node.id && dragOverPos && onMoveNode) {
          onMoveNode(sourceId, node.id, dragOverPos === 'top' ? 'before' : dragOverPos === 'bottom' ? 'after' : 'inside');
        }
        setDragOverPos(null);
      }}
      className={\\\`flex items-center gap-1 py-1 px-2 cursor-pointer transition-colors \${dragOverPos === 'top' ? 'border-t-2 border-amber-500' : dragOverPos === 'bottom' ? 'border-b-2 border-amber-500' : dragOverPos === 'center' ? 'bg-amber-500/30' : ''} \${\`
);

fs.writeFileSync(file, content);
console.log('Fixed DOMTreeExplorer.tsx syntax');
