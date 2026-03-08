const fs = require('fs');
const path = './src/hooks/useProjects.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/body: JSON\.stringify\(\{\s*id: project\.id,\s*name: project\.name,\s*mutations: project\.versions\s*\}\)/g, `body: JSON.stringify({
          id: project.id,
          name: project.name,
          mutations: project.versions,
          variables: project.variables,
          components: project.components,
          theme: project.theme,
          seo: project.seo,
          collections: project.collections
        })`);

// Also fix `loadProjectsFromBFF`
code = code.replace(/currentVersionIndex: p\.mutations \? p\.mutations\.length - 1 : 0/g, `currentVersionIndex: p.mutations ? p.mutations.length - 1 : 0,
            variables: p.variables || {},
            components: p.components || {},
            theme: p.theme || {},
            seo: p.seo || {},
            collections: p.collections || {}`);

// Also fix `updateProjectCollections` to trigger sync
code = code.replace(/const updateProjectCollections = useCallback\(\(collections: Record<string, any>\) => \{\n    if \(!currentProjectId\) return;\n    setProjects\(prev => prev.map\(p => \{\n      if \(p\.id !== currentProjectId\) return p;\n      return \{ \.\.\.p, collections \};\n    \}\)\);\n  \}, \[currentProjectId\]\);/g, `const updateProjectCollections = useCallback((collections: Record<string, any>) => {
    if (!currentProjectId) return;
    let updatedProject: Project | null = null;
    setProjects(prev => {
      const p = prev.find(proj => proj.id === currentProjectId);
      if (!p) return prev;
      updatedProject = { ...p, collections };
      return prev.map(proj => proj.id === currentProjectId ? updatedProject! : proj);
    });
    if (updatedProject) syncProjectToBFF(updatedProject);
  }, [currentProjectId, storageToken]);`);

fs.writeFileSync(path, code);
