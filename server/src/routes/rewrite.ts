import { Hono } from 'hono';
import { GoogleGenAI } from "@google/genai";
import { validateString, ValidationError } from '../utils/validate.js';

export const rewriteRoutes = new Hono();

const SYSTEM_INSTRUCTION = `
You are an expert copywriter. 
Your task is to take a given text and rewrite it based on the specified tone or instruction.
You must return ONLY the rewritten text string. Do not use markdown blocks. Do not explain.
Keep the length similar unless instructed otherwise.
`;

const getClient = (c: any) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

rewriteRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const text = validateString(body.text, 'text');
        const tone = validateString(body.tone || 'professional', 'tone');
        
        const ai = getClient(c);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Rewrite this text in a ${tone} tone:\n\n${text}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        const rewrittenText = response.text || text;
        const cleanText = rewrittenText.trim();

        return c.json({ text: cleanText });

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF Rewrite Error:", error);
        return c.json({ error: error.message }, 500);
    }
});
