const fs = require('fs');
const path = './server/src/routes/autofix.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `import { GoogleGenAI } from "@google/genai";`,
  `import { GoogleGenAI } from "@google/genai";\nimport { validateString, ValidationError } from '../utils/validate.js';`
);

code = code.replace(
  `const { html } = body;`,
  `const html = validateString(body.html, 'html');`
);

code = code.replace(/} catch \(error: any\) {/g, `} catch (error: any) {\n        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);`);

fs.writeFileSync(path, code);
