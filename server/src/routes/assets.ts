import { Hono } from 'hono';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

export const assetsRoutes = new Hono();

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

assetsRoutes.post('/upload/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId');
    const body = await c.req.parseBody();
    
    if (!body) {
      return c.json({ error: 'No form data provided' }, 400);
    }

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    const uploadedUrls: string[] = [];
    const entries = Object.entries(body);
    
    for (const [_, value] of entries) {
      if (value instanceof File) {
        // Generate a unique filename
        const ext = path.extname(value.name) || '';
        const uniqueName = `${projectId}-${randomUUID()}${ext}`;
        const filePath = path.join(UPLOADS_DIR, uniqueName);
        
        // Convert File to ArrayBuffer to Buffer and save
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await fs.writeFile(filePath, buffer);
        
        // The URL path to access the file
        uploadedUrls.push(`/uploads/${uniqueName}`);
      }
    }

    if (uploadedUrls.length === 0) {
      return c.json({ error: 'No files uploaded' }, 400);
    }

    return c.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error('Error uploading assets:', error);
    return c.json({ error: 'Failed to upload assets' }, 500);
  }
});
