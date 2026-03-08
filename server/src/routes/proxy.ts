import { Hono } from 'hono';
import { projectStore } from '../services/project-store.js';

export const proxyRoutes = new Hono();

proxyRoutes.all('/:projectId/:apiId', async (c) => {
  const projectId = c.req.param('projectId');
  const apiId = c.req.param('apiId');

  const project = await projectStore.get(projectId);
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  const apiDef = project.apis?.[apiId];
  if (!apiDef) {
    return c.json({ error: 'API endpoint not found in project' }, 404);
  }

  try {
    const method = apiDef.method;
    const url = new URL(apiDef.url);
    
    // Copy query params from incoming request
    const incomingUrl = new URL(c.req.url);
    incomingUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const headers = new Headers(apiDef.headers || {});
    
    let body: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = c.req.header('content-type') || '';
      if (contentType.includes('application/json')) {
        const textBody = await c.req.text();
        body = textBody || apiDef.body;
      } else {
        body = apiDef.body;
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });

    const responseText = await response.text();
    const responseHeaders = new Headers(response.headers);
    
    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': responseHeaders.get('Content-Type') || 'application/json',
      }
    });

  } catch (error: any) {
    return c.json({ error: 'Proxy request failed', details: error.message }, 500);
  }
});
