const fs = require('fs');
const path = './server/src/services/project-store.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("components?: Record<string, string>; // Saved custom components (name -> HTML)", "components?: Record<string, string>; // Saved custom components (name -> HTML)\n  collections?: Record<string, any>; // CMS Collections");

code = code.replace("components: project.components || existing.components || {},", "components: project.components || existing.components || {},\n      collections: project.collections || existing.collections || {},");

fs.writeFileSync(path, code);
