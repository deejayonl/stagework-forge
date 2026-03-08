import { Hono } from 'hono';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const logicRoutes = new Hono();

logicRoutes.post('/', async (c) => {
  try {
    const { prompt } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: 'Missing GEMINI_API_KEY environment variable' }, 500);
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google('gemini-2.5-flash');

    const systemPrompt = `You are an expert vanilla JavaScript developer.
The user will describe an action or event handler logic.
Your job is to generate ONLY the raw JavaScript code that accomplishes this.
Do NOT include markdown formatting, do NOT include \`\`\`javascript or \`\`\` tags.
Do NOT include HTML script tags.
Just return the raw executable JavaScript string.
Assume this code will be executed in the global scope or directly inside an event handler attribute (like \`onclick="<your_code>"\`).
Use modern ES6+ syntax. Keep it concise.
If it involves fetching data, use \`fetch\` and \`async/await\` (using an IIFE if necessary, or just promises).
Example input: "Fetch weather for London and alert it"
Example output: fetch('https://wttr.in/London?format=3').then(r => r.text()).then(t => alert(t));`;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: `Generate JavaScript for this action: ${prompt}`
    });

    const cleanLogic = text.replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '').trim();

    return c.json({ logic: cleanLogic });
  } catch (error: any) {
    console.error('Logic generation error:', error);
    return c.json({ error: error.message || 'Failed to generate logic' }, 500);
  }
});
