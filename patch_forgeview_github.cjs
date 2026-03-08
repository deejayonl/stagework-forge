const fs = require('fs');
let code = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

code = code.replace(
  'const handleDeployConfirm = async (framework: string) => {',
  'const handleDeployConfirm = async (framework: string, provider: string) => {'
);

code = code.replace(
  "window.open(`\\${API_BASE}/vercel/\\${currentProject.id}?framework=\\${framework}`, '_blank');",
  "window.open(`\\${API_BASE}/\\${provider}/\\${currentProject.id}?framework=\\${framework}`, '_blank');"
);

fs.writeFileSync('src/routes/forge/ForgeView.tsx', code);
