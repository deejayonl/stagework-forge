const fs = require('fs');
const file = './src/routes/canvas/CanvasView.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `const handleNodeMove = (id: string, x: number, y: number) => {
      const newNodes = nodes.map(n => n.id === id ? { ...n, x, y } : n);
      setNodes(newNodes);
      addToHistory(newNodes, edges);
  };`;

const newFunc = `const handleNodeMove = (id: string, x: number, y: number, deltaX: number, deltaY: number) => {
      setNodes(prev => {
          let newNodes = prev;
          if (selectedNodeIds.has(id) && selectedNodeIds.size > 1) {
              // Move all selected nodes by the delta
              newNodes = prev.map(n => {
                  if (selectedNodeIds.has(n.id)) {
                      return { ...n, x: n.x + deltaX, y: n.y + deltaY };
                  }
                  return n;
              });
          } else {
              // Move just the single node
              newNodes = prev.map(n => n.id === id ? { ...n, x, y } : n);
          }
          addToHistory(newNodes, edges);
          return newNodes;
      });
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content);
