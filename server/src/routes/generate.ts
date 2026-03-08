import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { GoogleGenAI, Type } from "@google/genai";
import { validateString, validateArray, ValidationError } from '../utils/validate.js';

export const generateRoutes = new Hono();

const MODELS = {
  FAST: 'gemini-2.5-flash',
  THINKING: 'gemini-3.1-pro-preview',
  IMAGE: 'gemini-2.5-flash-image', // Default to Flash Image to avoid 403 Permission Denied on Pro
  IMAGE_PRO: 'gemini-3-pro-image-preview',
};

const SYSTEM_INSTRUCTION = `
You are an expert frontend web developer and architect. Your task is to generate high-quality, responsive, and accessible web artifacts based on user prompts.

You must output your response in pure JSON format containing an array of files.
The JSON structure must be:
{
  "files": [
    {
      "name": "filename.extension",
      "content": "file content here",
      "type": "html" | "css" | "js" | "json"
    }
  ]
}

Input Context:
If the user provides "Current File Context", it means they want to MODIFY or ADD to the existing application. 
- You must return the FULL content of all files, including those that didn't change (to ensure consistency).
- Apply the requested changes intelligently.
- Do not remove files unless explicitly asked or if they become obsolete.

Directives:
1. Mobile-First: All CSS should use Tailwind CSS (via CDN) and prioritize mobile layouts. Use <script src="https://cdn.tailwindcss.com"></script>
2. Self-Contained: Ideally, for simple requests, combine CSS and JS into a single index.html unless the complexity demands separation.
3. No Bundlers: Do not use import/export syntax that requires a bundler (like Webpack/Vite). Use standard ES modules or global scripts that work directly in the browser.
4. Icons: Use Lucide icons via a CDN script or SVG strings if needed, or FontAwesome CDN.
5. Aesthetics: Use modern design principles, whitespace, and good typography.
6. Images: Use https://picsum.photos/WIDTH/HEIGHT for placeholders.

If the user asks for a complex app (e.g., Task Manager), separate into index.html, styles.css, and app.js.
If the user asks for a simple bio, keep it in one index.html.
`;

const getClient = (c: any) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

generateRoutes.post('/generate-code', async (c) => {
    try {
        const body = await c.req.json();
        const prompt = validateString(body.prompt, 'prompt');
        const useThinking = body.useThinking;
        const attachments = body.attachments || [];
        const currentFiles = body.currentFiles || [];
        
        const ai = getClient(c);
        const modelName = useThinking ? MODELS.THINKING : MODELS.FAST;

        let finalPrompt = prompt;

        if (currentFiles.length > 0) {
            const fileContext = currentFiles.map((f: any) => {
                let content = f.content;
                if (f.type === 'image' || (f.content.startsWith('data:image') && f.content.length > 200)) {
                    content = `[IMAGE_ASSET_DATA_PRESERVED_BY_SYSTEM]`;
                }
                return `--- START OF FILE ${f.name} ---\n${content}\n--- END OF FILE ${f.name} ---`;
            }).join('\n\n');

            finalPrompt = `Task: Update the following web application based on this request: "${prompt}"

Current File Context:
${fileContext}

Please return the full updated set of files.
If you see [IMAGE_ASSET_DATA_PRESERVED_BY_SYSTEM] in a file, please return the file with exactly that placeholder content. Do not attempt to invent base64 data.`;
        }

        const contents: any[] = [finalPrompt];

        if (attachments.length > 0) {
            attachments.forEach((att: any) => {
                contents.push({
                    inlineData: {
                        data: att.base64.split(',')[1],
                        mimeType: att.mimeType
                    }
                });
            });
        }

        const responseStream = await ai.models.generateContentStream({
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
        });

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF Code Generation Error:", error);
        return c.json({ error: error.message }, 500);
    }
});

generateRoutes.post('/generate-image', async (c) => {
    try {
        const body = await c.req.json();
        const prompt = validateString(body.prompt, 'prompt');
        const size = body.size;
        const ai = getClient(c);
        
        const response = await ai.models.generateImages({
            model: MODELS.IMAGE,
            prompt: prompt,
            config: {
                aspectRatio: size,
                outputMimeType: 'image/jpeg',
                numberOfImages: 1
            }
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const image = response.generatedImages[0];
            return c.json({ data: `data:${image?.image?.mimeType || 'image/jpeg'};base64,${image?.image?.imageBytes}` });
        }

        throw new Error("No image data found in Gemini response");

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF Image Generation Error:", error);
        return c.json({ error: error.message }, 500);
    }
});

generateRoutes.post('/plan-images', async (c) => {
    try {
        const body = await c.req.json();
        const assets = validateArray(body.assets, 'assets');
        const userInstruction = validateString(body.userInstruction, 'userInstruction');
        const ai = getClient(c);

        const assetsContext = assets.map((a: any) => `
ID: ${a.id}
Current URL: ${a.url}
Context in Code: ${a.context}
`).join('\\n---\\n');

        const prompt = `
You are an Asset Director for a web project.
User Instruction: "${userInstruction}"

We need to replace the following existing images to match the user's instruction.
Analyze the 'Context in Code' for each image to understand its role.
Generate a specific, high-quality image generation prompt for each asset.

Input Assets:
${assetsContext}

Return a JSON object with this structure:
{
  "plan": [
    {
      "assetId": "string (matching Input ID)",
      "prompt": "Detailed image generation prompt",
      "suggestedName": "filename.png"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
            model: MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    assetId: { type: Type.STRING },
                                    prompt: { type: Type.STRING },
                                    suggestedName: { type: Type.STRING }
                                },
                                required: ["assetId", "prompt", "suggestedName"]
                            }
                        }
                    },
                    required: ["plan"]
                }
            }
        });

        const text = response.text;
        if (!text) return c.json({ plan: [] });
        
        const parsed = JSON.parse(text);
        return c.json({ plan: parsed.plan || [] });

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF Planning Error:", error);
        return c.json({ error: error.message }, 500);
    }
});

generateRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const script = validateString(body.script, 'script');
        const targets = validateArray(body.targets, 'targets');
        const ai = getClient(c);

        const prompt = `
You are an expert Software Architect.
The user wants to build a project based on the following script:
"${script}"

They have selected the following deployment targets:
${targets.join(", ")}

Your task is to compile this into an executable plan containing blueprints for each target.
Return a JSON object with this structure:
{
  "projectTitle": "String",
  "projectDescription": "String",
  "blueprints": [
    {
      "targetId": "String (matching one of the input targets)",
      "wireframeDesc": "String (detailed description of the layout and UI)",
      "features": ["String"]
    }
  ]
}
`;

        const response = await ai.models.generateContent({
            model: MODELS.THINKING,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectTitle: { type: Type.STRING },
                        projectDescription: { type: Type.STRING },
                        blueprints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    targetId: { type: Type.STRING },
                                    wireframeDesc: { type: Type.STRING },
                                    features: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    }
                                },
                                required: ["targetId", "wireframeDesc", "features"]
                            }
                        }
                    },
                    required: ["projectTitle", "projectDescription", "blueprints"]
                }
            }
        });

        const text = response.text;
        if (!text) return c.json({ error: "No text generated" }, 500);
        
        const parsed = JSON.parse(text);
        return c.json(parsed);

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF Blueprint Generation Error:", error);
        return c.json({ error: error.message }, 500);
    }
});
