const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('renderContent()')) {
        console.log(i + ' ' + lines[i]);
    }
}
