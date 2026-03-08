import { useLocation, useNavigate } from "react-router-dom";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgentId, Message, MessageType, CanvasNode, CanvasEdge, HandleSide, NodeType, Workspace, CanvasFile, ImageConfig, VideoConfig } from './types';
import { AGENTS } from './constants';
import InfiniteCanvas from './components/InfiniteCanvas';
import OmniBar from './components/OmniBar';
import ChatOverlay from './components/ChatOverlay';
import StatusIsland from './components/StatusIsland';
import ControlPanel from './components/ControlPanel';
import ContextualTuningChat from './components/ContextualTuningChat';
import WorkspacePanel from './components/WorkspacePanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AI } from './services/ai';
import { executeGraph } from './services/execution';
import { ImageOptions, VideoOptions } from './services/ai/types';

/**
 * StudioView — the full infinite-canvas experience, migrated from weaver-nest App.tsx.
 *
 * This component contains ALL state management, effects, handlers, and rendering
 * from the original App.tsx. The auth/login wrapper and HTML/CSS CDN imports have
 * been stripped — those are handled at the Stagework app level.
 *
 * Cloud features (ensureFolderPath, uploadToStorage, listProjects, etc.) that
 * depended on @operator/identify are stubbed as no-ops so the canvas still works
 * without that SDK wired up.
 */

// --- Cloud SDK stubs (replace with real integration when ready) ---
const ensureFolderPath = async (_parts: string[]): Promise<number> => 0;
const uploadToStorage = async (_file: File, _opts?: any): Promise<any> => null;
const listProjects = async (): Promise<any> => ({ projects: [] });
const createProject = async (_name: string, _opts?: any): Promise<any> => ({ project: null });
const updateProject = async (_id: number, _data: any): Promise<void> => {};
const deleteProject = async (_id: number): Promise<void> => {};


const DEPLOY_LOGS = [
  "> Dusting off drums...",
  "> Rigging stage lights...",
  "> Booting feedback loops..."
];

