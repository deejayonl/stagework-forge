const fs = require('fs');
let code = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

const deployHandler = `  const handleDeployConfirm = async (framework: string) => {
    if (!currentProject) return;
    const API_BASE = import.meta.env?.DEV ? 'http://localhost:3001/api/deploy' : '/api/deploy';
    setIsExportModalOpen(false);
    
    try {
      // In a real implementation this would poll for status or open a new window with the deployment logs
      window.open(\`\${API_BASE}/\${currentProject.id}?framework=\${framework}\`, '_blank');
    } catch (err) {
      console.error('Deploy failed:', err);
      alert('Deployment failed. Please try again later.');
    }
  };`;

code = code.replace(
  '  const handleExportConfirm = (framework: string) => {',
  deployHandler + '\n\n  const handleExportConfirm = (framework: string) => {'
);

code = code.replace(
  'onExport={handleExportConfirm}',
  'onExport={handleExportConfirm}\n        onDeploy={handleDeployConfirm}'
);

fs.writeFileSync('src/routes/forge/ForgeView.tsx', code);
