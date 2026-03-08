const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/InfiniteCanvas.tsx';
let content = fs.readFileSync(path, 'utf8');

const stickyButton = `                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('sticky', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-note-sticky text-xs w-4"></i> Sticky Note</button>`;

content = content.replace("                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('text', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className=\"w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3\"><i className=\"fa-solid fa-font text-xs w-4\"></i> Text Note</button>", stickyButton + "\n                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('text', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className=\"w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3\"><i className=\"fa-solid fa-font text-xs w-4\"></i> Text Note</button>");

fs.writeFileSync(path, content);
