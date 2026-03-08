import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';

export const auditRoutes = new Hono();

function getProviderConfig(c: any) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token) return { provider: 'google', apiKey: token };
  }
  
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey) return { provider: 'google', apiKey: envKey };
  
  return null;
}

auditRoutes.post('/', async (c) => {
  try {
    const { html } = await c.req.json();
    if (!html) {
      return c.json({ error: 'HTML is required' }, 400);
    }

    const config = getProviderConfig(c);
    if (!config) {
      return c.json({ error: 'No API key provided' }, 401);
    }

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const prompt = `You are an expert web accessibility (A11y) and SEO auditor.
Review the following HTML code and provide a JSON response containing an audit.

Score out of 100 for both A11y and SEO.
List specific warnings. For each warning, include the type ('a11y' or 'seo'), a descriptive message, and the offending HTML snippet or element tag if applicable.

Return ONLY valid JSON matching this schema:
{
  "a11yScore": 95,
  "seoScore": 80,
  "warnings": [
    { "type": "a11y", "message": "Missing alt attribute on image", "element": "<img src='...' />" },
    { "type": "seo", "message": "Missing meta description", "element": "<head>" }
  ]
}

HTML to audit:
\`\`\`html
${html}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);

    return c.json(json);

  } catch (error: any) {
    console.error('[Audit API Error]', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

auditRoutes.post('/fix', async (c) => {
  try {
    const { html, warnings } = await c.req.json();
    if (!html || !warnings) {
      return c.json({ error: 'HTML and warnings are required' }, 400);
    }

    const config = getProviderConfig(c);
    if (!config) {
      return c.json({ error: 'No API key provided' }, 401);
    }

    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const prompt = `You are an expert web developer.
Fix the following HTML code based on these accessibility and SEO warnings:
${JSON.stringify(warnings, null, 2)}

Return ONLY the raw, fixed HTML string. Do not use markdown blocks. Do not add any conversational text.

Original HTML:
\`\`\`html
${html}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      }
    });

    let fixedHtml = response.text || html;
    fixedHtml = fixedHtml.replace(/^\`\`\`html/m, '').replace(/\`\`\`$/m, '').trim();

    return c.json({ html: fixedHtml });

  } catch (error: any) {
    console.error('[Audit Fix API Error]', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});
