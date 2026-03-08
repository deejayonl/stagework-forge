import { Hono } from 'hono';
import { GoogleGenAI } from "@google/genai";
import { validateString, ValidationError } from '../utils/validate.js';

export const autofixRoutes = new Hono();

const SYSTEM_INSTRUCTION = `
You are an expert UI/UX designer and accessibility auditor.
Your task is to take a raw HTML snippet and fix its layout, contrast, padding, and accessibility issues.
You must return ONLY the fixed HTML string. Do not use markdown blocks. Do not explain.
Ensure it uses Tailwind CSS classes perfectly.
`;

const getClient = (c: any) => {
    const authHeader = c.req.header('Authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};

autofixRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const html = validateString(body.html, 'html');
        
        const ai = getClient(c);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Fix this HTML snippet:\n\n${html}`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        const fixedHtml = (response.text || html) as string;
        // Strip markdown if AI included it
        const cleanHtml = fixedHtml.replace(/```html\n?/, '').replace(/```\n?$/, '').trim();

        return c.json({ html: cleanHtml });

    } catch (error: any) {
        if (error instanceof ValidationError) return c.json({ error: error.message }, 400);
        console.error("BFF AutoFix Error:", error);
        return c.json({ error: error.message }, 500);
    }
});
