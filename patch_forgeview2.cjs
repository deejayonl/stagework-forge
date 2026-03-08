const fs = require('fs');
const path = './src/routes/forge/ForgeView.tsx';

let content = fs.readFileSync(path, 'utf8');

const target = `    updateProjectSEO,
    updateProjectCollections,`;

const replacement = `    updateProjectSEO,
    updateProjectAuth,
    updateProjectCollections,`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched ForgeView.tsx (useProjects extraction)");
} else {
  console.log("Could not find the target in ForgeView.tsx");
}
