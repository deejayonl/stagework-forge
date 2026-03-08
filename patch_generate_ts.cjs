const fs = require('fs');
let content = fs.readFileSync('server/src/routes/generate.ts', 'utf8');

content = content.replace(
  "import { validateString, validateArray, ValidationError } from '../utils/validate.js';",
  "import { validateString, validateArray, ValidationError } from '../utils/validate.js';\nimport Anthropic from '@anthropic-ai/sdk';\nimport OpenAI from 'openai';"
);

content = content.replace(
  "const MODELS = {\n  FAST: 'gemini-2.5-flash',\n  THINKING: 'gemini-3.1-pro-preview',\n  IMAGE: 'gemini-2.5-flash-image', // Default to Flash Image to avoid 403 Permission Denied on Pro\n  IMAGE_PRO: 'gemini-3-pro-image-preview',\n};",
  "const MODELS = {\n  FAST: 'gemini-2.5-flash',\n  THINKING: 'gemini-3.1-pro-preview',\n  IMAGE: 'gemini-2.5-flash-image',\n  IMAGE_PRO: 'gemini-3-pro-image-preview',\n  ANTHROPIC: 'claude-3-5-sonnet-20241022',\n  OPENAI: 'gpt-4o',\n};"
);

content = content.replace(
  /const getClient = \(c: any\) => \{[\s\S]*?return new GoogleGenAI\(\{ apiKey \}\);\n\};/,
  "const getProviderConfig = (c: any) => {\n  const authHeader = c.req.header('Authorization');\n  const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';\n  const provider = c.req.header('X-AI-Provider') || 'gemini';\n  if (!apiKey) throw new Error(`${provider.toUpperCase()} API Key is missing.`);\n  return { apiKey, provider };\n};"
);

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

// For /api/generate/blueprints
content = content.replace(
  `        const ai = getClient(c);
        const modelName = useThinking ? MODELS.THINKING : MODELS.FAST;`,
  `        const { apiKey, provider } = getProviderConfig(c);`
);

const oldBlueprintLogic = `
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert system architect. Return your response as pure JSON matching the requested schema. No markdown wrapping.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            content: { type: Type.STRING }
                        },
                        required: ["id", "title", "content"]
                    }
                }
            }
        });

        return stream(c, async (stream) => {
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    await stream.write(chunk.text);
                }
            }
        });`;

const newBlueprintLogic = `
        return stream(c, async (stream) => {
            if (provider === 'anthropic') {
                const anthropic = new Anthropic({ apiKey });
                const responseStream = await anthropic.messages.create({
                    model: MODELS.ANTHROPIC,
                    max_tokens: 8192,
                    system: "You are an expert system architect. Return your response as pure JSON matching the requested schema. No markdown wrapping.",
                    messages: [{ role: 'user', content: prompt }],
                    stream: true
                });
                for await (const chunk of responseStream) {
                    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                        await stream.write(chunk.delta.text);
                    }
                }
            } else if (provider === 'openai') {
                const openai = new OpenAI({ apiKey });
                const responseStream = await openai.chat.completions.create({
                    model: MODELS.OPENAI,
                    messages: [
                        { role: 'system', content: "You are an expert system architect. Return your response as pure JSON matching the requested schema. No markdown wrapping." },
                        { role: 'user', content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    stream: true
                });
                for await (const chunk of responseStream) {
                    if (chunk.choices[0]?.delta?.content) {
                        await stream.write(chunk.choices[0].delta.content);
                    }
                }
            } else {
                const ai = new GoogleGenAI({ apiKey });
                const modelName = useThinking ? MODELS.THINKING : MODELS.FAST;
                const responseStream = await ai.models.generateContentStream({
                    model: modelName,
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an expert system architect. Return your response as pure JSON matching the requested schema. No markdown wrapping.",
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ["id", "title", "content"]
                            }
                        }
                    }
                });
                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        await stream.write(chunk.text);
                    }
                }
            }
        });`;

content = content.replace(oldBlueprintLogic, newBlueprintLogic);

// For /api/generate/image
content = content.replace(
  `        const ai = getClient(c);`,
  `        const { apiKey, provider } = getProviderConfig(c);`
);

const oldImageLogic = `        const ai = getClient(c);
        
        const response = await ai.models.generateImages({
            model: MODELS.IMAGE_PRO,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1",
                outputMimeType: "image/jpeg",
            }
        });`;

const newImageLogic = `        
        if (provider !== 'gemini') {
            return c.json({ error: 'Image generation is currently only supported with Gemini.' }, 400);
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateImages({
            model: MODELS.IMAGE_PRO,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1",
                outputMimeType: "image/jpeg",
            }
        });`;

content = content.replace(oldImageLogic, newImageLogic);

fs.writeFileSync('server/src/routes/generate.ts', content);
