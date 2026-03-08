import { Hono } from 'hono';
import { projectStore } from '../services/project-store.js';

export const projectRoutes = new Hono();

// List all projects
projectRoutes.get('/', async (c) => {
  try {
    const projects = await projectStore.list();
    return c.json({ projects });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get a specific project
projectRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const project = await projectStore.get(id);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json({ project });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Create or update a project
projectRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const project = await projectStore.save(body);
    return c.json({ project });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Upload/Save an asset to a project
projectRoutes.post('/:id/assets', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, data } = body;
    
    if (!name || !data) {
      return c.json({ error: 'Asset name and data are required' }, 400);
    }

    const project = await projectStore.get(id);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updatedAssets = { ...(project.assets || {}) };
    updatedAssets[name] = data;

    const updatedProject = await projectStore.save({ ...project, assets: updatedAssets });
    return c.json({ success: true, assets: updatedProject.assets });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
