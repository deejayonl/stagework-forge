const fs = require('fs');
const file = './src/routes/canvas/CanvasView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const handleNodeSelect = \(id: string\) => {([\s\S]*?)};/,
  `const handleNodeSelect = (id: string, multi: boolean = false) => {
      if (multi) {
          setSelectedNodeIds(prev => {
              const next = new Set(prev);
              if (next.has(id)) {
                  next.delete(id);
                  if (activeNodeId === id) {
                      setActiveNodeId(next.size > 0 ? Array.from(next)[0] : null);
                  }
              } else {
                  next.add(id);
                  setActiveNodeId(id);
              }
              return next;
          });
      } else {
          setActiveNodeId(id);
          setSelectedNodeIds(new Set([id]));
      }

      setNodes(prev => {
          const maxZ = Math.max(...prev.map(n => n.zIndex));
          return prev.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n);
      });
  };`
);

fs.writeFileSync(file, content);
