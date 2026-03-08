const fs = require('fs');
let content = fs.readFileSync('server/src/services/project-store.ts', 'utf8');

content = content.replace(
  /collections\?: Record<string, any>; \/\/ CMS Collections/g,
  "collections?: Record<string, any>; // CMS Collections\n  apis?: Record<string, any>; // External APIs"
);

content = content.replace(
  /collections: project.collections \|\| existing.collections \|\| \{\},/g,
  "collections: project.collections || existing.collections || {},\n      apis: project.apis || existing.apis || {},"
);

fs.writeFileSync('server/src/services/project-store.ts', content);
