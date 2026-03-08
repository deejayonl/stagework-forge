const fs = require('fs');
const content = fs.readFileSync('src/routes/studio/components/InfiniteCanvas.tsx', 'utf8');

const oldCode = `        if (e.ctrlKey || e.metaKey) {
            const { x, y, scale } = transform.current;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const zoomIntensity = 0.002;
            const delta = -e.deltaY;
            const factor = Math.exp(delta * zoomIntensity);
            const newScale = Math.min(Math.max(scale * factor, 0.1), 8);
            const newX = mouseX - (mouseX - x) * (newScale / scale);
            const newY = mouseY - (mouseY - y) * (newScale / scale);

            transform.current = { x: newX, y: newY, scale: newScale };
        } else {
            transform.current.x -= e.deltaX;
            transform.current.y -= e.deltaY;
        }
        applyTransform();`;

const newCode = `        if (e.ctrlKey || e.metaKey) {
            const { x, y, scale } = transform.current;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const zoomIntensity = 0.002;
            const delta = -e.deltaY;
            const factor = Math.exp(delta * zoomIntensity);
            const newScale = Math.min(Math.max(scale * factor, 0.1), 8);
            const newX = mouseX - (mouseX - x) * (newScale / scale);
            const newY = mouseY - (mouseY - y) * (newScale / scale);

            transform.current = { x: newX, y: newY, scale: newScale };
        } else {
            // Smoother panning logic for Infinite Canvas
            const panSensitivity = 1.25;
            transform.current.x -= (e.deltaX * panSensitivity);
            transform.current.y -= (e.deltaY * panSensitivity);
        }
        
        // Request animation frame for smoother transform application
        requestAnimationFrame(() => {
            applyTransform();
        });`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/studio/components/InfiniteCanvas.tsx', newFile);
