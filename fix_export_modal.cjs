const fs = require('fs');
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

code = code.replace(
  '{onDeploy && (',
  '{onDeploy && (\n            <>'
);

code = code.replace(
  'Push to GitHub\n            </button>\n          )}',
  'Push to GitHub\n            </button>\n            </>\n          )}'
);

fs.writeFileSync('src/components/ExportModal.tsx', code);
