const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(path, 'utf8');

const stickyOverride = `
    if (node.type === 'sticky') {
        return (
            <div
                ref={nodeRef}
                className={\`
                    absolute flex flex-col pointer-events-auto
                    rounded-lg shadow-lg group/node transition-shadow duration-300 ease-out
                    \${isSelected ? 'ring-2 ring-yellow-500 z-30' : 'z-10'}
                \`}
                style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    backgroundColor: isDarkMode ? 'rgba(161, 98, 7, 0.3)' : 'rgba(254, 240, 138, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: isDarkMode ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(253, 224, 71, 0.5)'
                }}
                onMouseDown={handleDragStart}
            >
                <div className="absolute top-2 right-2 opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center gap-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(node.id); }} className="w-6 h-6 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-yellow-800 dark:text-yellow-200" title="Duplicate"><i className="fa-solid fa-copy text-[10px]"></i></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="w-6 h-6 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-red-500/80 text-yellow-800 dark:text-yellow-200 hover:text-white" title="Delete"><i className="fa-solid fa-trash text-[10px]"></i></button>
                </div>
                
                <textarea
                    value={node.content || ''}
                    onChange={(e) => onUpdate(node.id, { content: e.target.value })}
                    className="w-full h-full p-4 bg-transparent border-none resize-none focus:outline-none text-yellow-900 dark:text-yellow-100 placeholder-yellow-800/50 dark:placeholder-yellow-200/50 font-medium text-sm custom-scrollbar"
                    placeholder="Type a note..."
                    onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
                    onPointerDown={(e) => e.stopPropagation()}
                />
                
                <div 
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 hover:opacity-100 group-hover/node:opacity-100 z-50 flex items-end justify-end p-1.5"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startW = node.width;
                        const startH = node.height;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                            const newW = Math.max(150, startW + (moveEvent.clientX - startX) / zoom);
                            const newH = Math.max(100, startH + (moveEvent.clientY - startY) / zoom);
                            onUpdate(node.id, { width: newW, height: newH });
                        };
                        
                        const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-700/50 dark:text-yellow-300/50">
                        <path d="M9 1V9H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        );
    }

    return (
`;

content = content.replace('    return (', stickyOverride);
fs.writeFileSync(path, content);
