const fs = require('fs');
const content = fs.readFileSync('src/routes/studio/components/InfiniteCanvas.tsx', 'utf8');

const newCode = `    // --- Zoom & Pan Logic ---
    const handleWheel = useCallback((e: WheelEvent) => {
        // Prevent canvas zoom/pan if user is scrolling inside a node
        const target = e.target as HTMLElement;
        if (target.closest('.custom-scrollbar') || target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.closest('.monaco-editor')) {
            return;
        }

        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zooming
            const zoomSensitivity = 0.005;
            const deltaScale = -e.deltaY * zoomSensitivity;
            const newScale = Math.min(Math.max(0.05, transform.current.scale * Math.exp(deltaScale)), 4);

            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate new position to zoom into mouse cursor
            const worldX = (mouseX - transform.current.x) / transform.current.scale;
            const worldY = (mouseY - transform.current.y) / transform.current.scale;

            transform.current = {
                x: mouseX - worldX * newScale,
                y: mouseY - worldY * newScale,
                scale: newScale
            };

            setRenderScale(newScale);
            applyTransform();
        } else {
            // Panning (Trackpad or Mouse Wheel)
            const panSensitivity = 1.0;
            transform.current = {
                x: transform.current.x - (e.deltaX * panSensitivity),
                y: transform.current.y - (e.deltaY * panSensitivity),
                scale: transform.current.scale
            };
            applyTransform();
        }
    }, [applyTransform]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.canvas-node') || target.closest('.omni-bar') || target.closest('.control-panel')) {
            return;
        }

        if (e.pointerType === 'touch' && e.isPrimary) {
            // Touch panning
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            containerRef.current?.setPointerCapture(e.pointerId);
        } else if (e.button === 0 || e.button === 1) { // Left or Middle click
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            containerRef.current?.setPointerCapture(e.pointerId);
            setInteracting(true);
        }
    }, [setInteracting]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            
            transform.current = {
                ...transform.current,
                x: transform.current.x + dx,
                y: transform.current.y + dy
            };
            
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            applyTransform();
        }
    }, [applyTransform]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (isPanning.current) {
            isPanning.current = false;
            containerRef.current?.releasePointerCapture(e.pointerId);
            setInteracting(false);
        }
    }, [setInteracting]);`;

const oldCode = `    // --- Zoom & Pan Logic ---
    const handleWheel = useCallback((e: WheelEvent) => {
        // Prevent canvas zoom/pan if user is scrolling inside a node
        const target = e.target as HTMLElement;
        if (target.closest('.custom-scrollbar') || target.tagName === 'TEXTAREA' || target.tagName === 'PRE' || target.closest('.monaco-editor')) {
            return;
        }

        e.preventDefault();
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const currentScale = transform.current.scale;
        const currentX = transform.current.x;
        const currentY = transform.current.y;

        let newScale = currentScale;
        let newX = currentX;
        let newY = currentY;

        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomDelta = -e.deltaY * 0.01;
            newScale = Math.min(Math.max(0.1, currentScale + zoomDelta), 3);
            
            // Adjust position to zoom towards mouse
            const scaleRatio = newScale / currentScale;
            newX = mouseX - (mouseX - currentX) * scaleRatio;
            newY = mouseY - (mouseY - currentY) * scaleRatio;
            
            setRenderScale(newScale);
        } else {
            // Pan
            newX -= e.deltaX;
            newY -= e.deltaY;
        }

        transform.current = { x: newX, y: newY, scale: newScale };
        applyTransform();
    }, [applyTransform]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Prevent canvas interaction if clicking on UI elements
        const target = e.target as HTMLElement;
        if (target.closest('.canvas-node') || target.closest('.omni-bar') || target.closest('.control-panel') || target.closest('.status-island')) {
            return;
        }

        // Close context menu
        if (contextMenu) setContextMenu(null);

        // Handle Middle Click or Space+Drag for panning
        if (e.button === 1 || (e.button === 0 && (e.altKey || e.shiftKey))) {
            isPanning.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            containerRef.current?.setPointerCapture(e.pointerId);
            setInteracting(true);
            return;
        }

        // Handle Touch Long Press for Context Menu
        if (e.pointerType === 'touch') {
            const touchWorld = screenToWorld(e.clientX, e.clientY);
            longPressTimer.current = setTimeout(() => {
                setContextMenu({ type: 'canvas', x: e.clientX, y: e.clientY, worldX: touchWorld.x, worldY: touchWorld.y });
            }, 500);
        }

        // Selection Box (Left click on empty space)
        if (e.button === 0 && !isPanning.current) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            setSelectionBox({
                startX: worldPos.x,
                startY: worldPos.y,
                endX: worldPos.x,
                endY: worldPos.y
            });
            containerRef.current?.setPointerCapture(e.pointerId);
            setInteracting(true);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (isPanning.current) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            
            transform.current = {
                ...transform.current,
                x: transform.current.x + dx,
                y: transform.current.y + dy
            };
            
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            applyTransform();
        } else if (selectionBox) {
            const worldPos = screenToWorld(e.clientX, e.clientY);
            setSelectionBox(prev => prev ? { ...prev, endX: worldPos.x, endY: worldPos.y } : null);
            
            // Select nodes within box
            const minX = Math.min(selectionBox.startX, worldPos.x);
            const maxX = Math.max(selectionBox.startX, worldPos.x);
            const minY = Math.min(selectionBox.startY, worldPos.y);
            const maxY = Math.max(selectionBox.startY, worldPos.y);

            const selectedIds = nodesRef.current
                .filter(n => 
                    n.x < maxX && n.x + n.width > minX &&
                    n.y < maxY && n.y + n.height > minY
                )
                .map(n => n.id);

            if (selectedIds.length > 0) {
                onNodeSelect(selectedIds, true);
            } else if (selectedNodeIds && selectedNodeIds.size > 0) {
                onNodeSelect([], false);
            }
        } else if (connectingState) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (isPanning.current) {
            isPanning.current = false;
        }

        if (selectionBox) {
            setSelectionBox(null);
            // If it was just a quick click (no drag), deselect all
            if (Math.abs(selectionBox.startX - selectionBox.endX) < 5 && 
                Math.abs(selectionBox.startY - selectionBox.endY) < 5) {
                onNodeSelect([], false);
                onBackgroundClick?.();
            }
        }

        if (connectingState) {
            setConnectingState(null);
        }

        containerRef.current?.releasePointerCapture(e.pointerId);
        setInteracting(false);
    };`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/studio/components/InfiniteCanvas.tsx', newFile);
