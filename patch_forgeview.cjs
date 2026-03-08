const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

code = code.replace(
  "interface ForgeViewProps {\n  onGeneratingChange?: (isGenerating: boolean) => void;\n}",
  "interface ForgeViewProps {\n  onGeneratingChange?: (isGenerating: boolean) => void;\n  initialWorkspaces?: any[];\n}"
);

code = code.replace(
  "const ForgeView: React.FC<ForgeViewProps> = ({ onGeneratingChange }) => {",
  "const ForgeView: React.FC<ForgeViewProps> = ({ onGeneratingChange, initialWorkspaces }) => {"
);

fs.writeFileSync(forgeViewPath, code);
