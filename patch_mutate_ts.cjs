const fs = require('fs');
let content = fs.readFileSync('server/src/routes/mutate.ts', 'utf8');

// Add imports
content = content.replace(
  "import { validateString, validateArray, ValidationError } from '../utils/validate.js';",
  "import { validateString, validateArray, ValidationError } from '../utils/validate.js';\nimport Anthropic from '@anthropic-ai/sdk';\nimport OpenAI from 'openai';"
);

// Add Anthropic and OpenAI models
content = content.replace(
  "const MODELS = {\n  FAST: 'gemini-2.5-flash',\n  THINKING: 'gemini-3.1-pro-preview',\n};",
  "const MODELS = {\n  FAST: 'gemini-2.5-flash',\n  THINKING: 'gemini-3.1-pro-preview',\n  ANTHROPIC: 'claude-3-5-sonnet-20241022',\n  OPENAI: 'gpt-4o',\n};"
);

// Update getClient to just get API Key and Provider
content = content.replace(
  /const getClient = \(c: any\) => \{[\s\S]*?return new GoogleGenAI\(\{ apiKey \}\);\n\};/,
  "const getProviderConfig = (c: any) => {\n  const authHeader = c.req.header('Authorization');\n  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';\n  const provider = c.req.header('X-AI-Provider') || 'gemini';\n  if (!apiKey) throw new Error(`${provider.toUpperCase()} API Key is missing.`);\n  return { apiKey, provider };\n};"
);

// Update the route logic
const oldLogic = `        const ai = getClient(c);
        const modelName = useThinking ? MODELS.THINKING : MODELS.FAST;

        let finalPrompt = prompt;`;

const newLogic = `        const { apiKey, provider } = getProviderConfig(c);
        let finalPrompt = prompt;`;

content = content.replace(oldLogic, newLogic);

const oldStreamLogic = `        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json"
            }
        });

        return stream(c, async (stream) => {
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    await stream.write(chunk.text);
                }
            }
        });`;

const newStreamLogic = `
        return stream(c, async (stream) => {
            if (provider === 'anthropic') {
                const anthropic = new Anthropic({ apiKey });
                const anthropicMessages: any[] = [{ role: 'user', content: finalPrompt }];
                
                if (attachments.length > 0) {
                    const contentArr: any[] = [];
                    attachments.forEach((att: any) => {
                        contentArr.push({
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: att.mimeType,
                                data: att.base64.split(',')[1]
                            }
                        });
                    });
                    contentArr.push({ type: 'text', text: finalPrompt });
                    anthropicMessages[0].content = contentArr;
                }

                const responseStream = await anthropic.messages.create({
                    model: MODELS.ANTHROPIC,
                    max_tokens: 8192,
                    system: SYSTEM_INSTRUCTION,
                    messages: anthropicMessages,
                    stream: true
                });

                for await (const chunk of responseStream) {
                    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                        await stream.write(chunk.delta.text);
                    }
                }
            } else if (provider === 'openai') {
                const openai = new OpenAI({ apiKey });
                const openaiMessages: any[] = [
                    { role: 'system', content: SYSTEM_INSTRUCTION },
                    { role: 'user', content: finalPrompt }
                ];

                if (attachments.length > 0) {
                    const contentArr: any[] = [];
                    contentArr.push({ type: 'text', text: finalPrompt });
                    attachments.forEach((att: any) => {
                        contentArr.push({
                            type: 'image_url',
                            image_url: { url: att.base64 }
                        });
                    });
                    openaiMessages[1].content = contentArr;
                }

                const responseStream = await openai.chat.completions.create({
                    model: MODELS.OPENAI,
                    messages: openaiMessages,
                    response_format: { type: "json_object" },
                    stream: true
                });

                for await (const chunk of responseStream) {
                    if (chunk.choices[0]?.delta?.content) {
                        await stream.write(chunk.choices[0].delta.content);
                    }
                }
            } else {
                // Default Gemini
                const ai = new GoogleGenAI({ apiKey });
                const modelName = useThinking ? MODELS.THINKING : MODELS.FAST;
                
                const responseStream = await ai.models.generateContentStream({
                    model: modelName,
                    contents: contents,
                    config: {
                        systemInstruction: SYSTEM_INSTRUCTION,
                        responseMimeType: "application/json"
                    }
                });

                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        await stream.write(chunk.text);
                    }
                }
            }
        });`;

content = content.replace(oldStreamLogic, newStreamLogic);

fs.writeFileSync('server/src/routes/mutate.ts', content);