function DeployLoader() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < DEPLOY_LOGS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-green-400 font-mono p-8 absolute inset-0 z-[100]">
      <div className="max-w-2xl w-full bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
          <i className="fa-solid fa-terminal text-gray-500"></i>
          <span className="text-gray-400 text-sm tracking-wider">STAGE.DEPLOYER</span>
        </div>
        <div className="space-y-3 min-h-[120px]">
          {DEPLOY_LOGS.slice(0, logIndex + 1).map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-sm md:text-base">
              <span className="text-amber-500">{log.split(' ')[0]}</span>
              <span className="text-gray-300">{log.split(' ').slice(1).join(' ')}</span>
              {i === logIndex && (
                <span className="w-2 h-4 bg-green-400 animate-pulse inline-block ml-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudioView() {

  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  // Placeholder for user — cloud features are stubbed, so this is null.
  // When Stagework provides auth context, wire it in here.
  const user: any = null;

  // --- Workspace State (Persistence) ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
      // If we arrived with a generated plan, build a fresh workspace for it
      if (plan && plan.blueprints) {
          const w = window.innerWidth;
          const isMobile = w < 768;
          const nodeWidth = isMobile ? Math.min(w - 40, 380) : 400;
          const nodeHeight = isMobile ? 320 : 400;
          const startX = (w / 2) - (nodeWidth / 2);
          const startY = 100;

          const nodes: CanvasNode[] = plan.blueprints.map((bp: any, index: number) => {
              return {
                  id: `blueprint-${bp.targetId}-${index}`,
                  type: 'text',
                  x: startX + (index * (nodeWidth + 40)), // Layout horizontally
                  y: startY,
                  width: nodeWidth,
                  height: nodeHeight,
                  title: `${bp.targetId} Blueprint`,
                  content: `# ${plan.projectTitle}\n\n**Description:** ${plan.projectDescription}\n\n## Wireframe\n${bp.wireframeDesc}\n\n## Features\n${bp.features.map((f: string) => `- ${f}`).join('\n')}`,
                  zIndex: index + 1
              };
          });

          return [
              {
                  id: 'generated-plan',
                  name: plan.projectTitle || 'Generated Project',
                  nodes,
                  edges: [],
                  messages: [],
                  lastModified: Date.now()
              }
          ];
      }

      // 1. Try to load from LocalStorage
      try {
          const saved = localStorage.getItem('NEST_STUDIO_WORKSPACES');
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed;
              }
          }
      } catch (e) {
          console.error("Failed to load saved workspaces:", e);
      }

      // 2. Fallback to Default (Responsive Welcome Node)
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;

      const nodeWidth = isMobile ? Math.min(w - 40, 380) : 500;
      const nodeHeight = isMobile ? 320 : 360;
      const x = (w / 2) - (nodeWidth / 2);
      const y = (h / 2) - (nodeHeight / 2) - (isMobile ? 20 : 50);

      return [
        {
            id: 'default',
            name: 'Main Board',
            nodes: [
              {
                  id: 'welcome',
                  type: 'text',
                  x: Math.max(20, x),
                  y: Math.max(20, y),
                  width: nodeWidth,
                  height: nodeHeight,
                  title: 'Welcome to Agentic Studio',
                  content: `# Quick start

This is your **Infinite Canvas** for intelligent collaboration.

**Try asking Nest for:**

- [ ] "Tic tac toe game in the style of Herge"
- [ ] "An image of a futuristic city on mars"
- [ ] "A personal project status tracker"


**Gestures:**
*Tap the mic to talk.*

- **Drag** empty space to pan
- **Pinch** to zoom
- **Drag nodes** to organize

*Everything you create lives here spatially.*`,
                  zIndex: 1
              }
            ],
            edges: [],
            messages: [],
            lastModified: Date.now()
        }
    ];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
      if (plan) return 'generated-plan';
      const savedId = localStorage.getItem('NEST_STUDIO_ACTIVE_ID');
      return savedId || 'default';
  });

  const [isWorkspacePanelOpen, setIsWorkspacePanelOpen] = useState(false);
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);

  // Clear plan from location state so it doesn't re-trigger on reload
  useEffect(() => {
    if (plan) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [plan, navigate, location.pathname]);

  // --- Cloud State ---
  const [isCloudSyncing, _setIsCloudSyncing] = useState(false);

  // --- Canvas State (Active Workspace) ---
  // Ensure we find the active workspace safely
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const [activeAgent, setActiveAgent] = useState<AgentId>(AgentId.NEST);
  const [nodes, setNodes] = useState<CanvasNode[]>(activeWorkspace.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(activeWorkspace.edges);
  const [messages, setMessages] = useState<Message[]>(activeWorkspace.messages || []);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [isThinking, setIsThinking] = useState(false);
  const [statusState, setStatusState] = useState<'idle' | 'thinking' | 'working' | 'listening' | 'routing'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [useStepRouting, setUseStepRouting] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);

  const handleDeployToStage = () => {
    setIsDeploying(true);
    setTimeout(() => {
      navigate('/stage', { state: { workspaces } });
    }, 4500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- History State ---
  const [history, setHistory] = useState<{nodes: CanvasNode[], edges: CanvasEdge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Init history on mount or workspace change
  useEffect(() => {
     if (history.length === 0) {
         setHistory([{ nodes: activeWorkspace.nodes, edges: activeWorkspace.edges }]);
     }
  }, [activeWorkspaceId]);

  // Theme Init
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    // Dispatch custom event to sync with App.tsx if needed
    window.dispatchEvent(new Event('themechange'));
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleThemeChange = () => {
        setIsDarkMode(localStorage.getItem('theme') !== 'light');
    };
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  // --- History Logic ---
  const addToHistory = (newNodes: CanvasNode[], newEdges: CanvasEdge[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      if (newHistory.length > 50) newHistory.shift(); // Limit history depth
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const state = history[newIndex];
          setNodes(state.nodes);
          setEdges(state.edges);
          setHistoryIndex(newIndex);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const state = history[newIndex];
          setNodes(state.nodes);
          setEdges(state.edges);
          setHistoryIndex(newIndex);
      }
  };

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  
  // --- Load workspaces from API ---
  useEffect(() => {
      if (!user) return;
      const loadFromAPI = async () => {
          try {
              const res = await listProjects();
              const projects = res.projects || res.data || res;
              if (Array.isArray(projects) && projects.length > 0) {
                  const mapped: Workspace[] = projects.map((p: any) => ({
                      id: String(p.id),
                      name: p.name,
                      nodes: p.settings?.nodes || [],
                      edges: p.settings?.edges || [],
                      messages: p.settings?.messages || [],
                      lastModified: new Date(p.updatedAt || p.createdAt).getTime(),
                      cloudId: p.id,
                  }));
                  setWorkspaces(mapped);
                  // Switch to first if current not found
                  if (!mapped.find(w => w.id === activeWorkspaceId)) {
                      const first = mapped[0];
                      setNodes(first.nodes);
                      setEdges(first.edges);
                      setMessages(first.messages || []);
                      setActiveWorkspaceId(first.id);
                      setHistory([{ nodes: first.nodes, edges: first.edges }]);
                      setHistoryIndex(0);
                  }
              }
          } catch (e) {
              console.warn('Failed to load projects from API, using localStorage fallback:', e);
          }
      };
      loadFromAPI();
  }, [user]);

  // --- Workspace Handlers ---

  const saveCurrentWorkspaceState = () => {
      setWorkspaces(prev => prev.map(ws =>
          ws.id === activeWorkspaceId
              ? { ...ws, nodes: nodes, edges: edges, messages: messages, lastModified: Date.now() }
              : ws
      ));
  };

  // Auto-save State (Debounced)
  useEffect(() => {
      const timer = setTimeout(() => {
          setWorkspaces(prev => prev.map(ws =>
            ws.id === activeWorkspaceId
                ? { ...ws, nodes, edges, messages, lastModified: Date.now() }
                : ws
          ));
      }, 1000);
      return () => clearTimeout(timer);
  }, [nodes, edges, messages, activeWorkspaceId]);

  // Persistence to LocalStorage (Whenever workspaces update)
  useEffect(() => {
      try {
          localStorage.setItem('NEST_STUDIO_WORKSPACES', JSON.stringify(workspaces));
          localStorage.setItem('NEST_STUDIO_ACTIVE_ID', activeWorkspaceId);
      } catch (e) {
          console.error("Failed to save to localStorage:", e);
      }
  }, [workspaces, activeWorkspaceId]);

  // Debounced save to API
  useEffect(() => {
      if (!user) return;
      const ws = workspaces.find(w => w.id === activeWorkspaceId);
      if (!ws || !ws.cloudId) return;
      const timer = setTimeout(async () => {
          try {
              await updateProject(ws.cloudId!, {
                  name: ws.name,
                  settings: { nodes: ws.nodes, edges: ws.edges, messages: ws.messages },
              });
          } catch (e) {
              console.warn('API save failed:', e);
          }
      }, 5000);
      return () => clearTimeout(timer);
  }, [workspaces, activeWorkspaceId, user]);


  const handleSwitchWorkspace = async (id: string) => {
      if (id === activeWorkspaceId) return;

      const target = workspaces.find(w => w.id === id);
      if (!target) return;

      setIsSwitchingWorkspace(true);
      setStatusState('routing');
      setStatusMessage(`Loading ${target.name}...`);

      await new Promise(resolve => setTimeout(resolve, 300));

      saveCurrentWorkspaceState();
      setNodes(target.nodes);
      setEdges(target.edges);
      setMessages(target.messages || []);

      // Reset history for new workspace
      setHistory([{ nodes: target.nodes, edges: target.edges }]);
      setHistoryIndex(0);

      setActiveWorkspaceId(id);
      setIsWorkspacePanelOpen(false);

      setTimeout(() => {
          setIsSwitchingWorkspace(false);
          setStatusState('idle');
          setStatusMessage('');
      }, 100);
  };

  const handleCreateWorkspace = async () => {
      setIsSwitchingWorkspace(true);
      setStatusState('working');
      setStatusMessage('Creating Canvas...');

      await new Promise(resolve => setTimeout(resolve, 300));

      saveCurrentWorkspaceState();

      const newName = `Canvas ${workspaces.length + 1}`;
      let newId = `ws-${Date.now()}`;
      let cloudId: number | undefined;

      // Create in API if signed in
      if (user) {
          try {
              const res = await createProject(newName, { settings: { nodes: [], edges: [], messages: [] } });
              const project = res.project || res;
              if (project?.id) {
                  newId = String(project.id);
                  cloudId = project.id;
              }
          } catch (e) {
              console.warn('API project creation failed, using local:', e);
          }
      }

      const newWorkspace: Workspace = {
          id: newId,
          name: newName,
          nodes: [],
          edges: [],
          messages: [],
          lastModified: Date.now(),
          cloudId,
      };

      setWorkspaces(prev => [...prev, newWorkspace]);
      setNodes([]);
      setEdges([]);
      setMessages([]);

      // Reset history
      setHistory([{ nodes: [], edges: [] }]);
      setHistoryIndex(0);

      setActiveWorkspaceId(newId);
      setIsWorkspacePanelOpen(false);

      setTimeout(() => {
          setIsSwitchingWorkspace(false);
          setStatusState('idle');
          setStatusMessage('');
      }, 100);
  };

  const handleDeleteWorkspace = async (id: string) => {
      if (workspaces.length <= 1) return;

      const isDeletingActive = id === activeWorkspaceId;
      const ws = workspaces.find(w => w.id === id);

      if (isDeletingActive) {
          setIsSwitchingWorkspace(true);
          setStatusState('working');
          setStatusMessage('Removing...');
          await new Promise(r => setTimeout(r, 300));
      }

      // Delete from API if signed in
      if (user && ws?.cloudId) {
          try { await deleteProject(ws.cloudId); } catch (e) { console.warn('API delete failed:', e); }
      }

      const newWorkspaces = workspaces.filter(w => w.id !== id);
      setWorkspaces(newWorkspaces);

      if (isDeletingActive) {
          const next = newWorkspaces[0];
          setNodes(next.nodes);
          setEdges(next.edges);
          setMessages(next.messages || []);

          // Reset history
          setHistory([{ nodes: next.nodes, edges: next.edges }]);
          setHistoryIndex(0);

          setActiveWorkspaceId(next.id);

          setTimeout(() => {
              setIsSwitchingWorkspace(false);
              setStatusState('idle');
              setStatusMessage('');
          }, 100);
      }
  };

  const handleRenameWorkspace = (id: string, name: string) => {
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name } : w));
      // Sync rename to API
      const ws = workspaces.find(w => w.id === id);
      if (user && ws?.cloudId) {
          updateProject(ws.cloudId, { name }).catch(e => console.warn('API rename failed:', e));
      }
  };


  // --- Canvas Handlers ---
    const handleNodeMove = (id: string, x: number, y: number, deltaX: number, deltaY: number) => {
      let newNodes = nodes;
      
      // Helper to get all descendant IDs of a node
      const getDescendants = (parentId: string): string[] => {
          const children = nodes.filter(n => n.parentId === parentId).map(n => n.id);
          let all = [...children];
          children.forEach(childId => {
              all = [...all, ...getDescendants(childId)];
          });
          return all;
      };

      const movingIds = new Set<string>();
      
      if (selectedNodeIds.has(id) && selectedNodeIds.size > 1) {
          selectedNodeIds.forEach(selectedId => {
              movingIds.add(selectedId);
              getDescendants(selectedId).forEach(descId => movingIds.add(descId));
          });
      } else {
          movingIds.add(id);
          getDescendants(id).forEach(descId => movingIds.add(descId));
      }

      newNodes = nodes.map(n => {
          if (movingIds.has(n.id)) {
              if (n.id === id) {
                  return { ...n, x, y };
              }
              return { ...n, x: n.x + deltaX, y: n.y + deltaY };
          }
          return n;
      });

      setNodes(newNodes);
      addToHistory(newNodes, edges);
  };

  const handleNodeSelect = (idOrIds: string | string[], multi: boolean = false) => {
      let ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      
      const getDescendants = (parentId: string): string[] => {
          const children = nodes.filter(n => n.parentId === parentId).map(n => n.id);
          let all = [...children];
          children.forEach(childId => {
              all = [...all, ...getDescendants(childId)];
          });
          return all;
      };

      // Expand selection to include all descendants
      const expandedIds = new Set<string>();
      ids.forEach(id => {
          expandedIds.add(id);
          getDescendants(id).forEach(descId => expandedIds.add(descId));
      });
      ids = Array.from(expandedIds);

      if (multi) {
          setSelectedNodeIds(prev => {
              const next = new Set(prev);
              ids.forEach(id => {
                  if (next.has(id)) {
                      next.delete(id);
                  } else {
                      next.add(id);
                  }
              });
              return next;
          });
      } else {
          setActiveNodeId(ids[0] || null);
          setSelectedNodeIds(new Set(ids));
      }

      setNodes(prev => {
          const maxZ = Math.max(...prev.map(n => n.zIndex));
          return prev.map(n => ids.includes(n.id) ? { ...n, zIndex: maxZ + 1 } : n);
      });
  };

  const handleRunCanvas = async () => {
      setStatusState('working');
      setStatusMessage('Executing canvas...');
      
      const onStatusUpdate = (nodeId: string, status: 'idle' | 'running' | 'success' | 'error' | 'skipped', data?: any, error?: string) => {
          setNodes(prev => prev.map(n => n.id === nodeId ? { 
              ...n, 
              executionState: status, 
              executionData: data, 
              executionError: error 
          } : n));
      };

      await executeGraph(nodes, edges, onStatusUpdate);
      
      setStatusState('idle');
      setStatusMessage('');
  };

  
  // --- Copy / Paste Logic ---
  const [copiedNode, setCopiedNode] = useState<CanvasNode | null>(null);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

          if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
              if (activeNodeId) {
                  const nodeToCopy = nodes.find(n => n.id === activeNodeId);
                  if (nodeToCopy) {
                      setCopiedNode(nodeToCopy);
                  }
              }
          } else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
              if (copiedNode) {
                  const newNode = {
                      ...copiedNode,
                      id: `node-${Date.now()}`,
                      x: copiedNode.x + 50,
                      y: copiedNode.y + 50,
                      zIndex: Math.max(...nodes.map(n => n.zIndex || 0), 0) + 1
                  };
                  setNodes(prev => {
                      const updated = [...prev, newNode];
                      addToHistory(updated, edges);
                      return updated;
                  });
                  setActiveNodeId(newNode.id);
              }
          } else if ((e.key === 'Backspace' || e.key === 'Delete') && activeNodeId) {
              handleNodeDelete(activeNodeId);
          }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, activeNodeId, copiedNode]);

  const handleNodeUpdate = (id: string, updates: Partial<CanvasNode>) => {
      const newNodes = nodes.map(n => n.id === id ? { ...n, ...updates } : n);
      setNodes(newNodes);

      // Only record history for geometric changes (resize) to prevent typing lag
      const keys = Object.keys(updates);
      const isGeometric = keys.includes('width') || keys.includes('height') || keys.includes('x') || keys.includes('y');

      if (isGeometric) {
          addToHistory(newNodes, edges);
      }
  };

  const handleNodeDelete = (id: string) => {
      const newNodes = nodes.filter(n => n.id !== id);
      const newEdges = edges.filter(e => e.fromNode !== id && e.toNode !== id);
      setNodes(newNodes);
      setEdges(newEdges);
      addToHistory(newNodes, newEdges);
  };

    const handleGroupNodes = () => {
      if (selectedNodeIds.size < 2) return;

      const selectedNodes = nodes.filter(n => selectedNodeIds.has(n.id));
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      selectedNodes.forEach(n => {
          if (n.x < minX) minX = n.x;
          if (n.y < minY) minY = n.y;
          if (n.x + n.width > maxX) maxX = n.x + n.width;
          if (n.y + n.height > maxY) maxY = n.y + n.height;
      });

      const padding = 40;
      const groupId = 'node_' + Date.now();
      const groupNode: CanvasNode = {
          id: groupId,
          type: 'group',
          title: 'Group',
          content: '',
          x: minX - padding,
          y: minY - padding,
          width: (maxX - minX) + padding * 2,
          height: (maxY - minY) + padding * 2,
          zIndex: 0,
      };

      const newNodes = [
          groupNode,
          ...nodes.map(n => selectedNodeIds.has(n.id) ? { ...n, parentId: groupId } : n)
      ];

      setNodes(newNodes);
      setSelectedNodeIds(new Set([groupId]));
      setActiveNodeId(groupId);
      addToHistory(newNodes, edges);
  };

  const handleUngroupNode = (groupId: string) => {
      const newNodes = nodes.filter(n => n.id !== groupId).map(n => {
          if (n.parentId === groupId) {
              const { parentId, ...rest } = n;
              return rest;
          }
          return n;
      });
      setNodes(newNodes);
      setSelectedNodeIds(new Set());
      setActiveNodeId(null);
      addToHistory(newNodes, edges);
  };

  const handleDuplicateNode = (id: string) => {
      const node = nodes.find(n => n.id === id);
      if (!node) return;

      const maxZ = Math.max(...nodes.map(n => n.zIndex), 0);
      const newNode = {
          ...node,
          id: Date.now().toString(),
          x: node.x + 50,
          y: node.y + 50,
          zIndex: maxZ + 1,
          title: `${node.title} (Copy)`
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setActiveNodeId(newNode.id);
      addToHistory(newNodes, edges);
  };

  const handleAddNode = (type: NodeType, x: number, y: number) => {
      const newNodeId = Date.now().toString();
      const maxZ = nodes.length > 0 ? Math.max(...nodes.map(n => n.zIndex)) : 0;

      const newNode: CanvasNode = {
          id: newNodeId,
          type,
          x,
          y,
          width: 400,
          height: 300,
          title: 'New Node',
          content: '',
          zIndex: maxZ + 1
      };

      if (type === 'text') {
          newNode.title = 'Note';
          newNode.content = '## New Note\n\nDouble-click to edit text.';
          newNode.height = 240;
      } else if (type === 'code') {
          newNode.title = 'script.js';
          newNode.content = '// Write your code here\nconsole.log("Hello World");';
          newNode.language = 'javascript';
          newNode.files = {
              'script.js': { name: 'script.js', content: newNode.content, language: 'javascript' }
          };
          newNode.activeFile = 'script.js';
          newNode.width = 500;
          newNode.height = 400;
      } else if (type === 'image') {
          newNode.title = 'Image Placeholder';
          newNode.content = 'https://placehold.co/600x600/1a1a1a/ffffff?text=Image+Placeholder';
          newNode.width = 300;
          newNode.height = 300;
      } else if (type === 'video') {
          newNode.title = 'Video Placeholder';
          newNode.content = '';
          newNode.width = 480;
          newNode.height = 270;
      } else if (type === 'website') {
          newNode.title = 'Website Embed';
          newNode.content = '';
          newNode.width = 600;
          newNode.height = 400;
      } else if (type === 'terminal') {
          newNode.title = 'Terminal';
          newNode.content = 'agent@forge:~$ ';
          newNode.width = 500;
          newNode.height = 300;
      } else if (type === 'api') {
          newNode.title = 'API Request';
          newNode.content = '{"method":"GET","url":"https://api.github.com/users/octocat","headers":"{\\n  \\"Accept\\": \\"application/json\\"\\n}","body":""}';
          newNode.width = 450;
          newNode.height = 350;
      }

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setActiveNodeId(newNodeId);
      addToHistory(newNodes, edges);
  };

  const handleFileUpload = async (file: File, x: number, y: number) => {
    const newNodeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Determine type
    let type: NodeType = 'text';
    let content = '';
    let title = file.name;
    let language = '';

    if (file.type.startsWith('image/')) {
        type = 'image';
        content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    } else if (file.type.startsWith('video/')) {
        type = 'video';
         content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    } else if (file.type.startsWith('text/') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext || '')) {
            type = 'code';
            language = ext || 'text';
        } else {
            type = 'text';
        }

        content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsText(file);
        });
    } else {
         content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsText(file);
        });
    }

    // Cloud Upload via SDK
    let cloudId: number | undefined;
    if (user) {
        try {
            const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
            const folderParts = currentWs
                ? ['_weaver-online', 'projects', currentWs.name, 'uploads']
                : ['_weaver-online', 'unsorted'];
            setStatusMessage(`Uploading ${file.name}...`);
            const folderId = await ensureFolderPath(folderParts);
            const uploaded = await uploadToStorage(file, { parentId: folderId });
            cloudId = uploaded?.id || uploaded?.fileEntry?.id;
            setStatusMessage('');
        } catch (e) {
            console.warn('Cloud upload failed:', e);
            setStatusMessage('');
        }
    }

    const maxZ = nodes.length > 0 ? Math.max(...nodes.map(n => n.zIndex)) : 0;

    const newNode: CanvasNode = {
        id: newNodeId,
        type,
        x,
        y,
        width: type === 'image' || type === 'video' ? 400 : 500,
        height: type === 'image' || type === 'video' ? 300 : 400,
        title,
        content,
        zIndex: maxZ + 1,
        cloudId,
        language,
        files: type === 'code' ? { [file.name]: { name: file.name, content, language: language || 'txt' } } : undefined,
        activeFile: type === 'code' ? file.name : undefined
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setActiveNodeId(newNodeId);
    addToHistory(newNodes, edges);
  };

  const handleOmniBarUpload = (file: File) => {
    // Default upload position near center/top-left of view or relative to active node
    let targetX = 100;
    let targetY = 100;

    if (activeNodeId) {
        const n = nodes.find(n => n.id === activeNodeId);
        if (n) {
            targetX = n.x + 50;
            targetY = n.y + 50;
        }
    } else if (nodes.length > 0) {
        // Fallback to near first node
        targetX = nodes[0].x + 50;
        targetY = nodes[0].y + 50;
    }

    handleFileUpload(file, targetX, targetY);
  };

  const handleConnect = (fromNode: string, fromSide: HandleSide, toNode: string, toSide: HandleSide) => {
      if (fromNode === toNode) return;

      const exists = edges.some(e => e.fromNode === fromNode && e.toNode === toNode && e.fromSide === fromSide && e.toSide === toSide);
      if (exists) return;

      const newEdge: CanvasEdge = {
          id: `${fromNode}-${fromSide}-${toNode}-${toSide}-${Date.now()}`,
          fromNode,
          fromSide,
          toNode,
          toSide
      };

      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      addToHistory(nodes, newEdges);
  };

  const handleEdgeDelete = (id: string) => {
      const newEdges = edges.filter(e => e.id !== id);
      setEdges(newEdges);
      addToHistory(nodes, newEdges);
  };

  const executeUICommands = (commands: any[]) => {
      
      if (!commands || commands.length === 0) return;

      commands.forEach(cmd => {
          const { command, args } = cmd;
          

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          switch (command) {
              case 'create_node':
                  const type = args.type || 'text';
                  const newNodeId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

                  // Use functional update to avoid stale nodes length
                  setNodes(prev => {
                      const shift = (prev.length % 5) * 20;
                      const maxZ = prev.length > 0 ? Math.max(...prev.map(n => n.zIndex)) : 0;

                      const newNode: CanvasNode = {
                          id: newNodeId,
                          type: type as any,
                          x: centerX - 250 + shift,
                          y: centerY - 150 + shift,
                          width: 500,
                          height: 400,
                          title: args.title || 'New Node',
                          content: args.content || '',
                          zIndex: maxZ + 1
                      };
                      return [...prev, newNode];
                  });

                  setActiveNodeId(newNodeId);
                  break;

              case 'update_node':
                  if (args.id) {
                      setNodes(prev => prev.map(n => n.id === args.id ? { ...n, ...args } : n));
                  }
                  break;

              case 'delete_node':
                  if (args.id) {
                      handleNodeDelete(args.id);
                  }
                  break;

              case 'clear':
                  setNodes([]);
                  setEdges([]);
                  break;
          }
      });
  };

  // Project Management (JSON)
  const handleSaveProject = () => {
    const projectData = {
        workspaces,
        version: 2
    };
    const data = JSON.stringify(projectData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentic-studio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsControlPanelOpen(false);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);

            if (json.workspaces && Array.isArray(json.workspaces)) {
                setWorkspaces(json.workspaces);
                if (json.workspaces.length > 0) {
                    const first = json.workspaces[0];
                    setNodes(first.nodes);
                    setEdges(first.edges);
                    setMessages(first.messages || []);
                    setActiveWorkspaceId(first.id);
                    setHistory([{ nodes: first.nodes, edges: first.edges }]);
                    setHistoryIndex(0);
                }
            } else if (Array.isArray(json)) {
                const legacyWs = { id: 'legacy', name: 'Imported', nodes: json, edges: [], messages: [], lastModified: Date.now() };
                setWorkspaces([legacyWs]);
                setNodes(json);
                setEdges([]);
                setMessages([]);
                setActiveWorkspaceId('legacy');
                setHistory([{ nodes: json, edges: [] }]);
                setHistoryIndex(0);
            } else if (json.nodes) {
                const legacyWs = { id: 'legacy', name: 'Imported', nodes: json.nodes, edges: json.edges || [], messages: [], lastModified: Date.now() };
                setWorkspaces([legacyWs]);
                setNodes(json.nodes);
                setEdges(json.edges || []);
                setMessages([]);
                setActiveWorkspaceId('legacy');
                setHistory([{ nodes: json.nodes, edges: json.edges || [] }]);
                setHistoryIndex(0);
            } else {
                alert('Invalid project file');
            }
        } catch (err) {
            console.error('Error parsing project file:', err);
            alert('Failed to load project');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
    setIsControlPanelOpen(false);
  };

  // Computed Context for Agents
  const activeNodeContext = useMemo(() => {
      if (!activeNodeId) return '';
      const node = nodes.find(n => n.id === activeNodeId);
      if (!node) return '';

      let context = `\n\n--- ACTIVE NODE CONTEXT (User is referencing this) ---\n`;
      context += `ID: ${node.id}\n`;
      context += `Title: ${node.title}\n`;
      context += `Type: ${node.type}\n`;
      if (node.type === 'image') {
          context += `Content: [Image Data Available]\n`;
      } else if (node.type === 'video') {
          context += `Content: [Video Data Available]\n`;
      } else {
          context += `Content:\n${node.content}\n`;
      }

      if (node.type === 'code' && node.files) {
         Object.values(node.files).forEach((f: CanvasFile) => {
             context += `File '${f.name}' (${f.language}):\n${f.content}\n`;
         });
      }

      const connectedEdges = edges.filter(e => e.fromNode === node.id || e.toNode === node.id);
      if (connectedEdges.length > 0) {
          context += `\n--- CONNECTED NODES (You can reference these using [[node:ID|Title]]) ---\n`;
          connectedEdges.forEach(e => {
              const isSource = e.fromNode === node.id;
              const otherId = isSource ? e.toNode : e.fromNode;
              const other = nodes.find(n => n.id === otherId);
              if (other) {
                  context += `- ${isSource ? 'Out to' : 'In from'} "${other.title}" (ID: ${other.id}, Type: ${other.type})\n`;
              }
          });
      }
      context += `--- END CONTEXT ---\n`;
      return context;
  }, [activeNodeId, nodes, edges]);

  // Referenced Nodes for OmniBar (Active + Connected)
  const referencedNodes = useMemo(() => {
      if (!activeNodeId) return [];
      const active = nodes.find(n => n.id === activeNodeId);
      if (!active) return [];

      const refs = [active];

      edges.forEach(e => {
          if (e.fromNode === activeNodeId) {
              const other = nodes.find(n => n.id === e.toNode);
              if (other && !refs.find(r => r.id === other.id)) refs.push(other);
          } else if (e.toNode === activeNodeId) {
               const other = nodes.find(n => n.id === e.fromNode);
              if (other && !refs.find(r => r.id === other.id)) refs.push(other);
          }
      });

      return refs;
  }, [activeNodeId, nodes, edges]);

  // Main Interaction Logic
  const handleSend = async (text: string, mediaOptions?: ImageConfig | VideoConfig) => {
      const userMsg: Message = {
          id: Date.now().toString(),
          type: MessageType.USER,
          content: text,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsThinking(true);
      if (!showChat) setShowChat(true);

      const currentMessages = [...messages, userMsg];
      await runAIProcessing(text, currentMessages, mediaOptions);
  };

  const handleRetry = async () => {
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === MessageType.USER) {
            lastUserIndex = i;
            break;
        }
    }

    if (lastUserIndex === -1) return;

    const userMsg = messages[lastUserIndex];
    const previousMessages = messages.slice(0, lastUserIndex + 1);

    setMessages(previousMessages);
    setIsThinking(true);
    if (!showChat) setShowChat(true);

    await runAIProcessing(userMsg.content, previousMessages);
  };

  const handleClearChat = () => {
      setMessages([]);
      saveCurrentWorkspaceState();
  };

  const runAIProcessing = async (text: string, currentHistory: Message[], explicitMediaOptions?: ImageConfig | VideoConfig) => {
      const promptWithContext = activeNodeContext ? `${activeNodeContext}\n\nUser Request: ${text}` : text;

      // Detect if we have a visual reference (Active Image)
      const visualReferenceNode = activeNodeId
          ? nodes.find(n => n.id === activeNodeId && (n.type === 'image'))
          : null;

      // Extract image context if available for multimodal requests
      let imageContext: string | undefined = undefined;
      if (visualReferenceNode?.content?.startsWith('data:')) {
          imageContext = visualReferenceNode.content;
      }

      try {
          setStatusState('routing');
          setStatusMessage('Routing...');

          const historyData = currentHistory.slice(0, -1).map(m => ({
              role: m.type === MessageType.USER ? 'user' : 'model',
              parts: [{ text: m.content }]
          }));

          const routingResult = await AI.route(promptWithContext, historyData, imageContext);
          const { targetAgentId, reasoning, artifact } = routingResult;

          if (targetAgentId !== activeAgent) {
              setActiveAgent(targetAgentId);
              setStatusMessage(`Switching to ${AGENTS[targetAgentId].name}...`);
              await new Promise(r => setTimeout(r, 400));
          }

          setStatusState('working');
          const actionMap: Record<string, string> = {
              [AgentId.NEST]: "Thinking...",
              [AgentId.CODE]: "Coding...",
              [AgentId.CREATIVE]: "Writing...",
              [AgentId.IMAGE]: "Dreaming...",
              [AgentId.VIDEO]: "Directing...",
              [AgentId.PRO]: "Reasoning...",
          };
          setStatusMessage(actionMap[targetAgentId] || "Working...");

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const shift = (nodes.length % 5) * 20;

          const uploadToCloud = async (blob: Blob, name: string) => {
              if (!user) return null;
              try {
                  const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
                  const folderParts = currentWs
                      ? ['_weaver-online', 'projects', currentWs.name, 'generated']
                      : ['_weaver-online', 'unsorted'];
                  setStatusMessage("Syncing to cloud...");
                  const folderId = await ensureFolderPath(folderParts);
                  const file = new File([blob], name, { type: blob.type });
                  const uploaded = await uploadToStorage(file, { parentId: folderId });
                  return uploaded?.fileEntry || uploaded;
              } catch (e) {
                  console.warn('Cloud upload failed:', e);
                  return null;
              }
          };

          // --- ARTIFACT GENERATION (Create or Update) ---
          if (artifact && (artifact.operation === 'create' || (artifact.operation === 'update' && artifact.id))) {
              const isUpdate = artifact.operation === 'update' && artifact.id;
              const targetNodeId = isUpdate ? artifact.id! : Date.now().toString();
              const isCode = artifact.type === 'code';

              // Ensure we always have a title to prevent "undefined" in UI
              let finalTitle = artifact.title;
              if (!finalTitle || finalTitle.toLowerCase() === 'untitled') {
                  if (artifact.type === 'code') {
                      finalTitle = 'index.html';
                  } else {
                      const cleanPrompt = text.replace(/^(create|make|generate|write|draw|design)\s+(a|an|the)\s+/i, '')
                                                  .replace(/^(create|make|generate|write|draw|design)\s+/i, '');
                      finalTitle = cleanPrompt.split('\n')[0].substring(0, 25).trim();
                      if (finalTitle) {
                          finalTitle = finalTitle.charAt(0).toUpperCase() + finalTitle.slice(1);
                      } else {
                          finalTitle = 'New Artifact';
                      }
                  }
              }

              const conversationalMsgId = (Date.now() + 1).toString();
              const conversationalContent = isUpdate
                ? `I'll update **${finalTitle}** for you based on your request.`
                : `I've started working on **${finalTitle}**.`;

              setMessages(prev => [...prev, {
                  id: conversationalMsgId,
                  type: MessageType.AGENT,
                  agentId: targetAgentId,
                  content: conversationalContent,
                  timestamp: Date.now(),
                  thoughtProcess: reasoning
              }]);

              const toolMsgId = (Date.now() + 2).toString();
              setMessages(prev => [...prev, {
                  id: toolMsgId,
                  type: MessageType.AGENT,
                  agentId: targetAgentId,
                  content: `:::LOG::: **Task Started**\n\n[[node:${targetNodeId}|${isUpdate ? 'Updating Node' : 'Creating Node'}]]...`,
                  timestamp: Date.now() + 1
              }]);


              // CREATE: Setup new node if needed
              if (!isUpdate) {
                  const getDimensions = (type: string, ratioStr?: string) => {
                        const baseW = 500;
                        let ratio = 1;
                        if (ratioStr) {
                            const [w, h] = ratioStr.split(':').map(Number);
                            if (w && h) ratio = w / h;
                        } else if (type === 'video') {
                            ratio = 16/9;
                        }

                        let w = baseW;
                        if (ratio < 1) w = 350;
                        return { width: w, height: w / ratio };
                  };

                  const dims = getDimensions(artifact.type, (explicitMediaOptions as ImageConfig)?.aspectRatio || artifact.aspectRatio);

                  const newNode: CanvasNode = {
                      id: targetNodeId,
                      type: artifact.type as any,
                      x: centerX - (dims.width/2) + shift,
                      y: centerY - (dims.height/2) + shift,
                      width: dims.width,
                      height: dims.height,
                      title: finalTitle,
                      content: '',
                      files: isCode ? {} : undefined,
                      activeFile: undefined,
                      language: artifact.language,
                      zIndex: 100
                  };

                  if (artifact.type === 'image') newNode.content = 'loading://image';
                  if (artifact.type === 'video') newNode.content = 'loading://video';

                  setNodes(prev => [...prev, newNode]);
                  setActiveNodeId(targetNodeId);
              } else if (artifact.type === 'image' || artifact.type === 'video') {
                  setNodes(prev => prev.map(n =>
                      n.id === targetNodeId
                      ? { ...n, content: artifact.type === 'image' ? 'loading://image' : 'loading://video' }
                      : n
                  ));
              }

              // Save snapshot to history BEFORE AI starts mutating state heavily
              addToHistory(nodes, edges);

              // MEDIA GENERATION
              if (artifact.type === 'image' || artifact.type === 'video') {
                   const isImage = artifact.type === 'image';
                   setStatusMessage(isImage ? "Generating Image..." : "Rendering Video...");

                   setMessages(prev => prev.map(m => m.id === toolMsgId ? { ...m, content: m.content + `\n- Generating ${isImage ? 'visuals' : 'motion'}...` } : m));

                   const refImage = visualReferenceNode?.content;
                   const currentNode = nodes.find(n => n.id === targetNodeId);
                   const targetNodeContent = (currentNode && !currentNode.content.startsWith('loading://')) ? currentNode.content : undefined;
                   const effectiveRef = targetNodeContent || refImage;

                   const imgOpts: ImageOptions = {
                       aspectRatio: (explicitMediaOptions as ImageConfig)?.aspectRatio || (artifact.aspectRatio as any) || '1:1',
                       size: (explicitMediaOptions as ImageConfig)?.size || (artifact.quality as any) || '1K'
                   };

                   const vidOpts: VideoOptions = {
                       aspectRatio: (explicitMediaOptions as VideoConfig)?.aspectRatio || (artifact.aspectRatio as any) || '16:9',
                       resolution: (explicitMediaOptions as VideoConfig)?.resolution || (artifact.quality as any) || '720p'
                   };

                   const url = await (isImage
                       ? AI.generateImage(promptWithContext, imgOpts, effectiveRef)
                       : AI.generateVideo(promptWithContext, vidOpts, effectiveRef)
                   );

                   let blob: Blob;
                   if (url.startsWith('blob:') || url.startsWith('data:')) {
                       const resp = await fetch(url);
                       blob = await resp.blob();
                   } else {
                       blob = new Blob([]);
                   }

                   const cloudEntry = await uploadToCloud(blob, `${isImage ? 'image' : 'video'}-${Date.now()}.${isImage ? 'png' : 'mp4'}`);

                   setNodes(prev => prev.map(n => n.id === targetNodeId ? { ...n, content: url, cloudId: cloudEntry?.id } : n));

                   setMessages(prev => prev.map(m => {
                      if (m.id !== toolMsgId) return m;
                      return {
                          ...m,
                          content: m.content + `\n- **Complete.**`,
                          attachments: [{ type: isImage?'image':'video', url }]
                      };
                   }));

                   // Execute any UI commands
                   const cmds = AI.getLastUICommands();
                   executeUICommands(cmds);

              }
              // TEXT / CODE GENERATION
              else {
                  // Pass imageContext to text stream if available (for multimodal understanding)
                  const stream = AI.streamResponse(targetAgentId, promptWithContext, historyData, true, artifact.language, imageContext);

                  // Local tracking variables for stream accumulation
                  let currentFile = finalTitle;
                  let buffer = '';
                  let isFirstFile = true;
                  const fileBuffers: Record<string, string> = {};
                  let textBuffer = '';

                  // Initialize context for code update if needed
                  if (isUpdate && isCode) {
                      const existingNode = nodes.find(n => n.id === targetNodeId);
                      if (existingNode && existingNode.activeFile) {
                          currentFile = existingNode.activeFile;
                          isFirstFile = false;
                      }
                  }

                  // Update log to show start
                  setMessages(prev => prev.map(m => m.id === toolMsgId ? { ...m, content: m.content + `\n- Streaming content...` } : m));

                  for await (const chunk of stream) {
                      if (isCode) {
                          buffer += chunk;

                          // Improved Parsing: Loop through multiple markers in single chunk
                          while (true) {
                              const match = buffer.match(/### FILE: ([\w.-]+)/);
                              if (!match) break;

                              const [fullMatch, newFileName] = match;
                              const splitIndex = match.index!;
                              const contentBefore = buffer.substring(0, splitIndex);

                              if (contentBefore) {
                                  // Append content to current file buffer
                                  if (!fileBuffers[currentFile]) fileBuffers[currentFile] = '';
                                  fileBuffers[currentFile] += contentBefore;

                                  // Update state with accumulated buffer (overwrite)
                                  if (!isFirstFile) {
                                      setNodes(prevNodes => prevNodes.map(node => {
                                          if (node.id !== targetNodeId) return node;
                                          const currentFiles = node.files || {};
                                          const activeF = currentFiles[currentFile] || { name: currentFile, language: 'txt' };
                                          return {
                                              ...node,
                                              files: {
                                                  ...currentFiles,
                                                  [currentFile]: { ...activeF, content: fileBuffers[currentFile] }
                                              }
                                          };
                                      }));
                                  }
                              }

                              // Switch to new file
                              currentFile = newFileName.trim();
                              isFirstFile = false;
                              buffer = buffer.substring(splitIndex + fullMatch.length);

                              // Log file switch
                              setMessages(prev => prev.map(m => {
                                  if (m.id !== toolMsgId) return m;
                                  if (!m.content.includes(currentFile)) {
                                      return { ...m, content: m.content + `\n- Writing **${currentFile}**...` };
                                  }
                                  return m;
                              }));
                              setStatusMessage(`Writing ${currentFile}...`);

                              // Initialize new file in state (with empty content initially)
                              if (!fileBuffers[currentFile]) fileBuffers[currentFile] = '';
                              setNodes(prevNodes => prevNodes.map(node => {
                                  if (node.id !== targetNodeId) return node;
                                  const existingFile = node.files?.[currentFile];
                                  return {
                                      ...node,
                                      activeFile: currentFile,
                                      files: {
                                          ...node.files,
                                          [currentFile]: existingFile || {
                                              name: currentFile,
                                              content: '',
                                              language: currentFile.split('.').pop() || 'txt'
                                          }
                                      }
                                  };
                              }));
                          }

                          // Flush remaining buffer if it's not a partial marker
                          if (!isFirstFile && buffer) {
                              if (!/(#|# |##|###|###\s|###\sF|###\sFI|###\sFIL|###\sFILE|###\sFILE:)$/.test(buffer)) {
                                  const contentToFlush = buffer;
                                  buffer = '';
                                  if (!fileBuffers[currentFile]) fileBuffers[currentFile] = '';
                                  fileBuffers[currentFile] += contentToFlush;

                                  setNodes(prevNodes => prevNodes.map(node => {
                                      if (node.id !== targetNodeId) return node;
                                      const currentFiles = node.files || {};
                                      const activeF = currentFiles[currentFile] || { name: currentFile, language: 'txt' };
                                      return {
                                          ...node,
                                          files: {
                                              ...currentFiles,
                                              [currentFile]: { ...activeF, content: fileBuffers[currentFile] }
                                          }
                                      };
                                  }));
                              }
                          }

                      } else {
                          // TEXT MODE: Accumulate and Overwrite
                          textBuffer += chunk;
                          setNodes(prevNodes => prevNodes.map(node => {
                                if (node.id !== targetNodeId) return node;
                                return { ...node, content: textBuffer };
                          }));
                      }
                  }

                  // Flush remaining buffer at end of stream for Code
                  if (isCode && buffer && !isFirstFile) {
                       if (!fileBuffers[currentFile]) fileBuffers[currentFile] = '';
                       fileBuffers[currentFile] += buffer;

                       setNodes(prevNodes => prevNodes.map(node => {
                          if (node.id !== targetNodeId) return node;
                          const currentFiles = node.files || {};
                          const activeF = currentFiles[currentFile] || { name: currentFile, language: 'txt' };
                          return {
                              ...node,
                              files: {
                                  ...currentFiles,
                                  [currentFile]: { ...activeF, content: fileBuffers[currentFile] }
                              }
                          };
                      }));
                  }

                  // Cloud Sync via SDK
                  if (user && finalTitle) {
                     const contentToUpload = isCode ? (fileBuffers[currentFile] || buffer) : textBuffer;
                     const blob = new Blob([contentToUpload || "Generated Content"], { type: 'text/plain' });
                     await uploadToCloud(blob, finalTitle);
                  }

                   setMessages(prev => prev.map(m => {
                      if (m.id !== toolMsgId) return m;
                      return { ...m, content: m.content + "\n\n**Complete.**" };
                  }));

                  // Execute any UI commands (e.g., node organization)
                  const cmds = AI.getLastUICommands();
                  executeUICommands(cmds);
              }

          }
          // CHAT ONLY
          else {
              const responseMsgId = (Date.now() + 1).toString();
              setMessages(prev => [...prev, {
                  id: responseMsgId,
                  type: MessageType.AGENT,
                  agentId: targetAgentId,
                  content: '',
                  timestamp: Date.now(),
                  thoughtProcess: reasoning
              }]);

              // Pass image context to chat stream if available
              const stream = AI.streamResponse(targetAgentId, promptWithContext, historyData, false, '', imageContext);
              let content = '';
              for await (const chunk of stream) {
                  content += chunk;
                  setMessages(prev => prev.map(m =>
                      m.id === responseMsgId ? { ...m, content: content } : m
                  ));
              }

              // Execute any UI commands returned by Weaver
              const cmds = AI.getLastUICommands();
              executeUICommands(cmds);
          }

      } catch (e: any) {
          console.error(e);
          const errorMsg = e.message || "Error generating response.";
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: MessageType.SYSTEM,
            content: errorMsg,
            timestamp: Date.now()
          }]);
      } finally {
          setIsThinking(false);
          setStatusState('idle');
          setStatusMessage('');
      }
  };

  const toggleLiveMode = () => {
    if (!isLiveMode) {
      setActiveAgent(AgentId.LIVE);
      setIsLiveMode(true);
      setStatusState('listening');
      setStatusMessage('Live Session');
    } else {
      setIsLiveMode(false);
      setActiveAgent(AgentId.NEST);
      setStatusState('idle');
      setStatusMessage('');
    }
  };

  const activeWorkspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Canvas';

  return (
    <div className="w-full h-full relative font-sans text-hall-50 selection:bg-hall-950 selection:text-hall-50 bg-transparent overflow-hidden">
        {isDeploying && <DeployLoader />}


        {/* Background Ambience */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className={`absolute inset-0 transition-opacity duration-1000 ${nodes.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
             <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px]" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[120px]" />
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
               <i className="fa-solid fa-layer-group text-4xl mb-4 text-text-secondary"></i>
               <p className="text-sm font-medium tracking-widest uppercase text-text-secondary">Canvas is Empty</p>
               <p className="text-xs mt-2 text-text-muted">Double click anywhere to add a node</p>
             </div>
          </div>
        </div>

        <ErrorBoundary name="StatusIsland">
            <StatusIsland
                currentAgent={activeAgent}
                status={statusState}
                statusMessage={statusMessage}
                onClick={() => setShowChat(true)}
            />
        </ErrorBoundary>

        {/* TOP BAR */}
        <div className="absolute top-4 md:top-6 left-0 w-full px-4 md:px-6 pointer-events-none flex items-start justify-between z-50">
            {/* Branding & Workspace Toggle */}
            <div className="pointer-events-auto relative">
                 <button
                    onClick={() => setIsWorkspacePanelOpen(!isWorkspacePanelOpen)}
                    className="flex items-center gap-3 group"
                 >
                     <div className="w-10 h-10 rounded-full bg-bg-surface/80 backdrop-blur-md shadow-glass flex items-center justify-center border border-border-subtle group-hover:scale-105 transition-transform">
                         <i className="fa-solid fa-shapes text-amber-500 text-lg"></i>
                     </div>
                     <div className="hidden md:flex flex-col items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-1">
                         <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{activeWorkspaceName}</span>
                         <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                             <span>Switch Canvas</span>
                             <i className="fa-solid fa-chevron-down text-[8px]"></i>
                             {isCloudSyncing && <i className="fa-solid fa-cloud-arrow-up text-amber-500 ml-1 animate-pulse"></i>}
                         </div>
                     </div>
                 </button>

                 <WorkspacePanel
                    isOpen={isWorkspacePanelOpen}
                    onClose={() => setIsWorkspacePanelOpen(false)}
                    workspaces={workspaces}
                    activeWorkspaceId={activeWorkspaceId}
                    onSelect={handleSwitchWorkspace}
                    onCreate={handleCreateWorkspace}
                    onDelete={handleDeleteWorkspace}
                    onRename={handleRenameWorkspace}
                 />
            </div>

            {/* Right Controls */}
            <div className="pointer-events-auto relative flex items-center gap-3">
                <button
                    onClick={handleDeployToStage}
                    className="px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>Deploy to Stage</span>
                    <i className="fa-solid fa-bolt"></i>
                </button>

                <button
                    onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        border border-border-subtle shadow-glass hover:scale-105 active:scale-100
                        ${isControlPanelOpen ? 'bg-text-primary text-bg-main' : 'bg-bg-panel/80 backdrop-blur-md text-text-primary'}
                    `}
                >
                    <i className="fa-solid fa-bars text-sm"></i>
                </button>

                <ControlPanel
                    isOpen={isControlPanelOpen}
                    onClose={() => setIsControlPanelOpen(false)}
                    isDarkMode={isDarkMode}
                    onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                    snapToGrid={snapToGrid}
                    onToggleGrid={() => setSnapToGrid(!snapToGrid)}
                    showChat={showChat}
                    onToggleChat={() => setShowChat(!showChat)}
                    useStepRouting={useStepRouting}
                    onToggleStepRouting={() => setUseStepRouting(!useStepRouting)}
                    onSave={handleSaveProject}
                    onLoad={() => fileInputRef.current?.click()}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onUndo={undo}
                    onRedo={redo}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLoadProject}
                    className="hidden"
                    accept=".json"
                />
            </div>
        </div>

        {/* LAYERS */}
        <div className={`
            absolute inset-0 transition-all duration-300 ease-in-out
            ${isSwitchingWorkspace ? 'opacity-0 scale-95 pointer-events-none filter blur-sm' : 'opacity-100 scale-100 blur-0'}
        `}>
            <ErrorBoundary name="Canvas">
                <InfiniteCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodeMove={handleNodeMove}
                    onNodeSelect={(id) => handleNodeSelect(id)}
                    onNodeDelete={handleNodeDelete}
                    onNodeUpdate={handleNodeUpdate}
                    onEdgeDelete={handleEdgeDelete}
                    onConnect={handleConnect}
                    activeNodeId={activeNodeId}
                    snapToGrid={snapToGrid}
                    onAddNode={handleAddNode}
                    onFileUpload={handleFileUpload}
                    onNodeDuplicate={handleDuplicateNode}
                    onGroupNodes={handleGroupNodes}
                    onUngroupNode={handleUngroupNode}
                    onBackgroundClick={() => setActiveNodeId(null)}
                    statusState={statusState}
                    useStepRouting={useStepRouting}
                />
            
            </ErrorBoundary>
        </div>

        {activeNodeId && nodes.find(n => n.id === activeNodeId) && (
            <ContextualTuningChat 
                node={nodes.find(n => n.id === activeNodeId) || null} 
                onUpdate={handleNodeUpdate} 
                onClose={() => setActiveNodeId(null)} 
            />
        )}

        <ErrorBoundary name="ChatOverlay">
            <ChatOverlay
                messages={messages}
                isOpen={showChat}
                onToggle={() => setShowChat(!showChat)}
                onNodeSelect={(id) => handleNodeSelect(id)}
                nodes={nodes}
                onClear={handleClearChat}
                onRetry={handleRetry}
            />
        </ErrorBoundary>

        <ErrorBoundary name="OmniBar">
            <OmniBar
                activeAgent={activeAgent}
                onSend={handleSend}
                isThinking={isThinking}
                onSelectAgent={setActiveAgent}
                onToggleLive={toggleLiveMode}
                isLiveMode={isLiveMode}
                referencedNodes={referencedNodes}
                nodeContext={activeNodeContext}
                onFileUpload={handleOmniBarUpload}
                onRunCanvas={handleRunCanvas}
            />
        </ErrorBoundary>

    </div>
  );
}
