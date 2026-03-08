const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/studio/components/InfiniteCanvas.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Add dragging state
code = code.replace(
  'const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);',
  'const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);\n    const [isDraggingOver, setIsDraggingOver] = useState(false);'
);

// Update handleDrop to reset state
code = code.replace(
  'const handleDrop = (e: React.DragEvent) => {',
  'const handleDrop = (e: React.DragEvent) => {\n        setIsDraggingOver(false);'
);

// Add Drag handlers
const dragHandlers = `
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}
`;

code = code.replace(
  /onDrop=\{handleDrop\}\s*onDragOver=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); \}\}/,
  dragHandlers
);

// Add visual overlay
const overlayCode = `
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileInputChange} multiple />

            {/* Drag & Drop Overlay */}
            <div className={\`absolute inset-0 z-50 pointer-events-none bg-indigo-500/10 backdrop-blur-[2px] border-4 border-dashed border-indigo-500/50 flex flex-col items-center justify-center transition-opacity duration-300 \${isDraggingOver ? 'opacity-100' : 'opacity-0'}\`}>
                <div className="bg-hall-950/80 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-400 animate-bounce"></i>
                    <span className="text-xl font-bold text-white tracking-widest uppercase">Drop Assets Here</span>
                    <span className="text-sm text-hall-400">Images, Code Snippets, JSON</span>
                </div>
            </div>
`;

code = code.replace(
  '<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileInputChange} multiple />',
  overlayCode
);

fs.writeFileSync(filePath, code);
console.log("Patched InfiniteCanvas.tsx for Drag & Drop");
