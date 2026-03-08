const fs = require('fs');
const FILE_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/routes/script/ScriptView.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf-8');

// The ScriptView textarea should be absolute filling the screen (or mostly filling) and click-to-focus anywhere.
content = content.replace(
  /<div className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col">/g,
  `<div className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col" onClick={() => document.getElementById('script-textarea')?.focus()}>`
);

content = content.replace(
  /<textarea\s*value=\{scriptText\}/g,
  `<textarea id="script-textarea" value={scriptText}`
);

fs.writeFileSync(FILE_PATH, content);
