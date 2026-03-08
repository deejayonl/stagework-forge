const fs = require('fs');
const file = './src/routes/canvas/components/InfiniteCanvas.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onNodeMove: \(id: string, x: number, y: number\) => void;/,
  'onNodeMove: (id: string, x: number, y: number, deltaX: number, deltaY: number) => void;'
);

content = content.replace(
  /onMove={onNodeMove}/,
  'onMove={(id, x, y, dx, dy) => onNodeMove(id, x, y, dx, dy)}'
);

fs.writeFileSync(file, content);
