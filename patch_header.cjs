const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Header.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "import { Menu, Undo2, Redo2, Image as ImageIcon } from 'lucide-react';",
  "import { Menu, Undo2, Redo2, Image as ImageIcon, Download } from 'lucide-react';"
);

code = code.replace(
  "onOpenAssets: () => void;\n}",
  "onOpenAssets: () => void;\n  onExport?: () => void;\n}"
);

code = code.replace(
  "onOpenAssets\n}) => {",
  "onOpenAssets,\n  onExport\n}) => {"
);

const exportButton = `
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 rounded-full hover:bg-hall-100 hover:bg-hall-800 transition-colors text-hall-600 text-hall-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Export Project (ZIP)"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
`;

code = code.replace(
  "          <button\n            onClick={onOpenAssets}",
  exportButton + '            onClick={onOpenAssets}'
);

fs.writeFileSync(filePath, code);
console.log("Patched Header.tsx");
