import { CanvasNode, CanvasEdge, HandleSide } from '../types';

export type NodeStatusCallback = (nodeId: string, status: 'idle' | 'running' | 'success' | 'error' | 'skipped', data?: any, error?: string) => void;

interface ExecutionContext {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    outputs: Record<string, Record<string, any>>; // nodeId -> { portName: value }
    onStatusUpdate: NodeStatusCallback;
    loopState?: Record<string, { array: any[], index: number }>;
}

// Topologically sort nodes based on edges
function topologicalSort(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[] {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(n => {
        adjList.set(n.id, []);
        inDegree.set(n.id, 0);
    });

    edges.forEach(e => {
        if (adjList.has(e.fromNode) && inDegree.has(e.toNode)) {
            adjList.get(e.fromNode)!.push(e.toNode);
            inDegree.set(e.toNode, inDegree.get(e.toNode)! + 1);
        }
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const sortedIds: string[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        sortedIds.push(current);

        adjList.get(current)!.forEach(neighbor => {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        });
    }

    if (sortedIds.length !== nodes.length) {
        throw new Error("Cycle detected in graph or orphaned nodes exist in a cycle.");
    }

    return sortedIds.map(id => nodes.find(n => n.id === id)!);
}

// Execute a single node
async function executeNode(node: CanvasNode, context: ExecutionContext): Promise<Record<string, any>> {
    const { edges, outputs } = context;

    // Gather inputs for this node based on incoming edges
    const incomingEdges = edges.filter(e => e.toNode === node.id);
    const inputs: Record<string, any> = {};

    incomingEdges.forEach(e => {
        const sourceOutputs = outputs[e.fromNode] || {};
        // e.fromSide is the output port name, e.toSide is the input port name
        // E.g., fromSide = 'out', toSide = 'in'
        const value = sourceOutputs[e.fromSide];
        if (value !== undefined) {
            inputs[e.toSide] = value;
        }
    });

    // Node-specific execution logic
    switch (node.type) {
        case 'text':
            return { out: node.content, text: node.content };
        
        case 'code':
            try {
                // Determine the code to run
                let codeToRun = node.content;
                if (node.files && Object.keys(node.files).length > 0) {
                    const activeFile = node.activeFile || Object.keys(node.files)[0];
                    if (node.files[activeFile]) {
                        codeToRun = node.files[activeFile].content;
                    }
                }

                // Create a function from the code, injecting inputs
                const inputKeys = Object.keys(inputs);
                const inputValues = Object.values(inputs);
                
                // Wrap code in an async function so it can use await and return
                const asyncWrapper = `
                    return (async () => {
                        ${codeToRun}
                    })();
                `;
                
                const fn = new Function(...inputKeys, asyncWrapper);
                const result = await fn(...inputValues);
                
                return { result: result, out: result };
            } catch (err: any) {
                throw new Error(err.message || 'Code execution failed');
            }

        case 'condition':
            try {
                // Determine the condition to run
                const codeToRun = node.content.trim() || 'false';

                // Create a function from the condition, injecting inputs
                const inputKeys = Object.keys(inputs);
                const inputValues = Object.values(inputs);
                
                const wrapper = `return !!(${codeToRun});`;
                const fn = new Function(...inputKeys, wrapper);
                const result = fn(...inputValues);
                
                if (result) {
                    return { true: inputs['input'] };
                } else {
                    return { false: inputs['input'] };
                }
            } catch (err: any) {
                throw new Error(err.message || 'Condition evaluation failed');
            }

        case 'loop':
            try {
                if (!context.loopState) context.loopState = {};
                
                let state = context.loopState[node.id];
                if (!state) {
                    // Initialize loop
                    let array = inputs['array'];
                    if (!Array.isArray(array)) {
                        // Try to parse content if no array input
                        try {
                            array = JSON.parse(node.content || '[]');
                        } catch (e) {
                            array = [];
                        }
                        if (!Array.isArray(array)) array = [];
                    }
                    state = { array, index: 0 };
                    context.loopState[node.id] = state;
                }

                if (state.index < state.array.length) {
                    const item = state.array[state.index];
                    const index = state.index;
                    state.index++;
                    return { item, index, __loopActive: true };
                } else {
                    // Loop done
                    delete context.loopState[node.id];
                    return { done: true };
                }
            } catch (err: any) {
                throw new Error(err.message || 'Loop execution failed');
            }
            
        case 'delay':
            try {
                let ms = parseInt(node.content || '1000', 10);
                if (inputs['ms'] !== undefined) {
                    ms = parseInt(inputs['ms'], 10);
                }
                await new Promise(resolve => setTimeout(resolve, ms));
                return { out: inputs['in'] };
            } catch (err: any) {
                throw new Error(err.message || 'Delay execution failed');
            }

        case 'merge':
            try {
                return { out: { in1: inputs['in1'], in2: inputs['in2'] } };
            } catch (err: any) {
                throw new Error(err.message || 'Merge execution failed');
            }

        case 'log':
            try {
                console.log(`[Log Node ${node.id}]:`, inputs['data']);
                return { out: inputs['data'] };
            } catch (err: any) {
                throw new Error(err.message || 'Log execution failed');
            }

        case 'api':
            try {
                const url = inputs['url'] || node.content.trim();
                const body = inputs['body'];
                const method = body ? 'POST' : 'GET';
                
                if (!url || !url.startsWith('http')) {
                     throw new Error('Invalid URL');
                }

                const res = await fetch(url, {
                    method,
                    headers: body ? { 'Content-Type': 'application/json' } : undefined,
                    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
                });

                let data;
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await res.json();
                } else {
                    data = await res.text();
                }

                if (!res.ok) {
                    throw new Error(`API Error: ${res.status} ${res.statusText}`);
                }

                return { response: data, status: res.status, out: data };
            } catch (err: any) {
                throw new Error(err.message || 'API request failed');
            }

        default:
            // For unhandled types, just pass through inputs or return empty
            return { ...inputs };
    }
}

export async function executeGraph(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    onStatusUpdate: NodeStatusCallback
): Promise<void> {
    try {
        const sortedNodes = topologicalSort(nodes, edges);
        
        const context: ExecutionContext = {
            nodes,
            edges,
            outputs: {},
            onStatusUpdate,
            loopState: {}
        };

        // Reset all nodes to idle
        nodes.forEach(n => onStatusUpdate(n.id, 'idle'));

        let skippedNodes = new Set<string>();
        let i = 0;
        const loopStack: number[] = [];

        while (i < sortedNodes.length) {
            const node = sortedNodes[i];

            // Check if node should be skipped
            const incomingEdges = edges.filter(e => e.toNode === node.id);
            if (incomingEdges.length > 0) {
                // Node is skipped if ALL incoming edges come from skipped nodes or ports that didn't emit a value
                const hasActiveInput = incomingEdges.some(e => {
                    if (skippedNodes.has(e.fromNode)) return false;
                    const sourceOutputs = context.outputs[e.fromNode] || {};
                    return sourceOutputs[e.fromSide] !== undefined;
                });
                
                if (!hasActiveInput) {
                    skippedNodes.add(node.id);
                    onStatusUpdate(node.id, 'skipped');
                    context.outputs[node.id] = {}; // Clear old outputs
                    
                    // Move to next node
                    i++;
                    if (i >= sortedNodes.length && loopStack.length > 0) {
                        i = loopStack.pop()!;
                        skippedNodes = new Set<string>(); // Reset skipped nodes for next iteration
                    }
                    continue;
                }
            }

            // Node is active, remove from skipped if it was there (e.g., from previous loop iteration)
            skippedNodes.delete(node.id);
            onStatusUpdate(node.id, 'running');
            try {
                const result = await executeNode(node, context);
                context.outputs[node.id] = result;
                onStatusUpdate(node.id, 'success', result);

                if (result && result.__loopActive) {
                    loopStack.push(i);
                }
            } catch (err: any) {
                onStatusUpdate(node.id, 'error', undefined, err.message);
                // Stop execution on first error
                break;
            }

            // Move to next node
            i++;
            if (i >= sortedNodes.length && loopStack.length > 0) {
                i = loopStack.pop()!;
                // Do NOT reset outputs globally, but we might need to clear downstream outputs to avoid stale data?
                // Actually, if a node runs again, it overwrites its output. If it's skipped, its output remains?
                // If it's skipped, downstream nodes reading from it should read undefined.
                // So we should clear outputs for nodes that are about to be re-evaluated.
                // But for now, just clearing skippedNodes is enough.
                skippedNodes = new Set<string>();
            }
        }
    } catch (err: any) {
        console.error("Graph Execution Error:", err);
        // If topological sort fails (cycle), mark all as error
        nodes.forEach(n => onStatusUpdate(n.id, 'error', undefined, err.message));
    }
}
