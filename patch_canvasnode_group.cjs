const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/studio/components/CanvasNode.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Ensure group nodes render properly and allow grouping functionality
// The prompt requires marque selection (shift+drag) and "Group" button.
// Let's check InfiniteCanvas.tsx for Shift+Drag marquee logic.
