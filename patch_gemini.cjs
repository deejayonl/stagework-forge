const fs = require('fs');

const file = 'src/services/geminiService.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'const response = await fetch(`${API_BASE}/generate-code`',
    'const MUTATE_URL = import.meta.env?.DEV ? \'http://localhost:3001/api/mutate\' : \'/api/mutate\';\n    const response = await fetch(MUTATE_URL'
);

fs.writeFileSync(file, content);
console.log("Patched geminiService.ts");
