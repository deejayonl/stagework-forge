const fs = require('fs');
const path = require('path');

const stageViewPath = path.join(__dirname, 'src/routes/stage/StageView.tsx');
let code = fs.readFileSync(stageViewPath, 'utf8');

code = code.replace(
  "import { useState } from 'react';",
  "import { useState } from 'react';\nimport { useLocation } from 'react-router-dom';"
);

code = code.replace(
  "export default function StageView() {",
  "export default function StageView() {\n  const location = useLocation();\n  const workspaces = location.state?.workspaces;"
);

code = code.replace(
  "<ForgeView onGeneratingChange={setIsGenerating} />",
  "<ForgeView onGeneratingChange={setIsGenerating} initialWorkspaces={workspaces} />"
);

fs.writeFileSync(stageViewPath, code);
