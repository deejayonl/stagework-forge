const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/src/routes/deploy.ts');
let content = fs.readFileSync(filePath, 'utf8');

const domainEndpoint = `

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
    return c.json({ 
      success: true, 
      domain, 
      message: \`Domain \${domain} configured successfully. DNS verification pending.\` 
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
`;

if (!content.includes('/domain/:id')) {
  content += domainEndpoint;
  fs.writeFileSync(filePath, content);
  console.log('Added domain endpoints to deploy.ts');
} else {
  console.log('Domain endpoints already exist');
}
