const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/hooks/useProjects.ts');
let code = fs.readFileSync(filePath, 'utf8');

// Remove cloudService import
code = code.replace("import { cloudService } from '../services/cloudService';", "");

// Replace syncProjectToCloud with syncProjectToBFF
const oldSync = `  const syncProjectToCloud = async (project: Project, files: GeneratedFile[]) => {
    if (!storageToken) return;

    setIsSyncing(true);
    setSyncError(null);
    try {
      // 1. Ensure Root Folder ("Forge Builds")
      const rootFolder = await cloudService.getOrCreateFolder(storageToken, ROOT_FOLDER_NAME);
      if (!rootFolder) throw new Error("Could not create root folder");

      // 2. Ensure Project Folder
      const projectFolderName = \`\${project.name} - \${project.id.substring(0, 6)}\`;
      let projectFolderId = project.cloudFolderId;
      
      if (!projectFolderId) {
         const folder = await cloudService.getOrCreateFolder(storageToken, projectFolderName, rootFolder.id);
         projectFolderId = folder.id;
      }

      if (!projectFolderId) throw new Error("Could not create project folder");

      // 3. Sync Files
      const newFileMap = { ...(project.cloudFileMap || {}) };

      for (const file of files) {
        if (newFileMap[file.name]) {
          try {
            await cloudService.deleteEntry(storageToken, newFileMap[file.name]);
          } catch (e) {
            console.warn(\`Failed to delete old version of \${file.name}\`, e);
          }
        }

        const fileObj = cloudService.convertGeneratedFileToFile(file);
        const uploaded = await cloudService.uploadFile(storageToken, fileObj, projectFolderId);
        newFileMap[file.name] = uploaded.id;
      }

      // 4. Update Project State with Cloud Metadata
      setProjects(prev => prev.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          cloudFolderId: projectFolderId,
          cloudFileMap: newFileMap,
          lastSyncedAt: Date.now()
        };
      }));

    } catch (error: any) {
      console.error("Cloud Sync Error:", error);
      setSyncError("Sync failed: Check API Token"); 
    } finally {
      setIsSyncing(false);
    }
  };`;

const newSync = `  const syncProjectToBFF = async (project: Project) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const API_BASE = import.meta.env?.DEV ? 'http://localhost:3001/api/projects' : '/api/projects';
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name: project.name,
          mutations: project.versions
        })
      });
    } catch (error: any) {
      console.error("BFF Sync Error:", error);
      setSyncError("Sync failed"); 
    } finally {
      setIsSyncing(false);
    }
  };`;

code = code.replace(oldSync, newSync);

// Replace syncProjectToCloud calls
code = code.replace(/syncProjectToCloud\(newProject, files\);/g, "syncProjectToBFF(newProject);");
code = code.replace(/syncProjectToCloud\(updatedProject, files\);/g, "syncProjectToBFF(updatedProject);");

// Remove storageToken condition for sync
code = code.replace(/if \(storageToken\) \{/g, "if (true) {");
code = code.replace(/if \(storageToken && updatedProject\) /g, "if (updatedProject) ");

// Add loadProjectsFromBFF
const loadBff = `
  const loadProjectsFromBFF = useCallback(async () => {
    try {
      const API_BASE = import.meta.env?.DEV ? 'http://localhost:3001/api/projects' : '/api/projects';
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects)) {
          const loadedProjects: Project[] = data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            createdAt: p.updatedAt || Date.now(),
            versions: p.mutations || [],
            currentVersionIndex: p.mutations ? p.mutations.length - 1 : 0
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
`;

code = code.replace("  const currentProject = projects.find(p => p.id === currentProjectId) || null;", loadBff + "\n  const currentProject = projects.find(p => p.id === currentProjectId) || null;");

// Expose loadProjectsFromBFF
code = code.replace("startNewProject,", "startNewProject,\n    loadProjectsFromBFF,");

fs.writeFileSync(filePath, code);
console.log("Patched useProjects.ts");
