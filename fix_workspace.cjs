const fs = require('fs');
const FILE_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/components/Workspace.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf-8');

// The variable `activePage` isn't defined in this scope. Let's fix it by passing the actual selected file.
content = content.replace(
  /localFiles\[activePage\]\?\.content/g,
  "localFiles[activeFile]?.content"
);

fs.writeFileSync(FILE_PATH, content);
