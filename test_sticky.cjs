const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(path, 'utf8');

// The main return for CanvasNode starts around line 1100. Let's find it.
const lines = content.split('\n');
const returnIndex = lines.findIndex(l => l.includes('return (') && lines.slice(lines.indexOf(l)-5, lines.indexOf(l)).some(x => x.includes('renderContent()')));

console.log(returnIndex);
