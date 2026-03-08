const fs = require('fs');
let content = fs.readFileSync('src/components/CloudConfig.tsx', 'utf8');

// Add states for Anthropic and OpenAI keys
content = content.replace(
  "const [geminiKey, setGeminiKey] = useState('');",
  "const [geminiKey, setGeminiKey] = useState('');\n  const [anthropicKey, setAnthropicKey] = useState('');\n  const [openaiKey, setOpenaiKey] = useState('');\n  const [provider, setProvider] = useState(localStorage.getItem('forge_ai_provider') || 'gemini');"
);

// Update useEffect to load all keys
content = content.replace(
  "const savedKey = localStorage.getItem('gemini_api_key') || '';\n        setGeminiKey(savedKey);\n        setGeminiStatus('idle');",
  "const savedGemini = localStorage.getItem('gemini_api_key') || '';\n        setGeminiKey(savedGemini);\n        const savedAnthropic = localStorage.getItem('anthropic_api_key') || '';\n        setAnthropicKey(savedAnthropic);\n        const savedOpenai = localStorage.getItem('openai_api_key') || '';\n        setOpenaiKey(savedOpenai);\n        setGeminiStatus('idle');"
);

// Update handleSaveGeminiKey to a generic handleSaveKey
const saveKeyFn = `
  const handleSaveKey = () => {
    if (provider === 'gemini') {
      if (geminiKey.trim()) localStorage.setItem('gemini_api_key', geminiKey.trim());
      else localStorage.removeItem('gemini_api_key');
    } else if (provider === 'anthropic') {
      if (anthropicKey.trim()) localStorage.setItem('anthropic_api_key', anthropicKey.trim());
      else localStorage.removeItem('anthropic_api_key');
    } else if (provider === 'openai') {
      if (openaiKey.trim()) localStorage.setItem('openai_api_key', openaiKey.trim());
      else localStorage.removeItem('openai_api_key');
    }
    setGeminiStatus('success');
    setTimeout(() => setGeminiStatus('idle'), 2000);
  };
`;
content = content.replace(
  "const handleSaveGeminiKey = () => {\n    if (geminiKey.trim()) {\n      localStorage.setItem('gemini_api_key', geminiKey.trim());\n    } else {\n      localStorage.removeItem('gemini_api_key');\n    }\n    setGeminiStatus('success');\n    setTimeout(() => setGeminiStatus('idle'), 2000);\n  };",
  saveKeyFn
);

// Update AI Provider select
content = content.replace(
  "value={localStorage.getItem(\"forge_ai_provider\") || \"gemini\"}\n                        onChange={(e) => {\n                           localStorage.setItem(\"forge_ai_provider\", e.target.value);\n                           // Force re-render to show correct key input\n                           setGeminiStatus(\"idle\");\n                        }}",
  "value={provider}\n                        onChange={(e) => {\n                           setProvider(e.target.value);\n                           localStorage.setItem(\"forge_ai_provider\", e.target.value);\n                           setGeminiStatus(\"idle\");\n                        }}"
);

// Update API Key section title and input
content = content.replace(
  "Gemini API Key\n                </div>\n                <div className=\"text-xs text-hall-500\">\n                    Required for code and image generation. Get your key from Google AI Studio.\n                </div>",
  "{provider === 'gemini' ? 'Gemini API Key' : provider === 'anthropic' ? 'Anthropic API Key' : 'OpenAI API Key'}\n                </div>\n                <div className=\"text-xs text-hall-500\">\n                    {provider === 'gemini' ? 'Required for code generation. Get your key from Google AI Studio.' : provider === 'anthropic' ? 'Required for code generation. Get your key from Anthropic Console.' : 'Required for code generation. Get your key from OpenAI Platform.'}\n                </div>"
);

content = content.replace(
  "value={geminiKey}\n                        onChange={(e) => setGeminiKey(e.target.value)}\n                        placeholder=\"AIzaSy...\"",
  "value={provider === 'gemini' ? geminiKey : provider === 'anthropic' ? anthropicKey : openaiKey}\n                        onChange={(e) => provider === 'gemini' ? setGeminiKey(e.target.value) : provider === 'anthropic' ? setAnthropicKey(e.target.value) : setOpenaiKey(e.target.value)}\n                        placeholder={provider === 'gemini' ? \"AIzaSy...\" : provider === 'anthropic' ? \"sk-ant-...\" : \"sk-...\"}"
);

content = content.replace(
  "onClick={handleSaveGeminiKey}",
  "onClick={handleSaveKey}"
);

fs.writeFileSync('src/components/CloudConfig.tsx', content);
