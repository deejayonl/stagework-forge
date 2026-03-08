const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace `zoom` with `scale`
content = content.replace(/zoom/g, 'scale');

fs.writeFileSync(path, content);
