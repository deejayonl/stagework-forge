const fs = require('fs');
const path = './server/src/routes/mutate.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `const { prompt, useThinking, attachments = [], currentFiles = [] } = body;`,
  `const prompt = validateString(body.prompt, 'prompt');\n        const useThinking = body.useThinking;\n        const attachments = body.attachments || [];\n        const currentFiles = body.currentFiles || [];`
);

fs.writeFileSync(path, code);
