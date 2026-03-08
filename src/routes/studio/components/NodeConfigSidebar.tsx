import React, { useEffect, useState } from 'react';
import { CanvasNode, NodeType } from '../types';

interface NodeConfigSidebarProps {
    node: CanvasNode | null;
    onUpdate: (id: string, data: Partial<CanvasNode>) => void;
    onClose: () => void;
}

const NodeConfigSidebar: React.FC<NodeConfigSidebarProps> = ({ node, onUpdate, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [nodeType, setNodeType] = useState<NodeType>('text');

    useEffect(() => {
        if (node) {
            setTitle(node.title || '');
            setContent(node.content || '');
            setNodeType(node.type || 'text');
        }
    }, [node]);

    if (!node) return null;

    const handleSave = () => {
        onUpdate(node.id, { title, content, type: nodeType });
    };

    return (
        <div className="absolute right-4 top-24 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto glass-panel rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-[60] flex flex-col animate-slide-in-right">
            <div className="px-4 py-3 border-b border-border-subtle bg-bg-surface/30 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wide">Node Config</h2>
                <button 
                    onClick={onClose}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary transition-colors"
                >
                    <i className="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                        placeholder="Node Title"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Type</label>
                    <select 
                        value={nodeType} 
                        onChange={e => setNodeType(e.target.value as NodeType)}
                        className="w-full bg-bg-main border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors appearance-none"
                    >
                        <option value="sticky">Sticky Note</option>
                        <option value="text">Text</option>
                        <option value="code">Code</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="terminal">Terminal</option>
                        <option value="website">Website</option>
                        <option value="api">API Request</option>
                        <option value="condition">Condition</option>
                        <option value="loop">Loop</option>
                        <option value="delay">Delay</option>
                        <option value="merge">Merge</option>
                        <option value="log">Log</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Content / Prompt</label>
                    <textarea 
                        value={content} 
                        onChange={e => setContent(e.target.value)}
                        className="w-full bg-bg-main border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors min-h-[120px] resize-y custom-scrollbar"
                        placeholder="Node content or prompt..."
                    />
                </div>

                {/* Additional type-specific settings could go here */}

                <button 
                    onClick={handleSave}
                    className="mt-2 w-full py-2.5 bg-accent-primary text-white text-sm font-medium rounded-xl hover:bg-accent-primary/90 transition-colors shadow-sm"
                >
                    Apply Changes
                </button>
            </div>
        </div>
    );
};

export default NodeConfigSidebar;
