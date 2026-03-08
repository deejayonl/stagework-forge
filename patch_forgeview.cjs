const fs = require('fs');
const path = './src/routes/forge/ForgeView.tsx';

let content = fs.readFileSync(path, 'utf8');

const target = `      {isSettingsOpen && currentProject && (
        <ProjectSettingsModal 
          seo={currentProject.seo || {}}
          onUpdateSEO={updateProjectSEO}
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}`;

const replacement = `      {isSettingsOpen && currentProject && (
        <ProjectSettingsModal 
          seo={currentProject.seo || {}}
          onUpdateSEO={updateProjectSEO}
          auth={currentProject.auth || {}}
          onUpdateAuth={updateProjectAuth}
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched ForgeView.tsx (ProjectSettingsModal props)");
} else {
  console.log("Could not find the target in ForgeView.tsx");
}

// We also need to extract updateProjectAuth from useProjects
const hooksTarget = `    updateProjectSEO,
    addVersionToProject,`;

const hooksReplacement = `    updateProjectSEO,
    updateProjectAuth,
    addVersionToProject,`;

if (content.includes(hooksTarget)) {
  content = content.replace(hooksTarget, hooksReplacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched ForgeView.tsx (useProjects extraction)");
} else {
  console.log("Could not find the hooks target in ForgeView.tsx");
}

