const fs = require('fs');
const file = './src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onMove: \(id: string, x: number, y: number\) => void;/,
  'onMove: (id: string, x: number, y: number, deltaX: number, deltaY: number) => void;'
);

content = content.replace(
  /onMove\(node\.id, finalX, finalY\);/,
  'onMove(node.id, finalX, finalY, finalX - dragData.current.originalX, finalY - dragData.current.originalY);'
);

fs.writeFileSync(file, content);
