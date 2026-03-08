const fs = require('fs');
const path = './server/src/routes/generate.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `import { GoogleGenAI, Type } from "@google/genai";`,
  `import { GoogleGenAI, Type } from "@google/genai";\nimport { validateString, validateArray, ValidationError } from '../utils/validate.js';`
);

code = code.replace(
  `const { prompt, useThinking, attachments = [], currentFiles = [] } = body;`,
  `const prompt = validateString(body.prompt, 'prompt');\n        const useThinking = body.useThinking;\n        const attachments = body.attachments || [];\n        const currentFiles = body.currentFiles || [];`
);

code = code.replace(
  `const { prompt, size } = body;`,
  `const prompt = validateString(body.prompt, 'prompt');\n        const size = body.size;`
);

code = code.replace(
  `const { assets, userInstruction } = body;`,
  `const assets = validateArray(body.assets, 'assets');\n        const userInstruction = validateString(body.userInstruction, 'userInstruction');`
);

code = code.replace(
  `const { script, targets } = body;`,
  `const script = validateString(body.script, 'script');\n        const targets = validateArray(body.targets, 'targets');`
);

code = code.replace(/} catch \(error: any\) {/g, `} catch (error: any) {\n        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);`);

fs.writeFileSync(path, code);
