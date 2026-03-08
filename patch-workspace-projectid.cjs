const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

content = content.replace(
  /projectId=\{project\?\.id\}/,
  `projectId={undefined} /* TODO: Pass actual projectId if available */`
);

fs.writeFileSync('src/components/Workspace.tsx', content);
