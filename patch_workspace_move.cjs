const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Workspace.tsx');
let content = fs.readFileSync(file, 'utf8');

const helperCode = `
  const findNodePath = (node: any, id: string): number[] | null => {
    if (node.id === id) return node.path;
    if (node.children) {
      for (const child of node.children) {
        const p = findNodePath(child, id);
        if (p) return p;
      }
    }
    return null;
  };

  const handleMoveNode = (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    if (!domTree) return;
    const sourcePath = findNodePath(domTree, sourceId);
    const targetPath = findNodePath(domTree, targetId);
    
    if (!sourcePath || !targetPath) return;

    updateLocalHtml([], (body) => {
      let sourceEl: HTMLElement | null = body;
      for (const idx of sourcePath) {
        if (!sourceEl || !sourceEl.children[idx]) { sourceEl = null; break; }
        sourceEl = sourceEl.children[idx] as HTMLElement;
      }
      
      let targetEl: HTMLElement | null = body;
      for (const idx of targetPath) {
        if (!targetEl || !targetEl.children[idx]) { targetEl = null; break; }
        targetEl = targetEl.children[idx] as HTMLElement;
      }

      if (sourceEl && targetEl && sourceEl !== targetEl) {
        if (position === 'inside') {
          targetEl.appendChild(sourceEl);
        } else if (position === 'before') {
          targetEl.parentNode?.insertBefore(sourceEl, targetEl);
        } else if (position === 'after') {
          targetEl.parentNode?.insertBefore(sourceEl, targetEl.nextSibling);
        }
      }
    }, false, 'Move Element in DOM Tree');
  };
`;

if (!content.includes('handleMoveNode = (sourceId: string')) {
  content = content.replace(
    /const handleDeleteElement = \(\) => {/,
    helperCode + '\n  const handleDeleteElement = () => {'
  );
  
  // Also pass onMoveNode to DOMTreeExplorer
  content = content.replace(
    /<DOMTreeExplorer \n                tree=\{domTree\} \n                selectedNodeId=\{selectedElement\?.id \|\| null\} \n                onSelectNode=\{handleSelectNode\} \n                onClose=\{/,
    `<DOMTreeExplorer \n                tree={domTree} \n                selectedNodeId={selectedElement?.id || null} \n                onSelectNode={handleSelectNode} \n                onMoveNode={handleMoveNode}\n                onClose={`
  );

  fs.writeFileSync(file, content);
  console.log('Patched Workspace.tsx for handleMoveNode');
} else {
  console.log('Already patched');
}
