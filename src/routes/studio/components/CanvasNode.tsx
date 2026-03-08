
import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { CanvasNode as CanvasNodeType, CanvasFile, HandleSide } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

// Type definition for Prism global
declare global {
  interface Window {
    Prism: any;
  }
}

interface CanvasNodeProps {
    node: CanvasNodeType;
    isSelected: boolean;
    scale: number;
    onMove: (id: string, x: number, y: number, deltaX: number, deltaY: number) => void;
    onSelect: (id: string, multi: boolean) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<CanvasNodeType>) => void;
    onConnectStart: (id: string, side: HandleSide) => void;
    onConnectEnd: (id: string, side: HandleSide) => void;
    snapToGrid: boolean;
    isConnecting: boolean;
    onContextMenu: (id: string, e: React.MouseEvent) => void;
    selectedNodeIds?: Set<string>;
}

const Handle = ({ side, id, style, label, onMouseDown, onMouseUp, isConnecting }: { side: HandleSide, id?: string, style?: React.CSSProperties, label?: string, onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void, onMouseUp: (e: React.MouseEvent | React.TouchEvent) => void, isConnecting: boolean }) => {
    // Formatting for default 4 sides, fallback for dynamic ports
    const isStandard = ['top', 'bottom', 'left', 'right'].includes(side);
    
    const positionClasses: Record<string, string> = {
        top: "-top-3 left-1/2 -translate-x-1/2 w-8 h-6 cursor-crosshair",
        bottom: "-bottom-3 left-1/2 -translate-x-1/2 w-8 h-6 cursor-crosshair",
        left: "-left-3 top-1/2 -translate-y-1/2 h-8 w-6 cursor-crosshair",
        right: "-right-3 top-1/2 -translate-y-1/2 h-8 w-6 cursor-crosshair"
    };

    const dotClasses: Record<string, string> = {
        top: "top-1 left-1/2 -translate-x-1/2",
        bottom: "bottom-1 left-1/2 -translate-x-1/2",
        left: "left-1 top-1/2 -translate-y-1/2",
        right: "right-1 top-1/2 -translate-y-1/2"
    };

    // For dynamic ports, we position them manually via `style` and override classes
    const containerClass = isStandard ? positionClasses[side] : "absolute z-[100] flex items-center justify-center group/handle w-6 h-6 cursor-crosshair -translate-y-1/2";
    const dotClass = isStandard ? dotClasses[side] : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

    return (

        <div 
            id={id}
            className={`absolute z-[100] flex items-center justify-center group/handle ${containerClass}`}
            style={style}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchStart={onMouseDown}
            onTouchEnd={onMouseUp}
            title={label}
        >
             {/* Visual Dot */}
            <div className={`
                absolute w-3 h-3 bg-bg-surface border-2 border-text-secondary rounded-full 
                transition-all duration-200 shadow-sm pointer-events-none
                ${isConnecting ? 'opacity-80 scale-100 bg-accent-primary border-accent-primary' : 'opacity-0 group-hover/node:opacity-100 group-hover/handle:scale-125 group-hover/handle:bg-accent-primary group-hover/handle:border-accent-primary'}
                ${dotClass}
            `}></div>
            
            {/* Label for Dynamic Ports */}
            {!isStandard && label && (
                <span className={`absolute text-[9px] font-bold text-text-secondary opacity-0 group-hover/handle:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${side.startsWith('in-') ? 'left-full ml-1' : 'right-full mr-1'}`}>
                    {label}
                </span>
            )}
        </div>
    );
};

const getPortsForType = (type: string) => {
    switch (type) {
        case 'api': return { inputs: ['trigger', 'url', 'body'], outputs: ['response', 'error', 'status'] };
        case 'condition': return { inputs: ['input'], outputs: ['true', 'false'] };
        case 'loop': return { inputs: ['array'], outputs: ['item', 'index', 'done'] };
        case 'delay': return { inputs: ['in', 'ms'], outputs: ['out'] };
        case 'merge': return { inputs: ['in1', 'in2'], outputs: ['out'] };
        case 'log': return { inputs: ['data'], outputs: ['out'] };
        case 'sticky': return { inputs: [], outputs: [] };
        case 'code': return { inputs: ['trigger', 'args'], outputs: ['result', 'error'] };
        case 'text': return { inputs: ['data'], outputs: ['text'] };
        case 'terminal': return { inputs: ['command'], outputs: ['stdout', 'stderr'] };
        case 'website': return { inputs: ['url'], outputs: ['event'] };
        case 'image': return { inputs: ['prompt'], outputs: ['image'] };
        case 'video': return { inputs: ['prompt'], outputs: ['video'] };
        default: return { inputs: ['in'], outputs: ['out'] };
    }
};

