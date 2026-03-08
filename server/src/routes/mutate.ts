import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { GoogleGenAI } from "@google/genai";
import { validateString, validateArray, ValidationError } from '../utils/validate.js';

export const mutateRoutes = new Hono();

const MODELS = {
  FAST: 'gemini-2.5-flash',
  THINKING: 'gemini-3.1-pro-preview',
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
`;

const getClient = (c: any) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

mutateRoutes.post('/', async (c) => {
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
        console.error("BFF Mutation Error:", error);
        return c.json({ error: error.message }, 500);
    }
});
