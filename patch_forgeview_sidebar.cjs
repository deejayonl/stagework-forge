const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace ProjectSidebar usage
const oldSidebar = `<ProjectSidebar 
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelect={selectProject}
        onDelete={deleteProject}
        onNew={startNewProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />`;

const newSidebar = `<ProjectSidebar 
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelect={selectProject}
        onDelete={deleteProject}
        onNew={startNewProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLoadFromBFF={loadProjectsFromBFF}
        isSyncing={isSyncing}
      />`;

code = code.replace(oldSidebar, newSidebar);

fs.writeFileSync(filePath, code);
console.log("Patched ForgeView.tsx");
