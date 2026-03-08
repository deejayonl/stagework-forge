const fs = require('fs');
const content = fs.readFileSync('src/routes/studio/components/InfiniteCanvas.tsx', 'utf8');

const oldCode = `        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            transform.current.x += dx;
            transform.current.y += dy;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            applyTransform();
            return;
        }`;

const newCode = `        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            transform.current.x += dx;
            transform.current.y += dy;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            
            // Use requestAnimationFrame for smoother panning via mouse drag
            requestAnimationFrame(() => {
                applyTransform();
            });
            return;
        }`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/studio/components/InfiniteCanvas.tsx', newFile);
