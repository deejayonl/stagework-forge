const fs = require('fs');
const content = fs.readFileSync('src/routes/studio/components/CanvasNode.tsx', 'utf8');

const oldCode = `        if (snapToGrid) {
            const gridSize = 32;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        const visualDx = newX - node.x; 
        const visualDy = newY - node.y;`;

const newCode = `        if (snapToGrid) {
            const gridSize = 32;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        // Apply boundaries to prevent nodes from getting lost in negative infinity
        // We set a reasonable boundary of -50000 to 50000 for the infinite canvas
        const MIN_BOUND = -50000;
        const MAX_BOUND = 50000;
        newX = Math.max(MIN_BOUND, Math.min(newX, MAX_BOUND));
        newY = Math.max(MIN_BOUND, Math.min(newY, MAX_BOUND));

        const visualDx = newX - node.x; 
        const visualDy = newY - node.y;`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/studio/components/CanvasNode.tsx', newFile);
