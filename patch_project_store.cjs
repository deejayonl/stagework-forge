const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/src/services/project-store.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add customDomain to ProjectState interface
content = content.replace(
  'mutations: any[]; // The real-time changes',
  'mutations: any[]; // The real-time changes\n  customDomain?: string;'
);

// Add to state object
content = content.replace(
  'mutations: project.mutations || existing.mutations || [],',
  'mutations: project.mutations || existing.mutations || [],\n      customDomain: project.customDomain || existing.customDomain,'
);

fs.writeFileSync(filePath, content);
console.log('Patched project-store.ts');
