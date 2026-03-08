const fs = require('fs');
const path = './src/hooks/useProjects.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `  const updateProjectSEO = useCallback((seo: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, seo };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);`;

const replacement = `  const updateProjectSEO = useCallback((seo: Record<string, string>) => {
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

  const updateProjectAuth = useCallback((auth: Record<string, string>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, auth };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  
  // Also add updateProjectAuth to the return object
  content = content.replace('updateProjectSEO,', 'updateProjectSEO,\n    updateProjectAuth,');
  
  fs.writeFileSync(path, content);
  console.log("Successfully patched useProjects.ts");
} else {
  console.log("Could not find the target in useProjects.ts");
}
