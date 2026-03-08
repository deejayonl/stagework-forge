import React, { useState, useRef, useEffect } from 'react';
import { CanvasNode } from '../types';
import { streamFromBFF } from '../../../shared/api/api-client';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ContextualTuningChatProps {
    node: CanvasNode | null;
    onUpdate: (id: string, data: Partial<CanvasNode>) => void;
    onClose: () => void;
}

const ContextualTuningChat: React.FC<ContextualTuningChatProps> = ({ node, onUpdate, onClose }) => {
    const [input, setInput] = useState('');
    const [isTuning, setIsTuning] = useState(false);
    const [history, setHistory] = useState<{ role: 'user' | 'agent'; content: string }[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isTuning]);

    if (!node) return null;

    const handleSend = async () => {
        if (!input.trim() || isTuning) return;

        const userMsg = input.trim();
        setInput('');
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTuning(true);

        try {
            const blueprintContext = {
                title: node.title,
                content: node.content
            };

            let agentResponse = "";
            setHistory(prev => [...prev, { role: 'agent', content: "" }]);

            await streamFromBFF('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: userMsg, blueprintContext })
            }, (chunk) => {
                agentResponse += chunk;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].content = agentResponse;
                    return newHistory;
                });
            });

            // Update node content automatically if the agent provides an updated wireframe
            // This is a simplified heuristic. Ideally, the agent would return JSON with the updated wireframe.
            if (agentResponse.includes('## Wireframe') || agentResponse.includes('## Features')) {
                // If it looks like a full replacement, we update the node.
                // For now, let's just append the tuning result to the node content if the user wants to keep it.
                // Or let the user manually apply it. We'll just append it for demonstration.
                onUpdate(node.id, { content: node.content + "\n\n### Tuned Updates\n" + agentResponse });
            }

        } catch (error: any) {
            console.error("Tuning error:", error);
            setHistory(prev => {
                const newHistory = [...prev];
                // If the last message was the empty agent message we just added, replace its content
                if (newHistory[newHistory.length - 1].role === 'agent' && newHistory[newHistory.length - 1].content === "") {
                    newHistory[newHistory.length - 1].content = `Error: ${error.message || 'Failed to connect to BFF'}`;
                } else {
                    newHistory.push({ role: 'agent', content: `Error: ${error.message || 'Failed to connect to BFF'}` });
                }
                return newHistory;
            });
        } finally {
            setIsTuning(false);
        }
    };

    return (
        <div className="absolute right-4 top-24 w-96 max-h-[calc(100vh-8rem)] bg-hall-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-hall-700/50 z-[60] flex flex-col animate-fade-in">
            <div className="px-4 py-3 border-b border-hall-800/50 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <h2 className="text-xs font-bold text-hall-100 uppercase tracking-wide">Contextual Tuning</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-hall-800 text-hall-400 transition-colors"
                >
                    <span className="text-sm">&times;</span>
                </button>
            </div>

            <div className="p-4 flex flex-col gap-2 border-b border-hall-800/50 bg-hall-950/30">
                <span className="text-[10px] text-hall-500 uppercase tracking-wider font-bold">Tuning Target</span>
                <span className="text-sm font-medium text-hall-200 truncate">{node.title}</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[200px] max-h-[400px]">
                {history.length === 0 && (
                    <div className="text-center text-hall-500 text-sm py-8">
                        Ask me to modify or tune this design blueprint.
                    </div>
                )}
                {history.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[90%] ${
                            msg.role === 'user' 
                                ? 'bg-indigo-500 text-white rounded-br-sm' 
                                : 'bg-hall-800 text-hall-200 rounded-bl-sm border border-hall-700/50'
                        }`}>
                            {msg.role === 'agent' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <MarkdownRenderer content={msg.content} />
                                </div>
                            ) : (
                                <span className="text-sm">{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-hall-800/50 bg-hall-900 rounded-b-2xl flex items-center gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="E.g., Make the sidebar collapsible..."
                    className="flex-1 bg-hall-950 border border-hall-800 rounded-xl px-4 py-2.5 text-sm text-hall-100 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    disabled={isTuning}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTuning}
                    className="w-10 h-10 flex shrink-0 items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:bg-hall-800 text-white transition-colors"
                >
                    {isTuning ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </div>
        </div>
    );
};

export default ContextualTuningChat;
