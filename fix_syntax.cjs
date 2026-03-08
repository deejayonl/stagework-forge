const fs = require('fs');
const FILE_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/components/PromptInput.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf-8');

content = content.replace(
  /containerClasses \+= " border-hall-200 dark:border-hall-800";\n      \}\n  \}`;/,
  `containerClasses += " border-hall-200 dark:border-hall-800";\n      }\n  }`
);

fs.writeFileSync(FILE_PATH, content);
