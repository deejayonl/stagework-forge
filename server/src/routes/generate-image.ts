import { Hono } from 'hono';
import OpenAI from 'openai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

export const generateImageRoutes = new Hono();

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Generate an image based on a prompt
generateImageRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { prompt } = body;
    const projectId = body.projectId || 'default';

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Initialize OpenAI client
    const authHeader = c.req.header('Authorization');
    let apiKey = process.env.OPENAI_API_KEY;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.split(' ')[1];
    }

    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not provided' }, 401);
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    });

    if (!response.data || !response.data[0] || !response.data[0].b64_json) {
      throw new Error('No image data returned from OpenAI');
    }

    const b64Json = response.data[0].b64_json;

    // Ensure directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Save the image locally
    const filename = `${projectId}-${randomUUID()}.png`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(b64Json, 'base64');
    
    await fs.writeFile(filePath, buffer);

    const host = c.req.header('host');
    const protocol = c.req.header('x-forwarded-proto') || 'http';
    const baseUrl = host?.includes('localhost') ? `${protocol}://${host}` : 'https://sgfbackend.deejay.onl';

    return c.json({ 
      success: true,
      url: `${baseUrl}/uploads/${filename}`
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return c.json({ error: error.message || 'Failed to generate image' }, 500);
  }
});
