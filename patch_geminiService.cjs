const fs = require('fs');
let content = fs.readFileSync('src/services/geminiService.ts', 'utf8');

const newGetApiKey = `
const getAiConfig = () => {
    const provider = localStorage.getItem('forge_ai_provider') || 'gemini';
    let apiKey = '';
    
    if (provider === 'gemini') {
        apiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    } else if (provider === 'anthropic') {
        apiKey = localStorage.getItem('anthropic_api_key') || (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';
    } else if (provider === 'openai') {
        apiKey = localStorage.getItem('openai_api_key') || (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
    }

    // Fallback to legacy forge_api_keys if present
    if (!apiKey) {
        const savedKeys = localStorage.getItem('forge_api_keys');
        if (savedKeys) {
            try { 
                const keys = JSON.parse(savedKeys);
                apiKey = keys[provider] || keys.gemini || ''; 
            } catch(e){}
        }
    }

    return { provider, apiKey };
};
`;

content = content.replace(
  /const getApiKey = \(\) => \{[\s\S]*?return localKey \|\| \(import\.meta as any\)\.env\?\.VITE_GEMINI_API_KEY \|\| localStorage\.getItem\('gemini_api_key'\) \|\| '';\n\};/,
  newGetApiKey
);

// Update generateCode
content = content.replace(
  "const apiKey = getApiKey();\n    if (!apiKey) {\n        throw new Error(\"Gemini API Key is missing. Please add it to your settings.\");\n    }",
  "const { provider, apiKey } = getAiConfig();\n    if (!apiKey) {\n        throw new Error(`${provider.toUpperCase()} API Key is missing. Please add it to your settings.`);\n    }"
);

content = content.replace(
  "'Authorization': `Bearer ${apiKey}`",
  "'Authorization': `Bearer ${apiKey}`,\n            'X-AI-Provider': provider"
);

// Update generateBlueprints
content = content.replace(
  "const apiKey = getApiKey();\n    if (!apiKey) {\n      throw new Error(\"Gemini API Key is missing. Please add it to your settings.\");\n    }",
  "const { provider, apiKey } = getAiConfig();\n    if (!apiKey) {\n      throw new Error(`${provider.toUpperCase()} API Key is missing. Please add it to your settings.`);\n    }"
);

content = content.replace(
  "'Authorization': `Bearer ${apiKey}`",
  "'Authorization': `Bearer ${apiKey}`,\n        'X-AI-Provider': provider"
);

// Update generateAutofix
content = content.replace(
  "const apiKey = getApiKey();\n    if (!apiKey) {\n      throw new Error(\"Gemini API Key is missing. Please add it to your settings.\");\n    }",
  "const { provider, apiKey } = getAiConfig();\n    if (!apiKey) {\n      throw new Error(`${provider.toUpperCase()} API Key is missing. Please add it to your settings.`);\n    }"
);

content = content.replace(
  "'Authorization': `Bearer ${apiKey}`",
  "'Authorization': `Bearer ${apiKey}`,\n        'X-AI-Provider': provider"
);

// Update generateImage
content = content.replace(
  "const apiKey = getApiKey();\n    if (!apiKey) {\n        throw new Error(\"Gemini API Key is missing. Please add it to your settings.\");\n    }",
  "const { provider, apiKey } = getAiConfig();\n    if (!apiKey) {\n        throw new Error(`${provider.toUpperCase()} API Key is missing. Please add it to your settings.`);\n    }"
);

content = content.replace(
  "'Authorization': `Bearer ${apiKey}`",
  "'Authorization': `Bearer ${apiKey}`,\n            'X-AI-Provider': provider"
);

fs.writeFileSync('src/services/geminiService.ts', content);