const CanvasNode: React.FC<CanvasNodeProps> = memo(({ node, isSelected, scale, onMove, onSelect, onDelete, onUpdate, onConnectStart, onConnectEnd, snapToGrid, isConnecting, onContextMenu }) => {
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
    const [isEditing, setIsEditing] = useState(false);
    const [localContent, setLocalContent] = useState(node.content);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    
    // Rename State
    const [isRenaming, setIsRenaming] = useState(false);
    const [tempTitle, setTempTitle] = useState(node.title);

    // Derived files state to handle legacy nodes (single file) vs new nodes (multi-file)
    const derivedFiles: Record<string, CanvasFile> = useMemo(() => {
        if (node.files && Object.keys(node.files).length > 0) return node.files;
        // Fallback for legacy nodes: construct a file object from main content
        const name = node.title && node.title.includes('.') ? node.title : 'script.js';
        return {
            [name]: {
                name: name,
                content: node.content,
                language: node.language || 'javascript'
            }
        };
    }, [node.files, node.title, node.content, node.language]);

    // Initialize active tab
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (node.activeFile && derivedFiles[node.activeFile]) return node.activeFile;
        return Object.keys(derivedFiles)[0];
    });

    // Refs for drag logic optimization (bypass React render cycle)
    const nodeRef = useRef<HTMLDivElement>(null);
    const dragData = useRef<{ startX: number, startY: number, initialNodeX: number, initialNodeY: number } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Preview debounce ref
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isCode = node.type === 'code';
    // Check if we can preview: must be HTML file or supported language
    const isPreviewable = isCode && (Object.keys(derivedFiles).some(f => f.endsWith('.html')) || ['html', 'svg', 'xml'].includes(node.language?.toLowerCase() || ''));

    // Sync local active tab if changed externally
    useEffect(() => {
        if (node.activeFile && node.activeFile !== activeTab && derivedFiles[node.activeFile]) {
            setActiveTab(node.activeFile);
        }
    }, [node.activeFile, derivedFiles]);

    // Ensure activeTab is valid if files change
    useEffect(() => {
        if (!derivedFiles[activeTab]) {
            setActiveTab(Object.keys(derivedFiles)[0]);
        }
    }, [derivedFiles]);

    // Update local content when not editing text node
    useEffect(() => {
        if (!isEditing && !isCode) {
            setLocalContent(node.content);
        }
    }, [node.content, isEditing, isCode]);

    // Syntax Highlighting Hook
    const [highlightedCode, setHighlightedCode] = useState('');
    useEffect(() => {
        if (isCode && window.Prism) {
            const currentContent = derivedFiles[activeTab]?.content || "";
            const lang = derivedFiles[activeTab]?.language || 'javascript';
            // Simple mapping for Prism languages
            const prismLang = window.Prism.languages[lang] ? lang : 'javascript';
            const html = window.Prism.highlight(currentContent, window.Prism.languages[prismLang], prismLang);
            setHighlightedCode(html);
        }
    }, [derivedFiles, activeTab, isCode, node.content]);

    // --- Helper to stop scroll propagation ---
    const stopScrollPropagation = (e: React.WheelEvent) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };

    // --- Actions ---
    const handleActionCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        let textToCopy = node.content;
        if (node.type === 'code') {
             textToCopy = derivedFiles[activeTab]?.content || node.content;
        }
        navigator.clipboard.writeText(textToCopy);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    };

    const handleActionDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const a = document.createElement('a');
        
        let filename = node.title || 'download';
        let href = node.content;

        if (node.type === 'code') {
            filename = activeTab;
            const blob = new Blob([derivedFiles[activeTab]?.content || node.content], { type: 'text/plain' });
            href = URL.createObjectURL(blob);
        } else if (node.type === 'image') {
            if (!filename.toLowerCase().endsWith('.png')) filename += '.png';
        } else if (node.type === 'video') {
             if (!filename.toLowerCase().endsWith('.mp4')) filename += '.mp4';
        }

        a.href = href;
        a.download = filename;
        a.click();
        
        if (node.type === 'code') {
            URL.revokeObjectURL(href);
        }
    };

    // --- High Performance Drag Logic ---
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        // Prevent drag if clicking input or rename area when renaming
        if (isRenaming) return;
        
        e.stopPropagation();
        const isShift = 'shiftKey' in e && (e as React.MouseEvent).shiftKey;
        onSelect(node.id, isShift);
        
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        dragData.current = {
            startX: clientX,
            startY: clientY,
            initialNodeX: node.x,
            initialNodeY: node.y
        };

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);

        if (nodeRef.current) {
            nodeRef.current.style.cursor = 'grabbing';
            nodeRef.current.style.zIndex = '100'; 
            nodeRef.current.style.willChange = 'transform';
        }
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!dragData.current || !nodeRef.current) return;
        e.preventDefault(); 

        const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

        const deltaX = (clientX - dragData.current.startX) / scale;
        const deltaY = (clientY - dragData.current.startY) / scale;

        let newX = dragData.current.initialNodeX + deltaX;
        let newY = dragData.current.initialNodeY + deltaY;

        if (snapToGrid) {
            const gridSize = 32;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        const visualDx = newX - node.x; 
        const visualDy = newY - node.y;

        nodeRef.current.style.transform = `translate3d(${visualDx}px, ${visualDy}px, 0)`;

        if (isSelected) {
            window.dispatchEvent(new CustomEvent('canvas-node-drag', { 
                detail: { id: node.id, dx: visualDx, dy: visualDy } 
            }));
        }
    };

    const handleDragEnd = (e: MouseEvent | TouchEvent) => {
        if (!dragData.current || !nodeRef.current) return;

        const clientX = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY;

        const deltaX = (clientX - dragData.current.startX) / scale;
        const deltaY = (clientY - dragData.current.startY) / scale;

        let newX = dragData.current.initialNodeX + deltaX;
        let newY = dragData.current.initialNodeY + deltaY;

        if (snapToGrid) {
            const gridSize = 32;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        const visualDx = newX - node.x; 
        const visualDy = newY - node.y;

        onMove(node.id, newX, newY, visualDx, visualDy);

        if (isSelected) {
            window.dispatchEvent(new CustomEvent('canvas-node-drag-end', { detail: { id: node.id } }));
        }

        nodeRef.current.style.cursor = 'default';
        nodeRef.current.style.zIndex = '';
        nodeRef.current.style.transform = ''; 
        nodeRef.current.style.willChange = 'auto'; 
        
        dragData.current = null;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
    };

    const handleResizeTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;
        const startW = node.width;
        const startH = node.height;

        let finalW = startW;
        let finalH = startH;

        const handleTouchMove = (ev: TouchEvent) => {
             const t = ev.touches[0];
             const dx = (t.clientX - startX) / scale;
             const dy = (t.clientY - startY) / scale;
             
             finalW = Math.max(200, startW + dx);

             if (node.type === 'image' || node.type === 'video') {
                 const ratio = startW / startH;
                 finalH = finalW / ratio;
             } else {
                 finalH = Math.max(100, startH + dy);
             }
             
             if (nodeRef.current) {
                 nodeRef.current.style.width = `${finalW}px`;
                 nodeRef.current.style.height = `${finalH}px`;
             }
        };

        const handleTouchEnd = () => {
             window.removeEventListener('touchmove', handleTouchMove);
             window.removeEventListener('touchend', handleTouchEnd);
             onUpdate(node.id, { width: finalW, height: finalH });
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
    };

    // --- File Operations ---
    const handleAddFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        const name = prompt("Enter file name (e.g. style.css):");
        if (!name) return;
        
        if (derivedFiles[name]) {
            alert("File already exists");
            return;
        }

        const newFiles = {
            ...derivedFiles,
            [name]: { name, content: '', language: name.split('.').pop() || 'txt' }
        };

        onUpdate(node.id, { files: newFiles, activeFile: name });
        setActiveTab(name);
    };

    const handleRenameFile = (oldName: string) => {
        const newName = prompt("Rename file:", oldName);
        if (!newName || newName === oldName) return;
        
        if (derivedFiles[newName]) {
            alert("File name already exists");
            return;
        }

        const file = derivedFiles[oldName];
        const newFiles = { ...derivedFiles };
        delete newFiles[oldName];
        newFiles[newName] = { ...file, name: newName, language: newName.split('.').pop() || 'txt' };

        onUpdate(node.id, { files: newFiles, activeFile: newName });
        setActiveTab(newName);
    };

    const handleDeleteFile = (fileName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (Object.keys(derivedFiles).length <= 1) {
            alert("Cannot delete the last file.");
            return;
        }
        if (!confirm(`Delete ${fileName}?`)) return;

        const newFiles = { ...derivedFiles };
        delete newFiles[fileName];
        
        const newActive = activeTab === fileName ? Object.keys(newFiles)[0] : activeTab;
        
        onUpdate(node.id, { files: newFiles, activeFile: newActive });
        setActiveTab(newActive);
    };

    // --- Editor Logic ---
    const handleSave = () => {
        if (isCode) return; 
        setIsEditing(false);
        onUpdate(node.id, { content: localContent });
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        onContextMenu(node.id, e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setLocalContent(node.content); 
        }
    };

    // Code editing handler
    const handleCodeChange = (newCode: string) => {
        // Update specific file content
        const newFiles = {
            ...derivedFiles,
            [activeTab]: { ...derivedFiles[activeTab], content: newCode }
        };
        // Update both files structure (for future) and main content (legacy support)
        onUpdate(node.id, { files: newFiles, content: newCode });
    };

    // Text Editor Helper Functions
    const insertText = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;
        
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = localContent;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        setLocalContent(newText);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 0);
    };

    // Block inserter helper for elements that need newlines
    const insertBlock = (template: string) => {
         if (!textareaRef.current) return;
         const start = textareaRef.current.selectionStart;
         const text = localContent;
         const before = text.substring(0, start);
         const after = text.substring(start);
         
         // Ensure newlines around block
         const needsNewlineBefore = before.length > 0 && !before.endsWith('\n');
         const needsNewlineAfter = after.length > 0 && !after.startsWith('\n');
         
         const newText = before + (needsNewlineBefore ? '\n\n' : '') + template + (needsNewlineAfter ? '\n\n' : '') + after;
         setLocalContent(newText);
         
         setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Position cursor inside valid insertion point if template implies it, otherforge at end
                const offset = (needsNewlineBefore ? 2 : 0) + template.length;
                textareaRef.current.setSelectionRange(start + offset, start + offset);
            }
        }, 0);
    };

    const cleanCode = useCallback((content: string) => {
        let c = content.trim();
        if (c.startsWith('```')) {
            const lines = c.split('\n');
            if (lines.length > 1) {
                lines.shift();
                if (lines[lines.length-1].trim() === '```') lines.pop();
                return lines.join('\n');
            }
        }
        return content;
    }, []);

    const bundlePreview = useCallback(() => {
        const indexFileKey = Object.keys(derivedFiles).find(k => k === 'index.html') || Object.keys(derivedFiles).find(k => k.endsWith('.html')) || Object.keys(derivedFiles)[0];
        let htmlContent = cleanCode(derivedFiles[indexFileKey]?.content || "");

        htmlContent = htmlContent.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/g, (match, href) => {
            const cssFile = derivedFiles[href];
            if (cssFile) {
                return `<style>\n${cleanCode(cssFile.content)}\n</style>`;
            }
            return match;
        });

        htmlContent = htmlContent.replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/g, (match, src) => {
            const jsFile = derivedFiles[src];
            if (jsFile) {
                return `<script>\n${cleanCode(jsFile.content)}\n</script>`;
            }
            return match;
        });

        return htmlContent;
    }, [derivedFiles, cleanCode]);

    // Use effect to manage blob URL and prevent flashing with Debounce
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (!isSelected) return;

        const handleOtherNodeDrag = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.id === node.id) return; // Ignore self
            
            if (nodeRef.current) {
                nodeRef.current.style.transform = `translate3d(${customEvent.detail.dx}px, ${customEvent.detail.dy}px, 0)`;
                nodeRef.current.style.willChange = 'transform';
            }
        };

        const handleOtherNodeDragEnd = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.id === node.id) return; // Ignore self
            
            if (nodeRef.current) {
                nodeRef.current.style.transform = '';
                nodeRef.current.style.willChange = 'auto';
            }
        };

        window.addEventListener('canvas-node-drag', handleOtherNodeDrag);
        window.addEventListener('canvas-node-drag-end', handleOtherNodeDragEnd);

        return () => {
            window.removeEventListener('canvas-node-drag', handleOtherNodeDrag);
            window.removeEventListener('canvas-node-drag-end', handleOtherNodeDragEnd);
        };
    }, [isSelected, node.id]);

    useEffect(() => {
        if (viewMode !== 'preview' || !isPreviewable) return;
        
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            const html = bundlePreview();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        }, 1000); // 1 second delay to stabilize preview during typing/generation

        return () => {
             if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [bundlePreview, viewMode, isPreviewable]);

    // --- Rename Handlers ---
    const handleRenameSubmit = () => {
        setIsRenaming(false);
        if (tempTitle.trim() && tempTitle !== node.title) {
            onUpdate(node.id, { title: tempTitle });
        } else {
            setTempTitle(node.title);
        }
    };

    const handleRenameKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') {
            setIsRenaming(false);
            setTempTitle(node.title);
        }
    };

    // --- Drag and Drop Handlers ---
    const handleNodeDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const newFiles = { ...derivedFiles };
        let lastFileName = activeTab;
        let finalType = node.type;
        let finalContent = node.content;
        let finalTitle = node.title;

        for (const file of files) {
            try {
                if (file.type.startsWith('image/')) {
                    const dataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => resolve(evt.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                    finalType = 'image';
                    finalContent = dataUrl;
                    finalTitle = file.name;
                    break; // Image/video overrides multi-file code tabs
                } else if (file.type.startsWith('video/')) {
                    const dataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => resolve(evt.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                    finalType = 'video';
                    finalContent = dataUrl;
                    finalTitle = file.name;
                    break;
                } else {
                    const text = await file.text();
                    let lang = 'plaintext';
                    if (file.name.endsWith('.js')) lang = 'javascript';
                    else if (file.name.endsWith('.ts')) lang = 'typescript';
                    else if (file.name.endsWith('.jsx')) lang = 'javascript';
                    else if (file.name.endsWith('.tsx')) lang = 'typescript';
                    else if (file.name.endsWith('.html')) lang = 'html';
                    else if (file.name.endsWith('.css')) lang = 'css';
                    else if (file.name.endsWith('.json')) lang = 'json';
                    else if (file.name.endsWith('.md')) lang = 'markdown';
                    else if (file.name.endsWith('.py')) lang = 'python';
                    else if (file.name.endsWith('.go')) lang = 'go';
                    else if (file.name.endsWith('.rs')) lang = 'rust';

                    newFiles[file.name] = {
                        name: file.name,
                        content: text,
                        language: lang
                    };
                    lastFileName = file.name;
                    finalType = 'code';
                }
            } catch (err) {
                console.error("Failed to read dropped file", err);
            }
        }

        if (finalType === 'code') {
            onUpdate(node.id, {
                type: 'code',
                files: newFiles,
                activeFile: lastFileName
            });
            setActiveTab(lastFileName);
        } else {
            onUpdate(node.id, {
                type: finalType,
                content: finalContent,
                title: finalTitle
            });
        }
    };

    const handleNodeDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Render Content based on Type
    const renderContent = () => {
        if (node.type === 'group') {
            return (
                <div className="w-full h-full border-2 border-dashed border-accent-primary/30 bg-accent-primary/5 rounded-b-xl pointer-events-none">
                </div>
            );
        }

        if (node.type === 'code') {
            if (viewMode === 'preview' && isPreviewable) {
                return (
                    <div 
                        className="w-full h-full bg-white relative group/preview"
                        onDoubleClick={() => setViewMode('code')}
                    >
                        {previewUrl && (
                            <iframe 
                                src={previewUrl} 
                                className="w-full h-full border-none pointer-events-auto" 
                                title="Preview"
                                sandbox="allow-scripts allow-modals allow-same-origin" 
                            />
                        )}
                        {!previewUrl && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                            </div>
                        )}
                    </div>
                );
            }

            const currentFileContent = derivedFiles[activeTab]?.content || "";
            const currentLang = derivedFiles[activeTab]?.language || 'javascript';
            
            return (
                <div className="flex-1 flex flex-col bg-[#2d2d2d] overflow-hidden">
                    <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto no-scrollbar items-center" onWheel={stopScrollPropagation}>
                        {Object.values(derivedFiles).map((file: CanvasFile) => (
                            <div 
                                key={file.name}
                                className={`
                                    group/tab flex items-center border-r border-[#333]
                                    ${activeTab === file.name 
                                        ? 'bg-[#1E1E1E] text-[#D4D4D4] border-t-2 border-t-accent-primary' 
                                        : 'text-[#969696] hover:bg-[#2A2D2E] hover:text-[#CCCCCC] border-t-2 border-t-transparent'
                                    }
                                `}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); setActiveTab(file.name); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); handleRenameFile(file.name); }}
                                    className="px-3 py-2 text-xs font-medium flex items-center gap-2 whitespace-nowrap"
                                >
                                    <i className={`fa-brands ${file.name.endsWith('.html') ? 'fa-html5 text-orange-500' : file.name.endsWith('.css') ? 'fa-css3 text-blue-500' : file.name.endsWith('.js') ? 'fa-js text-yellow-500' : 'fa-codepen'} text-[10px]`}></i>
                                    {file.name}
                                </button>
                                
                                {/* Delete Button (only visible on hover or active) */}
                                <button
                                    onClick={(e) => handleDeleteFile(file.name, e)}
                                    className={`w-6 h-full flex items-center justify-center hover:text-red-400 ${activeTab === file.name ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100'} transition-opacity`}
                                >
                                    <i className="fa-solid fa-xmark text-[10px]"></i>
                                </button>
                            </div>
                        ))}
                        
                        {/* Add File Button */}
                        <button 
                            onClick={handleAddFile}
                            className="px-3 py-2 text-[#969696] hover:text-white hover:bg-[#2A2D2E] transition-colors"
                            title="Add File"
                        >
                            <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                    
                    <div 
                        className="h-full overflow-hidden relative" 
                        onMouseDown={(e) => e.stopPropagation()} 
                        onWheel={stopScrollPropagation}
                    >
                         {/* Syntax Highlighting Layer (Bottom) */}
                         <pre 
                            className={`absolute inset-0 p-5 font-mono text-[13px] leading-6 pointer-events-none whitespace-pre-wrap break-all text-[#ccc]`}
                            aria-hidden="true"
                         >
                             <code 
                                className={`language-${currentLang}`} 
                                dangerouslySetInnerHTML={{ __html: highlightedCode || cleanCode(currentFileContent).replace(/</g, '&lt;') }} 
                             />
                         </pre>

                         {/* Editor Layer (Top, Transparent) */}
                         <textarea
                            className="absolute inset-0 w-full h-full p-5 font-mono text-[13px] leading-6 text-transparent bg-transparent caret-white resize-none outline-none border-none custom-scrollbar"
                            value={cleanCode(currentFileContent)}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            spellCheck={false}
                            style={{ color: 'transparent' }} // Ensure text is transparent so pre shows through
                         />
                    </div>
                </div>
            );
        }

        // --- NEW: Loading State for Media Generation ---
        if (node.content.startsWith('loading://')) {
            const isImg = node.content.includes('image');
            return (
                <div className="w-full h-full bg-bg-surface flex items-center justify-center overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-surface to-bg-main"></div>
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-text-primary/5 to-transparent skew-x-12 pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center gap-4 relative z-10 p-6 text-center">
                         <div className="w-16 h-16 rounded-full border-2 border-accent-primary/20 bg-accent-primary/5 flex items-center justify-center animate-pulse">
                             <i className={`fa-solid ${isImg ? 'fa-image' : 'fa-film'} text-accent-primary text-2xl`}></i>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-semibold text-text-primary tracking-wide">Generating...</span>
                            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Creating your {isImg ? 'Visual' : 'Motion'}</span>
                         </div>
                    </div>
                </div>
            );
        }

        switch (node.type) {
            case 'image':
                const isPlaceholderImg = node.content.includes('placehold.co') || !node.content;
                if (isPlaceholderImg) {
                    return (
                        <div className="w-full h-full bg-bg-surface/50 flex flex-col items-center justify-center text-text-secondary gap-3 p-6 border border-dashed border-border-subtle/50 m-1 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <i className="fa-regular fa-image text-xl opacity-50"></i>
                            </div>
                            <span className="text-xs font-medium opacity-60">Waiting for image...</span>
                        </div>
                    );
                }
                return (
                    <div className="w-full h-full bg-bg-surface flex items-center justify-center overflow-hidden">
                        <img src={node.content} alt={node.title} className="w-full h-full object-cover pointer-events-none" />
                    </div>
                );
            case 'video':
                const isPlaceholderVid = !node.content;
                if (isPlaceholderVid) {
                    return (
                        <div className="w-full h-full bg-bg-surface/50 flex flex-col items-center justify-center text-text-secondary gap-3 p-6 border border-dashed border-border-subtle/50 m-1 rounded-2xl">
                             <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <i className="fa-solid fa-film text-xl opacity-50"></i>
                            </div>
                            <span className="text-xs font-medium opacity-60">Waiting for video...</span>
                        </div>
                    );
                }
                return (
                    <div className="w-full h-full bg-black overflow-hidden flex items-center justify-center">
                         <video src={node.content} controls className="w-full h-full object-contain" />
                    </div>
                );
            case 'website':
                const isUrlValid = node.content && (node.content.startsWith('http://') || node.content.startsWith('https://'));
                if (!isUrlValid && !isEditing) {
                    return (
                        <div 
                            className="w-full h-full bg-bg-surface/50 flex flex-col items-center justify-center text-text-secondary gap-3 p-6 border border-dashed border-border-subtle/50 m-1 rounded-2xl cursor-pointer hover:bg-bg-surface/80 transition-colors" 
                            onDoubleClick={() => setIsEditing(true)}
                        >
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <i className="fa-solid fa-globe text-xl opacity-50"></i>
                            </div>
                            <span className="text-xs font-medium opacity-60">Double-click to set URL</span>
                        </div>
                    );
                }
                if (isEditing) {
                     return (
                         <div className="flex flex-col h-full bg-bg-surface p-6 justify-center" onMouseDown={(e) => e.stopPropagation()}>
                             <label className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Website URL</label>
                             <input 
                                 type="url"
                                 autoFocus
                                 className="w-full p-3 font-sans text-sm text-text-primary bg-bg-main border border-border-subtle rounded-2xl outline-none focus:border-accent-primary transition-colors"
                                 value={localContent}
                                 onChange={(e) => setLocalContent(e.target.value)}
                                 onBlur={handleSave}
                                 onKeyDown={handleKeyDown}
                                 placeholder="https://example.com"
                             />
                         </div>
                     );
                }
                return (
                    <div className="w-full h-full bg-white relative group/preview">
                        <div 
                            className="absolute top-2 right-2 z-10 opacity-0 group-hover/preview:opacity-100 transition-opacity bg-black/50 hover:bg-black/80 text-white rounded-xl p-1.5 cursor-pointer backdrop-blur-sm"
                            onClick={() => setIsEditing(true)}
                            title="Edit URL"
                        >
                            <i className="fa-solid fa-pen text-[10px]"></i>
                        </div>
                        <iframe 
                            src={node.content} 
                            className="w-full h-full border-none pointer-events-auto bg-white" 
                            title={node.title}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups" 
                        />
                    </div>
                );
            case 'terminal':
                return (
                    <div 
                        className="flex flex-col h-full bg-[#1e1e1e] font-mono text-[13px] text-green-400 p-4 overflow-auto custom-scrollbar cursor-text"
                        onMouseDown={(e) => e.stopPropagation()}
                        onWheel={stopScrollPropagation}
                    >
                        <div className="flex items-center gap-2 mb-2 opacity-50 select-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <textarea
                            className="flex-1 w-full bg-transparent border-none outline-none resize-none text-green-400 font-mono text-[13px] leading-relaxed"
                            value={localContent}
                            onChange={(e) => {
                                setLocalContent(e.target.value);
                                onUpdate(node.id, { content: e.target.value });
                            }}
                            spellCheck={false}
                        />
                    </div>
                );
            case 'api': {
                let apiData = { method: 'GET', url: '', headers: '{\n  "Accept": "application/json"\n}', body: '' };
                try {
                    if (localContent) apiData = { ...apiData, ...JSON.parse(localContent) };
                } catch (e) {}

                const updateApiData = (key: string, value: string) => {
                    const newData = { ...apiData, [key]: value };
                    const newContent = JSON.stringify(newData);
                    setLocalContent(newContent);
                    onUpdate(node.id, { content: newContent });
                };

                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4 overflow-auto custom-scrollbar" onMouseDown={(e) => e.stopPropagation()} onWheel={stopScrollPropagation}>
                        <div className="flex gap-2 mb-4">
                            <select 
                                className="bg-bg-main border border-border-subtle rounded-xl px-2 py-1 text-xs font-bold text-accent-primary outline-none"
                                value={apiData.method}
                                onChange={(e) => updateApiData('method', e.target.value)}
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                                <option>PATCH</option>
                            </select>
                            <input 
                                type="text" 
                                className="flex-1 bg-bg-main border border-border-subtle rounded-xl px-3 py-1 text-sm text-text-primary outline-none focus:border-accent-primary"
                                placeholder="https://api.example.com/..."
                                value={apiData.url}
                                onChange={(e) => updateApiData('url', e.target.value)}
                            />
                            <button className="bg-accent-primary text-white px-4 py-1 rounded-xl text-xs font-bold hover:bg-accent-primary/80 transition-colors">
                                Send
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Headers (JSON)</label>
                            <textarea 
                                className="h-20 shrink-0 bg-bg-main border border-border-subtle rounded-xl p-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary resize-none custom-scrollbar"
                                value={apiData.headers}
                                onChange={(e) => updateApiData('headers', e.target.value)}
                                spellCheck={false}
                            />
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-2">Body</label>
                            <textarea 
                                className="flex-1 bg-bg-main border border-border-subtle rounded-xl p-2 text-xs font-mono text-text-primary outline-none focus:border-accent-primary resize-none custom-scrollbar"
                                value={apiData.body}
                                onChange={(e) => updateApiData('body', e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    </div>
                );
            }
            case 'loop':
                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Fallback Array (JSON)</div>
                        <div className="flex-1 relative">
                            <textarea 
                                className="w-full h-full bg-bg-main border border-border-subtle rounded-xl p-3 text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none custom-scrollbar"
                                value={localContent}
                                onChange={(e) => {
                                    setLocalContent(e.target.value);
                                    onUpdate(node.id, { content: e.target.value });
                                }}
                                placeholder='e.g. ["apple", "banana", "cherry"]'
                                spellCheck={false}
                            />
                        </div>
                        <div className="mt-3 text-[10px] text-text-secondary opacity-70 flex gap-2 items-start">
                            <i className="fa-solid fa-circle-info mt-0.5"></i>
                            <p>Provide a JSON array to iterate over if the <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">array</span> input is not connected.</p>
                        </div>
                    </div>
                );
            case 'delay':
                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Delay Time (ms)</div>
                        <div className="flex-1 relative">
                            <input 
                                type="number"
                                className="w-full bg-bg-main border border-border-subtle rounded-xl p-3 text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/50"
                                value={localContent}
                                onChange={(e) => {
                                    setLocalContent(e.target.value);
                                    onUpdate(node.id, { content: e.target.value });
                                }}
                                placeholder="e.g. 1000"
                            />
                        </div>
                        <div className="mt-3 text-[10px] text-text-secondary opacity-70 flex gap-2 items-start">
                            <i className="fa-solid fa-circle-info mt-0.5"></i>
                            <p>Pause execution for the specified milliseconds. Passes input data through unchanged.</p>
                        </div>
                    </div>
                );
            case 'merge':
                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4 items-center justify-center text-center" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mb-3">
                            <i className="fa-solid fa-code-merge text-2xl text-accent-primary"></i>
                        </div>
                        <div className="text-sm font-medium text-text-primary mb-1">Merge Node</div>
                        <div className="text-xs text-text-secondary opacity-70 px-4">
                            Waits for all connected inputs to resolve before proceeding.
                        </div>
                    </div>
                );

            case 'sticky':
                return (
                    <div className="w-full h-full bg-yellow-200/90 dark:bg-yellow-600/30 backdrop-blur-md rounded-lg p-4 shadow-lg border border-yellow-300/50 dark:border-yellow-500/30 flex flex-col group relative">
                        {/* Custom Header for Sticky */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
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

            case 'log':
                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Console Log Output</div>
                        <div className="flex-1 relative bg-black/5 dark:bg-black/40 border border-border-subtle rounded-xl p-3 overflow-auto custom-scrollbar font-mono text-xs text-text-primary">
                            {node.executionData ? (
                                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(node.executionData, null, 2)}</pre>
                            ) : (
                                <div className="h-full flex items-center justify-center text-text-secondary opacity-50 italic">Waiting for execution data...</div>
                            )}
                        </div>
                    </div>
                );
            case 'condition':
                return (
                    <div className="flex flex-col h-full bg-bg-surface p-4" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">JavaScript Expression</div>
                        <div className="flex-1 relative">
                            <textarea 
                                className="w-full h-full bg-bg-main border border-border-subtle rounded-xl p-3 text-sm font-mono text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/50 resize-none custom-scrollbar"
                                value={localContent}
                                onChange={(e) => {
                                    setLocalContent(e.target.value);
                                    onUpdate(node.id, { content: e.target.value });
                                }}
                                placeholder="e.g. input.value > 10"
                                spellCheck={false}
                            />
                        </div>
                        <div className="mt-3 text-[10px] text-text-secondary opacity-70 flex gap-2 items-start">
                            <i className="fa-solid fa-circle-info mt-0.5"></i>
                            <p>Expression must evaluate to a boolean. Use <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">input</span> to reference incoming data.</p>
                        </div>
                    </div>
                );
            case 'text':
            default:
                if (isEditing) {
                    return (
                         <div className="flex flex-col h-full bg-bg-surface" onMouseDown={(e) => e.stopPropagation()}>
                            <div 
                                className="flex items-center gap-0.5 p-1.5 border-b border-border-subtle bg-bg-main/30 backdrop-blur-sm shrink-0 overflow-x-auto no-scrollbar"
                                onMouseDown={(e) => e.preventDefault()} 
                            >
                                <button onClick={() => insertText('**', '**')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Bold">
                                    <i className="fa-solid fa-bold text-xs"></i>
                                </button>
                                <button onClick={() => insertText('*', '*')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Italic">
                                    <i className="fa-solid fa-italic text-xs"></i>
                                </button>
                                <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                                <button onClick={() => insertText('# ', '')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-xs font-serif" title="Heading 1">
                                    H1
                                </button>
                                <button onClick={() => insertText('## ', '')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-xs font-serif" title="Heading 2">
                                    H2
                                </button>
                                <button onClick={() => insertText('### ', '')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors font-bold text-xs font-serif" title="Heading 3">
                                    H3
                                </button>
                                <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                                <button onClick={() => insertText('- ', '')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="List">
                                    <i className="fa-solid fa-list-ul text-xs"></i>
                                </button>
                                <button onClick={() => insertText('- [ ] ', '')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Checklist">
                                    <i className="fa-regular fa-square-check text-xs"></i>
                                </button>
                                <button onClick={() => insertBlock('> ')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Quote">
                                    <i className="fa-solid fa-quote-left text-xs"></i>
                                </button>
                                <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                                <button onClick={() => insertText('`', '`')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Inline Code">
                                    <i className="fa-solid fa-code text-xs"></i>
                                </button>
                                <button onClick={() => insertBlock('```\n\n```')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Code Block">
                                    <i className="fa-regular fa-file-code text-xs"></i>
                                </button>
                                <button onClick={() => insertBlock('| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Table">
                                    <i className="fa-solid fa-table text-xs"></i>
                                </button>
                                <button onClick={() => insertText('[Link](', ')')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Link">
                                    <i className="fa-solid fa-link text-xs"></i>
                                </button>
                                <button onClick={() => insertText('![Alt](', ')')} className="w-7 h-7 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Image">
                                    <i className="fa-regular fa-image text-xs"></i>
                                </button>
                            </div>
                            <textarea
                                ref={textareaRef}
                                autoFocus
                                className="w-full flex-1 p-6 font-sans text-base leading-7 text-text-primary bg-bg-surface resize-none outline-none border-none custom-scrollbar"
                                value={localContent}
                                onChange={(e) => setLocalContent(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                onWheel={stopScrollPropagation}
                                placeholder="Type something..."
                            />
                        </div>
                    );
                }
                return (
                    <div 
                        className="p-6 h-full overflow-auto bg-bg-surface cursor-text"
                        onDoubleClick={() => setIsEditing(true)}
                        onMouseDown={(e) => e.stopPropagation()} 
                        onWheel={stopScrollPropagation}
                    >
                        <MarkdownRenderer 
                            content={node.content} 
                            onNodeLinkClick={(id) => onSelect(id, false)} 
                        />
                    </div>
                );
        }
    };

    return (
        <div
            ref={nodeRef}
            className={`
                absolute flex flex-col pointer-events-auto
                rounded-[12px] overflow-hidden group/node
                transition-shadow duration-300 ease-out
                ${isSelected 
                    ? 'shadow-node-active ring-1 ring-accent-primary/50 z-30' 
                    : 'shadow-node ring-1 ring-border-subtle z-10 hover:shadow-node-hover'
                }
                ${node.executionState === 'running' ? 'ring-2 ring-blue-500 animate-pulse' : ''}
                ${node.executionState === 'success' ? 'ring-2 ring-emerald-500' : ''}
                ${node.executionState === 'error' ? 'ring-2 ring-red-500' : ''}
                ${node.executionState === 'skipped' ? 'opacity-50 ring-1 ring-border-subtle' : ''}
            `}
            style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
            }}
            onMouseDown={(_e) => {
                // Pass event to handleDragStart which handles selection
                // We don't call onSelect here directly to avoid double triggering
            }}
            onContextMenu={handleContextMenu}
            onDrop={handleNodeDrop}
            onDragOver={handleNodeDragOver}
        >
            <Handle side="top" id={`port-${node.id}-top`} onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'top'); }} onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, 'top'); }} isConnecting={isConnecting} />
            <Handle side="right" id={`port-${node.id}-right`} onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'right'); }} onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, 'right'); }} isConnecting={isConnecting} />
            <Handle side="bottom" id={`port-${node.id}-bottom`} onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'bottom'); }} onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, 'bottom'); }} isConnecting={isConnecting} />
            <Handle side="left" id={`port-${node.id}-left`} onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, 'left'); }} onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, 'left'); }} isConnecting={isConnecting} />

            {/* Dynamic Ports */}
            {getPortsForType(node.type).inputs.map((portName, idx, arr) => (
                <Handle 
                    key={`in-${portName}`}
                    id={`port-${node.id}-in-${portName}`}
                    side={`in-${portName}`}
                    label={portName}
                    style={{ left: '-12px', top: `${(idx + 1) * (100 / (arr.length + 1))}%` }}
                    onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, `in-${portName}`); }} 
                    onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, `in-${portName}`); }} 
                    isConnecting={isConnecting} 
                />
            ))}
            {getPortsForType(node.type).outputs.map((portName, idx, arr) => (
                <Handle 
                    key={`out-${portName}`}
                    id={`port-${node.id}-out-${portName}`}
                    side={`out-${portName}`}
                    label={portName}
                    style={{ right: '-12px', top: `${(idx + 1) * (100 / (arr.length + 1))}%` }}
                    onMouseDown={(e) => { e.stopPropagation(); onConnectStart(node.id, `out-${portName}`); }} 
                    onMouseUp={(e) => { e.stopPropagation(); onConnectEnd(node.id, `out-${portName}`); }} 
                    isConnecting={isConnecting} 
                />
            ))}

            <div 
                className={`
                    h-10 shrink-0 flex items-center justify-between px-3 gap-3 pointer-events-auto
                    border-b cursor-grab active:cursor-grabbing select-none
                    ${node.type === 'code'
                        ? 'bg-[#1E1E1E] border-[#333] text-gray-400' 
                        : 'bg-bg-panel backdrop-blur-xl border-border-subtle text-text-primary'}
                `}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 group shrink-0" onMouseDown={e => e.stopPropagation()}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                            className="w-2.5 h-2.5 rounded-full bg-red-400/80 hover:bg-red-500 transition-colors flex items-center justify-center overflow-hidden relative"
                        >
                            <i className="fa-solid fa-xmark text-[6px] text-black/50 opacity-0 group-hover:opacity-100 absolute"></i>
                        </button>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                    </div>

                    {isRenaming ? (
                        <input
                            type="text"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={handleRenameKey}
                            autoFocus
                            onMouseDown={(e) => e.stopPropagation()}
                            className="text-[12px] font-medium bg-transparent border-b border-accent-primary outline-none w-full min-w-0"
                            style={{ color: node.type === 'code' ? '#E0E0E0' : 'inherit' }}
                        />
                    ) : (
                        <div className="flex items-center gap-2 min-w-0">
                            <span 
                                onDoubleClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
                                className="text-[12px] font-medium opacity-90 truncate cursor-text"
                                title="Double-click to rename"
                            >
                                {node.title}
                            </span>
                            {node.executionState === 'running' && <i className="fa-solid fa-circle-notch animate-spin text-blue-500 text-[10px]"></i>}
                            {node.executionState === 'success' && <i className="fa-solid fa-check-circle text-emerald-500 text-[10px]"></i>}
                            {node.executionState === 'error' && <i className="fa-solid fa-triangle-exclamation text-red-500 text-[10px]" title={node.executionError}></i>}
                            {node.executionState === 'skipped' && <i className="fa-solid fa-forward-step text-text-muted text-[10px]" title="Skipped"></i>}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()}>
                    
                    {/* Copy Action (Code/Text) */}
                    {(node.type === 'code' || node.type === 'text') && (
                         <button 
                            onClick={handleActionCopy}
                            className="w-6 h-6 flex items-center justify-center rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                            title="Copy to Clipboard"
                         >
                            {showCopyFeedback ? <i className="fa-solid fa-check text-emerald-500 text-[10px]"></i> : <i className="fa-regular fa-copy text-[10px]"></i>}
                         </button>
                    )}

                    {/* Download Action (Image/Video/Code) */}
                    {(node.type === 'image' || node.type === 'video' || node.type === 'code') && (
                        <button 
                            onClick={handleActionDownload}
                            className="w-6 h-6 flex items-center justify-center rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                            title="Download"
                        >
                           <i className="fa-solid fa-download text-[10px]"></i>
                        </button>
                    )}

                    {/* Preview Toggle for Code */}
                    {isPreviewable && (
                        <div className="flex bg-black/20 p-0.5 rounded-2xl shrink-0 border border-white/5 ml-1">
                            <button 
                                onClick={(_e) => { setViewMode('code'); }}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-[5px] transition-all ${viewMode === 'code' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Code
                            </button>
                            <button 
                                onClick={(_e) => { setViewMode('preview'); }}
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded-[5px] transition-all ${viewMode === 'preview' ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Preview
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`flex-1 relative flex flex-col overflow-hidden ${node.type === 'group' ? 'bg-transparent pointer-events-none' : 'bg-bg-surface'}`}>
                {renderContent()}
            </div>
            
            <div 
                className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize opacity-0 hover:opacity-100 group-hover/node:opacity-100 z-50 flex items-end justify-end p-1.5 pointer-events-auto"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startW = node.width;
                    const startH = node.height;
                    
                    let finalW = startW;
                    let finalH = startH;

                    const handleResize = (ev: MouseEvent) => {
                         const dx = (ev.clientX - startX) / scale;
                         finalW = Math.max(200, startW + dx);
                         
                         // Aspect Ratio Locking for Media Nodes
                         if (node.type === 'image' || node.type === 'video') {
                             const ratio = startW / startH;
                             finalH = finalW / ratio;
                         } else {
                             const dy = (ev.clientY - startY) / scale;
                             finalH = Math.max(100, startH + dy);
                         }
                         
                         if (nodeRef.current) {
                             nodeRef.current.style.width = `${finalW}px`;
                             nodeRef.current.style.height = `${finalH}px`;
                         }
                    };
                    const handleUp = () => {
                         window.removeEventListener('mousemove', handleResize);
                         window.removeEventListener('mouseup', handleUp);
                         onUpdate(node.id, { width: finalW, height: finalH });
                    };
                    window.addEventListener('mousemove', handleResize);
                    window.addEventListener('mouseup', handleUp);
                }}
                onTouchStart={handleResizeTouchStart}
            >
                 <div className="w-3 h-3 rounded-full bg-accent-primary/20 hover:bg-accent-primary/80 border border-accent-primary/50 transition-colors"></div>
            </div>
        </div>
    );
});

export default CanvasNode;
