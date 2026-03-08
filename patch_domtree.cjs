const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/DOMTreeExplorer.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('onMoveNode')) {
  // Add onMoveNode to props
  content = content.replace(
    /onClose: \(\) => void;\n}/,
    `onClose: () => void;\n  onMoveNode?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;\n}`
  );

  // Add onMoveNode to TreeNode props
  content = content.replace(
    /onSelectNode: \(id: string\) => void;\n}> = \({ node, depth, selectedNodeId, onSelectNode }\) => {/,
    `onSelectNode: (id: string) => void;\n  onMoveNode?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;\n}> = ({ node, depth, selectedNodeId, onSelectNode, onMoveNode }) => {`
  );

  // Add drag state and handlers to TreeNode
  content = content.replace(
    /const \[isExpanded, setIsExpanded\] = useState\(depth < 2\);/,
    `const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom' | 'center' | null>(null);`
  );

  // Update TreeNode render for drag and drop
  const dragHandlers = `
      draggable={node.id ? true : false}
      onDragStart={(e) => {
        if (!node.id) return;
        e.dataTransfer.setData('text/plain', node.id);
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!node.id) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        if (y < rect.height * 0.25) setDragOverPos('top');
        else if (y > rect.height * 0.75) setDragOverPos('bottom');
        else setDragOverPos('center');
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setDragOverPos(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== node.id && dragOverPos && onMoveNode) {
          onMoveNode(sourceId, node.id, dragOverPos === 'top' ? 'before' : dragOverPos === 'bottom' ? 'after' : 'inside');
        }
        setDragOverPos(null);
      }}
  `;

  content = content.replace(
    /<div \n        className={`flex items-center gap-1 py-1 px-2 cursor-pointer transition-colors \${/,
    `<div 
        ${dragHandlers}
        className={\`flex items-center gap-1 py-1 px-2 cursor-pointer transition-colors \${dragOverPos === 'top' ? 'border-t-2 border-amber-500' : dragOverPos === 'bottom' ? 'border-b-2 border-amber-500' : dragOverPos === 'center' ? 'bg-amber-500/30' : ''} \${`
  );

  // Pass onMoveNode to children
  content = content.replace(
    /onSelectNode={onSelectNode}\n            \/>/g,
    `onSelectNode={onSelectNode}\n              onMoveNode={onMoveNode}\n            />`
  );

  // Add onMoveNode to DOMTreeExplorer component
  content = content.replace(
    /onSelectNode,\n  onClose\n}\) => {/,
    `onSelectNode,\n  onMoveNode,\n  onClose\n}) => {`
  );

  // Pass onMoveNode from DOMTreeExplorer to TreeNode
  content = content.replace(
    /onSelectNode={onSelectNode} \n          \/>/,
    `onSelectNode={onSelectNode} \n            onMoveNode={onMoveNode}\n          />`
  );

  fs.writeFileSync(file, content);
  console.log('Patched DOMTreeExplorer.tsx');
} else {
  console.log('Already patched');
}
