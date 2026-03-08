
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CanvasNode as CanvasNodeType, CanvasEdge, HandleSide, NodeType } from '../types';
import CanvasNode from './CanvasNode';

interface InfiniteCanvasProps {
    nodes: CanvasNodeType[];
    edges: CanvasEdge[];
    onNodeMove: (id: string, x: number, y: number, deltaX: number, deltaY: number) => void;
    onNodeSelect: (id: string | string[], multi: boolean) => void;
    onNodeDelete: (id: string) => void;
    onNodeUpdate: (id: string, updates: Partial<CanvasNodeType>) => void;
    onEdgeDelete: (id: string) => void;
    onConnect: (fromNode: string, fromSide: HandleSide, toNode: string, toSide: HandleSide) => void;
    activeNodeId: string | null;
    selectedNodeIds?: Set<string>;
    snapToGrid: boolean;
    onAddNode: (type: NodeType, x: number, y: number) => void;
    onFileUpload: (file: File, x: number, y: number) => void;
    onNodeDuplicate: (id: string) => void;
    onGroupNodes?: () => void;
    onUngroupNode?: (id: string) => void;
    onBackgroundClick?: () => void;
    statusState?: 'idle' | 'thinking' | 'working' | 'listening' | 'routing';
    useStepRouting?: boolean;
}

