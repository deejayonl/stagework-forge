const fs = require('fs');
const path = './src/routes/forge/ForgeView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("updateProjectTheme,", "updateProjectTheme,\n    updateProjectSEO,\n    updateProjectCollections,");
code = code.replace("theme={currentProject?.theme}", "theme={currentProject?.theme}\n          seo={currentProject?.seo}\n          collections={currentProject?.collections}");
code = code.replace("onUpdateTheme={updateProjectTheme}", "onUpdateTheme={updateProjectTheme}\n          onUpdateSEO={updateProjectSEO}\n          onUpdateCollections={updateProjectCollections}");

fs.writeFileSync(path, code);
