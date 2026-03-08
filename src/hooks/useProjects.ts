
import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, GeneratedFile, ProjectVersion } from '../types';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const STORAGE_KEY = 'forge-projects-v1';


export const useProjects = (storageToken: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  // Yjs State
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const liveSyncWsRef = useRef<WebSocket | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProjectId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Setup Yjs for current project
  useEffect(() => {
    if (!currentProjectId) {
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      if (liveSyncWsRef.current) {
        liveSyncWsRef.current.close();
        liveSyncWsRef.current = null;
      }
      setActiveUsers([]);
      return;
    }

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Use a public demo server for preparation phase
    const provider = new WebsocketProvider('wss://demos.yjs.dev', `forge-project-${currentProjectId}`, ydoc);
    providerRef.current = provider;

    const awareness = provider.awareness;
    
    // Assign random user info for demo
    const colors = ['#ef4444', '#f97316', '#10b981', '#3b82f6', '#8b5cf6'];
    awareness.setLocalStateField('user', {
      name: `Collaborator ${Math.floor(Math.random() * 1000)}`,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().entries())
        .filter(([id]) => id !== awareness.clientID)
        .map(([id, state]) => ({
          id,
          ...(state as any)
        }));
      setActiveUsers(states);
    });

    // Sync project state to Yjs map
    const yProjectMap = ydoc.getMap('projectState');
    
    yProjectMap.observe((event) => {
      // In a real implementation, we would apply Yjs updates to the React state here.
      // For the preparation phase, we just observe changes.
    });

    // Setup Live Sync WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.DEV 
      ? `ws://localhost:3001/sync?projectId=${currentProjectId}`
      : `${protocol}//${window.location.host}/sync?projectId=${currentProjectId}`;
    
    const ws = new WebSocket(wsUrl);
    liveSyncWsRef.current = ws;

    ws.onopen = () => console.log('[LiveSync] Connected to project', currentProjectId);
    ws.onerror = (e) => console.error('[LiveSync] Error', e);

    return () => {
      provider.disconnect();
      ydoc.destroy();
      if (liveSyncWsRef.current) {
        liveSyncWsRef.current.close();
        liveSyncWsRef.current = null;
      }
    };
  }, [currentProjectId]);

  // Save to local storage whenever projects change
  useEffect(() => {
    const saveToStorage = () => {
      try {
        const data = projects.length > 0 ? JSON.stringify(projects) : JSON.stringify([]);
        localStorage.setItem(STORAGE_KEY, data);
      } catch (e: any) {
        console.warn("LocalStorage quota exceeded. Attempting to optimize storage...");
        // Basic optimization: strip history from non-active projects
        try {
           const optimizedProjects = projects.map(p => {
              if (p.id !== currentProjectId) {
                  return {
                      ...p,
                      versions: p.versions.map((v, i) => {
                          if (i === p.versions.length - 1) return v;
                          return { ...v, files: [] }; 
                      })
                  };
              }
              return p;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(optimizedProjects));
        } catch (e2) {
           console.error("Storage persistence failed", e2);
        }
      }
    };
    const timeoutId = setTimeout(saveToStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [projects, currentProjectId]);


  /**
   * Syncs a specific project to the cloud.
   * Only works if storageToken is available.
   */
  const syncProjectToBFF = async (project: Project) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const API_BASE = 'https://sgfbackend.deejay.onl/api/projects';
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name: project.name,
          mutations: project.versions,
          variables: project.variables,
          components: project.components,
          theme: project.theme,
          seo: project.seo,
          collections: project.collections,
          assets: project.assets
        })
      });
    } catch (error: any) {
      console.error("BFF Sync Error:", error);
      setSyncError("Sync failed"); 
    } finally {
      setIsSyncing(false);
    }
  };


  const loadProjectsFromBFF = useCallback(async () => {
    try {
      const API_BASE = 'https://sgfbackend.deejay.onl/api/projects';
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects)) {
          const loadedProjects: Project[] = data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            createdAt: p.updatedAt || Date.now(),
            versions: p.mutations || [],
            currentVersionIndex: p.mutations ? p.mutations.length - 1 : 0,
            variables: p.variables || {},
            components: p.components || {},
            theme: p.theme || {},
            seo: p.seo || {},
            collections: p.collections || {},
            assets: p.assets || {}
          })).filter((p: Project) => p.versions.length > 0);
          
          if (loadedProjects.length > 0) {
             setProjects(loadedProjects);
             setCurrentProjectId(loadedProjects[0].id);
             localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedProjects));
          }
        }
      }
    } catch (e) {
      console.error("Failed to load from BFF", e);
    }
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || null;
  
  const currentFiles = currentProject && currentProject.versions.length > 0
    ? currentProject.versions[currentProject.currentVersionIndex].files
    : [];

  // Broadcast files when they change
  useEffect(() => {
    if (liveSyncWsRef.current && liveSyncWsRef.current.readyState === WebSocket.OPEN && currentFiles.length > 0) {
      liveSyncWsRef.current.send(JSON.stringify({
        type: 'SYNC_FILES',
        files: currentFiles
      }));
    }
  }, [currentFiles]);

  
  const createProject = useCallback(async (files: GeneratedFile[], prompt: string) => {

    const newVersion: ProjectVersion = {
      id: Math.random().toString(36).substring(7),
      files,
      prompt,
      timestamp: Date.now()
    };

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: prompt.slice(0, 30).trim() + (prompt.length > 30 ? '...' : ''),
      createdAt: Date.now(),
      versions: [newVersion],
      currentVersionIndex: 0
    };

    setProjects(prev => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);

    // Auto Sync if storage configured
    if (true) {
      syncProjectToBFF(newProject);
    }
  }, [storageToken, projects.length]);

  const addVersionToProject = useCallback(async (projectId: string, files: GeneratedFile[], prompt: string) => {
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === projectId);
      if (!p) return prev;
      const history = p.versions.slice(0, p.currentVersionIndex + 1);
      const newVersion: ProjectVersion = { id: Math.random().toString(36).substring(7), files, prompt, timestamp: Date.now() };
      updatedProject = { ...p, versions: [...history, newVersion], currentVersionIndex: history.length };
      return prev.map(proj => proj.id === projectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [storageToken]);

  const addVersion = useCallback(async (files: GeneratedFile[], prompt: string) => {

    if (!currentProjectId) return;

    let updatedProject: Project | null = null;

    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;

      const history = p.versions.slice(0, p.currentVersionIndex + 1);
      
      const newVersion: ProjectVersion = {
        id: Math.random().toString(36).substring(7),
        files,
        prompt,
        timestamp: Date.now()
      };

      updatedProject = {
        ...p,
        versions: [...history, newVersion],
        currentVersionIndex: history.length
      };

      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });

    if (updatedProject) {
      syncProjectToBFF(updatedProject);
    }
  }, [currentProjectId, storageToken]);



  const updateCurrentVersion = useCallback((files: GeneratedFile[]) => {
    if (!currentProjectId) return;

    let updatedProject: Project | null = null;

    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p || p.versions.length === 0) return prev;

      const newVersions = [...p.versions];
      newVersions[p.currentVersionIndex] = {
        ...newVersions[p.currentVersionIndex],
        files
      };

      updatedProject = {
        ...p,
        versions: newVersions
      };

      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });

    if (updatedProject) {
      // Debounce cloud sync for manual edits to avoid rate limits
      // In a real app, we'd use a debounced sync function here
      syncProjectToBFF(updatedProject);
    }
  }, [currentProjectId, storageToken]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (currentProjectId === id) {
        setCurrentProjectId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [currentProjectId]);

  const selectProject = useCallback((id: string) => {
    setCurrentProjectId(id);
  }, []);

  const undo = useCallback(() => {
    if (!currentProject || currentProject.currentVersionIndex <= 0) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return { ...p, currentVersionIndex: p.currentVersionIndex - 1 };
    }));
  }, [currentProject, currentProjectId]);

  
  const jumpToVersion = useCallback((index: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        if (index >= 0 && index < p.versions.length) {
          return { ...p, currentVersionIndex: index };
        }
      }
      return p;
    }));
  }, [currentProjectId]);

  const redo = useCallback(() => {
    if (!currentProject || currentProject.currentVersionIndex >= currentProject.versions.length - 1) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return { ...p, currentVersionIndex: p.currentVersionIndex + 1 };
    }));
  }, [currentProject, currentProjectId]);

  const updateProjectVariables = useCallback((variables: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, variables };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);

  const updateProjectComponents = useCallback((components: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, components };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);

  const updateProjectTheme = useCallback((theme: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, theme };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);

  
  const updateProjectCollections = useCallback((collections: Record<string, any>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, collections };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);


  const updateProjectAssets = useCallback((assets: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, assets };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId]);

  const updateProjectApis = useCallback((apis: Record<string, any>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, apis };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);

  const updateProjectSEO = useCallback((seo: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, seo };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);

  const startNewProject = useCallback(() => {
    setCurrentProjectId(null);
  }, []);

  return {
    projects,
    currentProject,
    currentFiles,
    createProject,
    addVersion,
    updateCurrentVersion,
    updateProjectVariables,
    updateProjectComponents,
    updateProjectTheme,
    updateProjectSEO,
    updateProjectCollections,
    updateProjectApis,
    updateProjectAssets,
    addVersionToProject,
    deleteProject,
    selectProject,
    undo,
    redo,
    jumpToVersion,
    startNewProject,
    loadProjectsFromBFF,
    canUndo: currentProject ? currentProject.currentVersionIndex > 0 : false,
    canRedo: currentProject ? currentProject.currentVersionIndex < currentProject.versions.length - 1 : false,
    isSyncing,
    syncError,
    activeUsers
  };
};
