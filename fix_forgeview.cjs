const fs = require('fs');

const path = './src/routes/forge/ForgeView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert closing tags before PromptInput
content = content.replace(
  /             <PromptInput /,
  "               </>\n             )}\n\n             <PromptInput "
);

fs.writeFileSync(path, content);
console.log('ForgeView.tsx fixed');
