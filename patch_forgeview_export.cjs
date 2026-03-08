const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const exportHandler = `
  const handleExport = () => {
    if (!currentProject) return;
    const API_BASE = import.meta.env?.DEV ? 'http://localhost:3001/api/export' : '/api/export';
    window.open(\`\${API_BASE}/\${currentProject.id}\`, '_blank');
  };
`;

code = code.replace(
  "  const toggleTheme = () => setIsDark(!isDark);",
  "  const toggleTheme = () => setIsDark(!isDark);\n" + exportHandler
);

code = code.replace(
  "onOpenAssets={() => setIsImageToolOpen(true)}",
  "onOpenAssets={() => setIsImageToolOpen(true)}\n        onExport={currentProject ? handleExport : undefined}"
);

fs.writeFileSync(filePath, code);
console.log("Patched ForgeView.tsx export");
