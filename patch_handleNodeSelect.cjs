const fs = require('fs');
const file = './src/routes/canvas/CanvasView.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `const handleNodeSelect = (id: string) => {
      setActiveNodeId(id);
      setNodes(prev => {
          const maxZ = Math.max(...prev.map(n => n.zIndex));
          return prev.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n);
      });
  };`;

const newFunc = `const handleNodeSelect = (id: string, multi: boolean = false) => {
      if (multi) {
          setSelectedNodeIds(prev => {
              const next = new Set(prev);
              if (next.has(id)) {
                  next.delete(id);
              } else {
                  next.add(id);
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
  };`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(file, content);
