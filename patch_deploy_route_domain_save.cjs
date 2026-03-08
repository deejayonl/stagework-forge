const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/src/routes/deploy.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "// In a real app, we would configure the domain with Vercel or Cloudflare here\n    return c.json({",
  "// In a real app, we would configure the domain with Vercel or Cloudflare here\n    await projectStore.save({ id, customDomain: domain });\n    return c.json({"
);

fs.writeFileSync(filePath, content);
console.log('Patched deploy.ts to save domain');
