const fs = require('fs');
let content = fs.readFileSync('src/hooks/useProjects.ts', 'utf8');

// Add liveSyncWsRef
content = content.replace(
  "const ydocRef = useRef<Y.Doc | null>(null);\n  const providerRef = useRef<WebsocketProvider | null>(null);",
  "const ydocRef = useRef<Y.Doc | null>(null);\n  const providerRef = useRef<WebsocketProvider | null>(null);\n  const liveSyncWsRef = useRef<WebSocket | null>(null);"
);

// Add Live Sync WebSocket setup in the currentProjectId useEffect
const oldEffect = `  // Setup Yjs for current project
  useEffect(() => {
    if (!currentProjectId) {
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }`;

const newEffect = `  // Setup Yjs for current project
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
      }`;

content = content.replace(oldEffect, newEffect);

const oldEffectEnd = `    return () => {
      provider.disconnect();
      ydoc.destroy();
    };
  }, [currentProjectId]);`;

const newEffectEnd = `    // Setup Live Sync WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.DEV 
      ? \`ws://localhost:3001/sync?projectId=\${currentProjectId}\`
      : \`\${protocol}//\${window.location.host}/sync?projectId=\${currentProjectId}\`;
    
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
  }, [currentProjectId]);`;

content = content.replace(oldEffectEnd, newEffectEnd);

// Add useEffect to broadcast currentFiles
const filesEffect = `
  // Broadcast files when they change
  useEffect(() => {
    if (liveSyncWsRef.current && liveSyncWsRef.current.readyState === WebSocket.OPEN && currentFiles.length > 0) {
      liveSyncWsRef.current.send(JSON.stringify({
        type: 'SYNC_FILES',
        files: currentFiles
      }));
    }
  }, [currentFiles]);
`;

content = content.replace(
  "const currentProject = projects.find(p => p.id === currentProjectId) || null;",
  "const currentProject = projects.find(p => p.id === currentProjectId) || null;\n  \n  const currentFiles = currentProject && currentProject.versions.length > 0\n    ? currentProject.versions[currentProject.currentVersionIndex].files\n    : [];\n" + filesEffect
);

// Remove the duplicate definition of currentFiles lower down
content = content.replace(
  "const currentFiles = currentProject && currentProject.versions.length > 0\n    ? currentProject.versions[currentProject.currentVersionIndex].files\n    : [];\n\n  const createProject",
  "const createProject"
);

fs.writeFileSync('src/hooks/useProjects.ts', content);
