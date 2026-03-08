import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { GoogleGenAI } from "@google/genai";

export const chatRoutes = new Hono();

const MODELS = {
  FAST: 'gemini-2.5-flash',
  THINKING: 'gemini-3.1-pro-preview',
};

const getClient = (c: any) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

chatRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { message, blueprintContext } = body;
        
        const ai = getClient(c);

        const prompt = `
You are a Staff Frontend Engineer and UX Architect.
The user is tuning a specific blueprint design on their canvas.
Here is the current blueprint context:
${JSON.stringify(blueprintContext, null, 2)}

User Request: "${message}"

Respond directly to the user with your tuning suggestions, updated wireframes, or new feature ideas. Keep your response concise, professional, and actionable. If you are providing an updated wireframe, format it clearly.
`;

        const responseStream = await ai.models.generateContentStream({
            model: MODELS.FAST,
            contents: prompt,
            config: {
                responseMimeType: "text/plain"
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
        console.error("BFF Chat Error:", error);
        return c.json({ error: error.message }, 500);
    }
});
