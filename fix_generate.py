import re

with open('server/src/routes/generate.ts', 'r') as f:
    content = f.read()

# Fix getClient
get_client_func = """
const getClient = (c: any) => {
  const { apiKey } = getProviderConfig(c);
  return new GoogleGenAI({ apiKey });
};
"""

if 'const getClient = ' not in content:
    content = content.replace('const getProviderConfig = (c: any) => {', get_client_func + '\nconst getProviderConfig = (c: any) => {')

# Fix /generate-image
if 'const response = await ai.models.generateImages({' in content:
    content = content.replace('const { apiKey, provider } = getProviderConfig(c);', 'const { apiKey, provider } = getProviderConfig(c);\n        const ai = getClient(c);')

with open('server/src/routes/generate.ts', 'w') as f:
    f.write(content)
