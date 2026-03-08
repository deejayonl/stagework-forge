const fs = require('fs');
const path = './src/hooks/useProjects.ts';
let code = fs.readFileSync(path, 'utf8');

const updateFn = `
  const updateProjectCollections = useCallback((collections: Record<string, any>) => {
    if (!currentProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== currentProjectId) return p;
      return { ...p, collections };
    }));
  }, [currentProjectId]);
`;

code = code.replace("const updateProjectSEO = useCallback((seo: Record<string, string>) => {", updateFn + "\n  const updateProjectSEO = useCallback((seo: Record<string, string>) => {");

code = code.replace("updateProjectSEO,", "updateProjectSEO,\n    updateProjectCollections,");

fs.writeFileSync(path, code);