// Helper: Calculate point on Cubic Bezier at t (0-1)
const getPointOnBezier = (t: number, x1: number, y1: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number, x2: number, y2: number) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    const x = mt3 * x1 + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * x2;
    const y = mt3 * y1 + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * y2;
    return { x, y };
};

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ 
    nodes, 
    edges,
    onNodeMove, 
    onNodeSelect, 
    onNodeDelete, 
    onNodeUpdate,
    onEdgeDelete,
    onConnect,
    activeNodeId,
    selectedNodeIds,
    snapToGrid,
    onAddNode,
    onFileUpload,
    onNodeDuplicate,
    onGroupNodes,
    onUngroupNode,
    onBackgroundClick,
    statusState = 'idle',
    useStepRouting = false
}) => {
    // --- State & Refs ---
    const transform = useRef({ x: 0, y: 0, scale: 1 });
    const [renderScale, setRenderScale] = useState(1);
    
    // Performance optimization: Keep nodes in ref to access in handlers without triggering re-renders
    const nodesRef = useRef(nodes);
    useEffect(() => { nodesRef.current = nodes; }, [nodes]);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const minimapContentRef = useRef<HTMLDivElement>(null);
    const minimapViewportRef = useRef<HTMLDivElement>(null);
    const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Interaction State
    const [selectionBox, setSelectionBox] = useState<{startX: number, startY: number, endX: number, endY: number} | null>(null);
    const [connectingState, setConnectingState] = useState<{ nodeId: string, side: HandleSide, x: number, y: number } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
    const [contextMenu, setContextMenu] = useState<{ type: 'canvas' | 'node'; x: number; y: number; worldX?: number; worldY?: number; nodeId?: string; } | null>(null);
    const [uploadPosition, setUploadPosition] = useState<{x: number, y: number} | null>(null);
    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    // Tracking Refs
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const isPinching = useRef(false);
    const lastPinchDist = useRef(0);
    const pinchCenter = useRef({ x: 0, y: 0 });

    // --- Dynamic Rendering Quality ---
    const setInteracting = useCallback((isInteracting: boolean) => {
        if (contentRef.current && gridRef.current) {
            const val = isInteracting ? 'transform' : 'auto';
            contentRef.current.style.willChange = val;
            gridRef.current.style.willChange = val;
        }
    }, []);

    const updateMinimap = useCallback(() => {
        if (!minimapContentRef.current || !minimapViewportRef.current || !containerRef.current) return;
        
        const nodesList = nodesRef.current;
        if (nodesList.length === 0) {
            minimapContentRef.current.style.display = 'none';
            minimapViewportRef.current.style.display = 'none';
            return;
        }

        minimapContentRef.current.style.display = 'block';
        minimapViewportRef.current.style.display = 'block';

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodesList.forEach(n => {
            if (n.x < minX) minX = n.x;
            if (n.y < minY) minY = n.y;
            if (n.x + n.width > maxX) maxX = n.x + n.width;
            if (n.y + n.height > maxY) maxY = n.y + n.height;
        });

        const padding = 500;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;

        const contentW = maxX - minX;
        const contentH = maxY - minY;

        const mapW = 150;
        const mapH = 100;

        const scaleX = mapW / contentW;
        const scaleY = mapH / contentH;
        const scale = Math.min(scaleX, scaleY);

        const mapContentW = contentW * scale;
        const mapContentH = contentH * scale;

        const offsetX = (mapW - mapContentW) / 2;
        const offsetY = (mapH - mapContentH) / 2;

        // Update nodes in minimap
        const children = minimapContentRef.current.children;
        nodesList.forEach((n, i) => {
            const child = children[i] as HTMLElement;
            if (child) {
                const nx = offsetX + (n.x - minX) * scale;
                const ny = offsetY + (n.y - minY) * scale;
                const nw = n.width * scale;
                const nh = n.height * scale;
                child.style.transform = `translate(${nx}px, ${ny}px)`;
                child.style.width = `${nw}px`;
                child.style.height = `${nh}px`;
            }
        });

        const { x, y, scale: transformScale } = transform.current;
        const rect = containerRef.current.getBoundingClientRect();
        
        const viewW = rect.width / transformScale;
        const viewH = rect.height / transformScale;
        const viewX = -x / transformScale;
        const viewY = -y / transformScale;

        const mapBoxX = offsetX + (viewX - minX) * scale;
        const mapBoxY = offsetY + (viewY - minY) * scale;
        const mapBoxW = viewW * scale;
        const mapBoxH = viewH * scale;

        minimapViewportRef.current.style.transform = `translate(${mapBoxX}px, ${mapBoxY}px)`;
        minimapViewportRef.current.style.width = `${mapBoxW}px`;
        minimapViewportRef.current.style.height = `${mapBoxH}px`;
    }, []);

    const applyTransform = useCallback(() => {
        if (contentRef.current && gridRef.current) {
            const { x, y, scale } = transform.current;
            const transformString = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
            contentRef.current.style.transform = transformString;
            gridRef.current.style.transform = transformString;
            updateMinimap();
        }
    }, [updateMinimap]);

    useEffect(() => {
        updateMinimap();
    }, [nodes, updateMinimap]);

    const screenToWorld = useCallback((screenX: number, screenY: number) => {
        const { x, y, scale } = transform.current;
        const rect = containerRef.current?.getBoundingClientRect();
        const offsetX = rect ? rect.left : 0;
        const offsetY = rect ? rect.top : 0;
        return {
            x: (screenX - offsetX - x) / scale,
            y: (screenY - offsetY - y) / scale
        };
    }, []);

    
    const handleZoomIn = () => {
        setRenderScale(prev => Math.min(3, prev * 1.2));
    };

    const handleZoomOut = () => {
        setRenderScale(prev => Math.max(0.1, prev / 1.2));
    };

    const handleFitView = () => {
        if (nodes.length === 0) {
            setOffset({ x: 0, y: 0 });
            setRenderScale(1);
            return;
        }

        const padding = 50;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            if (node.x < minX) minX = node.x;
            if (node.y < minY) minY = node.y;
            if (node.x + node.width > maxX) maxX = node.x + node.width;
            if (node.y + node.height > maxY) maxY = node.y + node.height;
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

        const scaleX = (containerWidth - padding * 2) / contentWidth;
        const scaleY = (containerHeight - padding * 2) / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1);

        setRenderScale(newScale);

        const centerX = minX + contentWidth / 2;
        const centerY = minY + contentHeight / 2;
        
        setOffset({
            x: (containerWidth / 2) - (centerX * newScale),
            y: (containerHeight / 2) - (centerY * newScale)
        });
    };

    // --- Zoom & Pan Logic ---
    const handleWheel = useCallback((e: WheelEvent) => {
        // Prevent canvas zoom/pan if user is scrolling inside a node
        const target = e.target as HTMLElement;
        if (target.closest('.custom-scrollbar') || target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.tagName === 'CODE') {
            return; 
        }

        e.preventDefault();
        setInteracting(true);
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        interactionTimeout.current = setTimeout(() => {
            setInteracting(false);
            setRenderScale(transform.current.scale); 
        }, 150);

        if (e.ctrlKey || e.metaKey) {
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
        applyTransform();
    }, [applyTransform, setInteracting]);

    useEffect(() => {
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => { if (el) el.removeEventListener('wheel', handleWheel); };
    }, [handleWheel]);

    // --- Mouse Interaction Logic ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (contextMenu) setContextMenu(null);
        const isMiddleMouse = e.button === 1;
        const isBackground = e.target === containerRef.current || e.target === gridRef.current;
        
        if (isBackground && e.shiftKey) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            setSelectionBox({ startX: worldPos.x, startY: worldPos.y, endX: worldPos.x, endY: worldPos.y });
            return;
        }

        if (isMiddleMouse || isBackground) {
            if (onBackgroundClick && !isMiddleMouse) onBackgroundClick();
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
            setInteracting(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (selectionBox) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            setSelectionBox(prev => prev ? { ...prev, endX: worldPos.x, endY: worldPos.y } : null);
            return;
        }

        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            transform.current.x += dx;
            transform.current.y += dy;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            applyTransform();
            return;
        }

        // Only update React state for mouse position if we are actively connecting.
        // This avoids re-rendering the entire canvas tree on every mouse move.
        if (connectingState) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            setMousePos(worldPos);
        }
    };

    const handleMouseUp = () => {
        if (selectionBox) {
            // Compute selected nodes
            const minX = Math.min(selectionBox.startX, selectionBox.endX);
            const maxX = Math.max(selectionBox.startX, selectionBox.endX);
            const minY = Math.min(selectionBox.startY, selectionBox.endY);
            const maxY = Math.max(selectionBox.startY, selectionBox.endY);

            const selectedIds = nodes.filter(node => {
                const nodeRight = node.x + node.width;
                const nodeBottom = node.y + node.height;
                // Check for intersection
                return !(node.x > maxX || nodeRight < minX || node.y > maxY || nodeBottom < minY);
            }).map(n => n.id);

            if (selectedIds.length > 0) {
                onNodeSelect(selectedIds, false);
            } else {
                onBackgroundClick?.();
            }
            setSelectionBox(null);
        }

        if (isPanning.current) {
            isPanning.current = false;
            if (containerRef.current) containerRef.current.style.cursor = 'grab';
            setInteracting(false);
            setRenderScale(transform.current.scale);
        }
        if (connectingState) {
            setConnectingState(null); // Dropped in void
        }
    };

    // --- Touch Logic ---
    const getTouchDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const getTouchCenter = (touches: React.TouchList) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });

    const handleTouchStart = (e: React.TouchEvent) => {
        if (contextMenu) setContextMenu(null);
        if (longPressTimer.current) clearTimeout(longPressTimer.current);

        if (e.target === containerRef.current || e.target === gridRef.current) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const startX = touch.clientX;
                const startY = touch.clientY;

                // Long Press Detection for Context Menu (Mobile Insert)
                longPressTimer.current = setTimeout(() => {
                    isPanning.current = false;
                    const worldPos = screenToWorld(startX, startY);
                    setContextMenu({ type: 'canvas', x: startX, y: startY, worldX: worldPos.x, worldY: worldPos.y });
                    if (navigator.vibrate) navigator.vibrate(50);
                }, 500);

                isPanning.current = true;
                lastMousePos.current = { x: startX, y: startY };
                setInteracting(true);
            } else if (e.touches.length === 2) {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
                isPanning.current = false;
                isPinching.current = true;
                lastPinchDist.current = getTouchDistance(e.touches);
                pinchCenter.current = getTouchCenter(e.touches);
                setInteracting(true);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Cancel long press on movement
        if (longPressTimer.current) {
             const touch = e.touches[0];
             const moveDist = Math.hypot(touch.clientX - lastMousePos.current.x, touch.clientY - lastMousePos.current.y);
             if (moveDist > 10) {
                 clearTimeout(longPressTimer.current);
                 longPressTimer.current = null;
             }
        }

        if (isPanning.current && e.touches.length === 1) {
            const dx = e.touches[0].clientX - lastMousePos.current.x;
            const dy = e.touches[0].clientY - lastMousePos.current.y;
            transform.current.x += dx;
            transform.current.y += dy;
            lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            applyTransform();
        } else if (isPinching.current && e.touches.length === 2) {
            const newDist = getTouchDistance(e.touches);
            const newCenter = getTouchCenter(e.touches);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const scaleFactor = newDist / lastPinchDist.current;
            const newScale = Math.min(Math.max(transform.current.scale * scaleFactor, 0.1), 8);
            const centerX = newCenter.x - rect.left;
            const centerY = newCenter.y - rect.top;
            const newX = centerX - (centerX - transform.current.x) * (newScale / transform.current.scale);
            const newY = centerY - (centerY - transform.current.y) * (newScale / transform.current.scale);
            
            transform.current = { 
                x: newX + (newCenter.x - pinchCenter.current.x), 
                y: newY + (newCenter.y - pinchCenter.current.y), 
                scale: newScale 
            };
            lastPinchDist.current = newDist;
            pinchCenter.current = newCenter;
            applyTransform();
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        setInteracting(false);
        setRenderScale(transform.current.scale);
        isPanning.current = false;
        isPinching.current = false;
    };

    // --- File Drop & Context Menu ---
    const handleDrop = (e: React.DragEvent) => {
        setIsDraggingOver(false);
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;
        const worldPos = screenToWorld(e.clientX, e.clientY);
        files.forEach((file, index) => {
            onFileUpload(file, worldPos.x + index * 20, worldPos.y + index * 20);
        });
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const worldPos = screenToWorld(e.clientX, e.clientY);
        setContextMenu({ type: 'canvas', x: e.clientX, y: e.clientY, worldX: worldPos.x, worldY: worldPos.y });
    };

    // Use useCallback for node context menu to prevent re-renders of nodes
    const handleNodeContextMenu = useCallback((id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ type: 'node', x: e.clientX, y: e.clientY, nodeId: id });
    }, []);

    const getHandleCoords = (node: CanvasNodeType, side: HandleSide) => {
        // Find DOM element for the handle to get precise coordinates for custom ports
        const portEl = document.getElementById(`port-${node.id}-${side}`);
        if (portEl && contentRef.current) {
            const portRect = portEl.getBoundingClientRect();
            const canvasRect = contentRef.current.getBoundingClientRect();
            // Calculate relative to the canvas content container (unscaled)
            return {
                x: (portRect.left + portRect.width / 2 - canvasRect.left) / transform.current.scale,
                y: (portRect.top + portRect.height / 2 - canvasRect.top) / transform.current.scale
            };
        }

        // Fallback to standard sides
        switch(side) {
            case 'left': return { x: node.x, y: node.y + node.height/2 };
            case 'right': return { x: node.x + node.width, y: node.y + node.height/2 };
            case 'top': return { x: node.x + node.width/2, y: node.y };
            case 'bottom': return { x: node.x + node.width/2, y: node.y + node.height };
            default: return { x: node.x + node.width/2, y: node.y + node.height/2 };
        }
    };

    // --- Connection Logic (Stable Callbacks) ---
    // These functions use nodesRef to avoid being recreated on every node update/mouse move

    const handleConnectStart = useCallback((nodeId: string, side: HandleSide) => {
        const node = nodesRef.current.find(n => n.id === nodeId);
        if (!node) return;
        const coords = getHandleCoords(node, side);
        setConnectingState({ nodeId, side, x: coords.x, y: coords.y });
    }, []);

    const handleConnectEnd = useCallback((nodeId: string, side: HandleSide) => {
        setConnectingState(prev => {
            if (prev && prev.nodeId !== nodeId) {
                // Call the parent handler
                onConnect(prev.nodeId, prev.side, nodeId, side);
            }
            return null;
        });
    }, [onConnect]);

    // Calculate Bezier Control Points and Path
    const calculateStepPath = (x1: number, y1: number, x2: number, y2: number, side1: HandleSide, side2?: HandleSide) => {
        let pathString = `M ${x1} ${y1}`;
        const midX = x1 + (x2 - x1) / 2;
        const midY = y1 + (y2 - y1) / 2;

        const isHorizontal1 = side1 === 'left' || side1 === 'right' || side1.startsWith('in-') || side1.startsWith('out-');
        const isHorizontal2 = side2 ? (side2 === 'left' || side2 === 'right' || side2.startsWith('in-') || side2.startsWith('out-')) : isHorizontal1;

        if (isHorizontal1) {
            pathString += ` L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
            pathString += ` L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
        }
        return { pathString, midPoint: { x: midX, y: midY } };
    };

    const calculateEdgeCurve = (x1: number, y1: number, x2: number, y2: number, side1: HandleSide, side2?: HandleSide) => {
        const dist = Math.hypot(x2 - x1, y2 - y1) * 0.5;
        let cp1x = x1, cp1y = y1, cp2x = x2, cp2y = y2;
        
        // Control Point 1
        if (side1 === 'left' || side1.startsWith('in-')) { cp1x -= dist; }
        else if (side1 === 'right' || side1.startsWith('out-')) { cp1x += dist; }
        else if (side1 === 'top') { cp1y -= dist; }
        else if (side1 === 'bottom') { cp1y += dist; }

        // Control Point 2
        if (side2) {
            if (side2 === 'left' || side2.startsWith('in-')) { cp2x -= dist; }
            else if (side2 === 'right' || side2.startsWith('out-')) { cp2x += dist; }
            else if (side2 === 'top') { cp2y -= dist; }
            else if (side2 === 'bottom') { cp2y += dist; }
        } else {
            cp2x = x2; cp2y = y2;
        }

        return { x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2 };
    };

    // --- File Input Helpers ---
    const triggerFileUpload = (worldX: number, worldY: number) => {
        setUploadPosition({x: worldX, y: worldY});
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && uploadPosition) {
            Array.from(e.target.files).forEach((file, index) => {
                 onFileUpload(file, uploadPosition.x + index * 20, uploadPosition.y + index * 20);
            });
        }
        setUploadPosition(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing bg-transparent"
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={handleContextMenu}
            
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); }}

        >
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileInputChange} multiple />

            {/* Drag & Drop Overlay */}
            <div className={`absolute inset-0 z-50 pointer-events-none bg-indigo-500/10 backdrop-blur-[2px] border-4 border-dashed border-indigo-500/50 flex flex-col items-center justify-center transition-opacity duration-300 ${isDraggingOver ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-hall-950/80 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-400 animate-bounce"></i>
                    <span className="text-xl font-bold text-white tracking-widest uppercase">Drop Assets Here</span>
                    <span className="text-sm text-hall-400">Images, Code Snippets, JSON</span>
                </div>
            </div>


            {/* Grid Layer */}
            <div 
                ref={gridRef}
                className="absolute inset-0 origin-top-left pointer-events-none"
                style={{ width: '400%', height: '400%', left: '-150%', top: '-150%' }}
            >
                 <div className="w-full h-full dot-grid opacity-40"></div>
            </div>

            {/* Content Layer */}
            <div 
                ref={contentRef}
                className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-none"
            >
                {/* Edges Layer */}
                <svg className="absolute top-0 left-0 w-[50000px] h-[50000px] pointer-events-none -z-10 overflow-visible">
                    <defs>
                        <style>
                            {`
                            @keyframes pulseFlow {
                                from { stroke-dashoffset: 100; }
                                to { stroke-dashoffset: 0; }
                            }
                            .edge-pulse {
                                stroke-dasharray: 8 92;
                                animation: pulseFlow 2.5s linear infinite;
                                stroke-linecap: round;
                            }
                            .edge-pulse-active {
                                stroke-dasharray: 10 90;
                                animation: pulseFlow 1s linear infinite;
                                stroke-linecap: round;
                            }
                            `}
                        </style>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" opacity="0.4" />
                        </marker>
                        <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-primary)" opacity="0.8" />
                        </marker>
                    </defs>
                    
                    {edges.map(edge => {
                        const fromNode = nodes.find(n => n.id === edge.fromNode);
                        const toNode = nodes.find(n => n.id === edge.toNode);
                        if (!fromNode || !toNode) return null;
                        
                        const start = getHandleCoords(fromNode, edge.fromSide);
                        const end = getHandleCoords(toNode, edge.toSide);
                        let pathString = '';
                        let midPoint = { x: 0, y: 0 };
                        if (useStepRouting) {
                            const stepData = calculateStepPath(start.x, start.y, end.x, end.y, edge.fromSide, edge.toSide);
                            pathString = stepData.pathString;
                            midPoint = stepData.midPoint;
                        } else {
                            const { x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2 } = calculateEdgeCurve(start.x, start.y, end.x, end.y, edge.fromSide, edge.toSide);
                            pathString = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
                            midPoint = getPointOnBezier(0.5, x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2);
                        }
                        const isHovered = hoveredEdgeId === edge.id;

                        return (
                            <g 
                                key={edge.id} 
                                className="group pointer-events-auto"
                                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                                onMouseLeave={() => setHoveredEdgeId(null)}
                            >
                                {/* Invisible wide path for easier detection */}
                                <path 
                                    d={pathString} 
                                    fill="none" 
                                    stroke="transparent" 
                                    strokeWidth="20" 
                                />
                                {/* Base visible path */}
                                <path 
                                    d={pathString}
                                    fill="none"
                                    stroke="var(--text-secondary)"
                                    strokeWidth={isHovered ? "3" : "2"}
                                    strokeOpacity={isHovered ? "0.4" : "0.15"}
                                    className="transition-all duration-200"
                                />
                                
                                {/* Animated data flow path (Pulse) */}
                                <path
                                    d={pathString}
                                    fill="none"
                                    stroke={isHovered || (statusState !== 'idle') ? "var(--accent-primary)" : "var(--text-secondary)"}
                                    strokeWidth={isHovered ? "3" : "2"}
                                    strokeOpacity={isHovered || (statusState !== 'idle') ? "0.9" : "0.5"}
                                    className={`pointer-events-none transition-all duration-200 ${isHovered || (statusState !== 'idle') ? 'edge-pulse-active' : 'edge-pulse'}`}
                                    markerEnd={isHovered || (statusState !== 'idle') ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                                />
                                
                                {/* Delete Button on Hover */}
                                <foreignObject 
                                    x={midPoint.x - 12} 
                                    y={midPoint.y - 12} 
                                    width="24" 
                                    height="24"
                                    className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEdgeDelete(edge.id); }}
                                        className="w-6 h-6 rounded-full bg-bg-surface border border-border-subtle shadow-sm flex items-center justify-center hover:bg-red-500 hover:border-red-500 group/btn transition-colors cursor-pointer"
                                        title="Delete Connection"
                                    >
                                        <i className="fa-solid fa-xmark text-[10px] text-text-secondary group-hover/btn:text-white"></i>
                                    </button>
                                </foreignObject>
                            </g>
                        );
                    })}

                    {connectingState && (
                        <path 
                            d={useStepRouting ? calculateStepPath(connectingState.x, connectingState.y, mousePos.x, mousePos.y, connectingState.side).pathString : `M ${connectingState.x} ${connectingState.y} L ${mousePos.x} ${mousePos.y}`}
                            fill="none"
                            stroke="var(--accent-primary)"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                            className="pointer-events-none animate-flow"
                        />
                    )}
                </svg>

                {/* Selection Box */}
                {selectionBox && (
                    <div
                        className="absolute bg-accent-primary/20 border border-accent-primary pointer-events-none z-50"
                        style={{
                            left: Math.min(selectionBox.startX, selectionBox.endX),
                            top: Math.min(selectionBox.startY, selectionBox.endY),
                            width: Math.abs(selectionBox.endX - selectionBox.startX),
                            height: Math.abs(selectionBox.endY - selectionBox.startY),
                        }}
                    />
                )}

                {/* Nodes Layer */}
                {nodes.map(node => (
                    <CanvasNode 
                        key={node.id}
                        node={node}
                        isSelected={node.id === activeNodeId || (selectedNodeIds ? selectedNodeIds.has(node.id) : false)}
                        scale={renderScale} 
                        onMove={(id, x, y, dx, dy) => onNodeMove(id, x, y, dx, dy)}
                        onSelect={onNodeSelect}
                        onDelete={onNodeDelete}
                        onUpdate={onNodeUpdate}
                        onConnectStart={handleConnectStart}
                        onConnectEnd={handleConnectEnd}
                        snapToGrid={snapToGrid}
                        isConnecting={!!connectingState}
                        onContextMenu={handleNodeContextMenu}
                    />
                ))}
            </div>

            {contextMenu && (
                <div 
                    className="fixed z-[200] w-52 bg-bg-panel/95 backdrop-blur-xl border border-border-subtle shadow-2xl rounded-xl overflow-hidden py-1.5 animate-scale-in origin-top-left"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    {contextMenu.type === 'canvas' ? (
                        <>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Insert Node</div>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('sticky', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-note-sticky text-xs w-4"></i> Sticky Note</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('text', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-font text-xs w-4"></i> Text Note</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('code', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-code text-xs w-4"></i> Code Snippet</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('condition', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-code-branch text-xs w-4"></i> Condition</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('loop', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-rotate-right text-xs w-4"></i> Loop</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('delay', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-regular fa-clock text-xs w-4"></i> Delay</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('merge', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-code-merge text-xs w-4"></i> Merge</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('log', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-terminal text-xs w-4"></i> Console Log</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('image', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-regular fa-image text-xs w-4"></i> Image Card</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('video', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-film text-xs w-4"></i> Video Card</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('website', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-globe text-xs w-4"></i> Website Embed</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('terminal', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-terminal text-xs w-4"></i> Terminal</button>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) onAddNode('api', contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-cloud text-xs w-4"></i> API Request</button>
                            <div className="h-[1px] bg-border-subtle my-1"></div>
                            <button onClick={() => { if(contextMenu.worldX!==undefined) triggerFileUpload(contextMenu.worldX, contextMenu.worldY!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-cloud-arrow-up text-xs w-4"></i> Upload File</button>
                        </>
                    ) : (
                        <>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Node Actions</div>
                            <button onClick={() => { if(contextMenu.nodeId) onNodeSelect(contextMenu.nodeId, false); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-layer-group text-xs w-4"></i> Bring to Front</button>
                            <button onClick={() => { if(contextMenu.nodeId) onNodeDuplicate(contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-regular fa-clone text-xs w-4"></i> Duplicate</button>
                            {selectedNodeIds && selectedNodeIds.size > 1 && (
                                <button onClick={() => { onGroupNodes?.(); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-object-group text-xs w-4"></i> Group Selection</button>
                            )}
                            {contextMenu.nodeId && nodes.find(n => n.id === contextMenu.nodeId)?.type === 'group' && (
                                <button onClick={() => { onUngroupNode?.(contextMenu.nodeId!); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-accent-primary hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-object-ungroup text-xs w-4"></i> Ungroup</button>
                            )}
                            <div className="h-[1px] bg-border-subtle my-1"></div>
                            <button onClick={() => { if(contextMenu.nodeId) onNodeDelete(contextMenu.nodeId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-3"><i className="fa-solid fa-trash text-xs w-4"></i> Delete</button>
                        </>
                    )}
                </div>
            )}

            {/* Minimap */}
            <div className="absolute bottom-6 right-6 w-[150px] h-[100px] bg-bg-surface/80 backdrop-blur-md border border-border-subtle rounded-2xl overflow-hidden z-40 shadow-lg pointer-events-none hidden md:block">
                <div ref={minimapContentRef} className="absolute inset-0 origin-top-left">
                    {nodes.map(node => (
                        <div 
                            key={`minimap-${node.id}`} 
                            className={`absolute rounded-[2px] ${node.id === activeNodeId ? 'bg-accent-primary' : 'bg-text-secondary/50'}`} 
                        />
                    ))}
                </div>
                <div ref={minimapViewportRef} className="absolute border border-accent-primary bg-accent-primary/10 rounded-sm pointer-events-none"></div>
            </div>

            
            <div className="absolute bottom-6 left-6 z-40 flex items-center gap-2">
                 <div className="flex items-center bg-bg-surface/80 backdrop-blur-md border border-border-subtle rounded-xl overflow-hidden shadow-glass">
                     <button 
                         onClick={handleZoomOut}
                         className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                         title="Zoom Out"
                     >
                         <i className="fa-solid fa-minus text-xs"></i>
                     </button>
                     <div className="px-2 text-[10px] font-mono text-text-secondary tracking-widest uppercase min-w-[60px] text-center pointer-events-none select-none">
                        {Math.round(renderScale * 100)}%
                     </div>
                     <button 
                         onClick={handleZoomIn}
                         className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                         title="Zoom In"
                     >
                         <i className="fa-solid fa-plus text-xs"></i>
                     </button>
                 </div>
                 
                 <button 
                     onClick={handleFitView}
                     className="w-8 h-8 flex items-center justify-center bg-bg-surface/80 backdrop-blur-md border border-border-subtle rounded-xl shadow-glass text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                     title="Fit to Screen"
                 >
                     <i className="fa-solid fa-expand text-xs"></i>
                                 </button>
            </div>
        </div>
    );
};

export default InfiniteCanvas;
