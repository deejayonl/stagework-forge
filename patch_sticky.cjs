const fs = require('fs');
const path = '/home/agent/workspace/projects/stagework-forge/src/routes/canvas/components/CanvasNode.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("case 'log': return { inputs: ['data'], outputs: ['out'] };", "case 'log': return { inputs: ['data'], outputs: ['out'] };\n        case 'sticky': return { inputs: [], outputs: [] };");

const stickyRender = `
            case 'sticky':
                return (
                    <div className="w-full h-full bg-yellow-200/90 dark:bg-yellow-600/30 backdrop-blur-md rounded-lg p-4 shadow-lg border border-yellow-300/50 dark:border-yellow-500/30 flex flex-col group relative">
                        {/* Custom Header for Sticky */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                            <button onClick={(e) => { e.stopPropagation(); onDuplicate(node.id); }} className="w-6 h-6 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-yellow-800 dark:text-yellow-200" title="Duplicate"><i className="fa-solid fa-copy text-[10px]"></i></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="w-6 h-6 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-red-500/80 text-yellow-800 dark:text-yellow-200 hover:text-white" title="Delete"><i className="fa-solid fa-trash text-[10px]"></i></button>
                        </div>
                        
                        <textarea
                            value={node.content || ''}
                            onChange={(e) => onUpdate(node.id, { content: e.target.value })}
                            className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-yellow-900 dark:text-yellow-100 placeholder-yellow-800/50 dark:placeholder-yellow-200/50 font-medium text-sm custom-scrollbar"
                            placeholder="Type a note..."
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    </div>
                );
`;

content = content.replace("            case 'log':", stickyRender + "\n            case 'log':");

fs.writeFileSync(path, content);
