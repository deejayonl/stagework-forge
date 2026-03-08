const fs = require('fs');
const path = './src/routes/forge/ForgeView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("updateProjectSEO,", "updateProjectSEO,\n    updateProjectCollections,");

code = code.replace("seo={currentProject?.seo || {}}", "seo={currentProject?.seo || {}}\n                 collections={currentProject?.collections || {}}");

code = code.replace("onUpdateSEO={updateProjectSEO}", "onUpdateSEO={updateProjectSEO}\n                 onUpdateCollections={updateProjectCollections}");

fs.writeFileSync(path, code);
