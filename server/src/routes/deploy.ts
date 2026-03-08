import { Hono } from 'hono';
import { projectStore } from '../services/project-store.js';

export const deployRoutes = new Hono();

deployRoutes.get('/github/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const framework = c.req.query('framework') || 'html';
    const project = await projectStore.get(id);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pushing to GitHub...</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader { border: 4px solid #333; border-top: 4px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h1 { font-size: 24px; font-weight: 500; margin-bottom: 8px; }
          p { color: #888; font-size: 14px; }
          .success { display: none; flex-direction: column; align-items: center; }
          .success svg { width: 48px; height: 48px; color: #fff; margin-bottom: 16px; }
          .success a { color: #fff; text-decoration: none; margin-top: 16px; border: 1px solid #333; padding: 8px 16px; border-radius: 4px; transition: all 0.2s; }
          .success a:hover { background: #111; border-color: #fff; }
        </style>
      </head>
      <body>
        <div class="deploying" id="deploying">
          <div class="loader"></div>
          <h1>Pushing to GitHub</h1>
          <p>Creating repository and committing ${framework} files...</p>
        </div>
        <div class="success" id="success">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <h1>Repository Created</h1>
          <p>Your project has been successfully pushed to GitHub.</p>
          <a href="#" onclick="alert('This is a simulated deployment environment. In production, this would open your new GitHub repository.')">View Repository</a>
        </div>
        
        <script>
          setTimeout(() => {
            document.getElementById('deploying').style.display = 'none';
            document.getElementById('success').style.display = 'flex';
          }, 3000);
        </script>
      </body>
      </html>
    `;
    
    return c.html(html);

  } catch (error) {
    console.error('GitHub push error:', error);
    return c.json({ error: 'Failed to push to GitHub' }, 500);
  }
});


deployRoutes.get('/vercel/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const framework = c.req.query('framework') || 'html';
    const project = await projectStore.get(id);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deploying to Vercel...</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader { border: 4px solid #333; border-top: 4px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h1 { font-size: 24px; font-weight: 500; margin-bottom: 8px; }
          p { color: #888; font-size: 14px; }
          .success { display: none; flex-direction: column; align-items: center; }
          .success svg { width: 48px; height: 48px; color: #0070f3; margin-bottom: 16px; }
          .success a { color: #fff; text-decoration: none; margin-top: 16px; border: 1px solid #333; padding: 8px 16px; border-radius: 4px; transition: all 0.2s; }
          .success a:hover { background: #111; border-color: #0070f3; }
        </style>
      </head>
      <body>
        <div class="deploying" id="deploying">
          <div class="loader"></div>
          <h1>Deploying to Vercel</h1>
          <p>Packaging project as ${framework}...</p>
        </div>
        <div class="success" id="success">
          <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
          <h1>Deployment Successful</h1>
          <p>Your project is now live on the edge.</p>
          <a href="#" onclick="alert('This is a simulated deployment environment. In production, this would open your Vercel project URL.')">Visit Deployment</a>
        </div>
        
        <script>
          setTimeout(() => {
            document.getElementById('deploying').style.display = 'none';
            document.getElementById('success').style.display = 'flex';
          }, 3000);
        </script>
      </body>
      </html>
    `;
    
    return c.html(html);

  } catch (error) {
    console.error('Deploy error:', error);
    return c.json({ error: 'Failed to deploy project' }, 500);
  }
});


deployRoutes.post('/domain/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { domain } = await c.req.json();
    const project = await projectStore.get(id);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Simulated domain management
    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400);
    }

    // In a real app, we would configure the domain with Vercel or Cloudflare here
    await projectStore.save({ id, customDomain: domain });
    return c.json({ 
      success: true, 
      domain, 
      message: `Domain ${domain} configured successfully. DNS verification pending.` 
    });

  } catch (error) {
    console.error('Domain config error:', error);
    return c.json({ error: 'Failed to configure custom domain' }, 500);
  }
});

deployRoutes.get('/domain/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const project = await projectStore.get(id);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Return a mock domain if any (we could store this in the project store)
    const mockDomain = project.customDomain || null;
    
    return c.json({ 
      domain: mockDomain 
    });

  } catch (error) {
    console.error('Domain fetch error:', error);
    return c.json({ error: 'Failed to fetch custom domain' }, 500);
  }
});
