// ============================================================================
// Hono App — CORS, routes, static file serving
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { chatRoutes } from './routes/chat.js';
import { historyRoutes } from './routes/history.js';
import { generateRoutes } from './routes/generate.js';
import { mutateRoutes } from './routes/mutate.js';
import { projectRoutes } from './routes/projects.js';
import { exportRoutes } from './routes/export.js';
import { autofixRoutes } from './routes/autofix.js';
import { deployRoutes } from './routes/deploy.js';
import { proxyRoutes } from './routes/proxy.js';
import { rewriteRoutes } from './routes/rewrite.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { assetsRoutes } from './routes/assets.js';
import { generateImageRoutes } from './routes/generate-image.js';
import { auditRoutes } from './routes/audit.js';
import { logicRoutes } from './routes/logic.js';

export const app = new Hono();

// CORS for Vite dev server
app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
);

// Rate Limiting on heavy endpoints
app.use('/api/generate/*', rateLimiter({ limit: 5, windowMs: 60000 }));
app.use('/api/mutate/*', rateLimiter({ limit: 20, windowMs: 60000 }));
app.use('/api/autofix/*', rateLimiter({ limit: 10, windowMs: 60000 }));

// Static file serving for uploads
app.use('/uploads/*', serveStatic({ root: './public' }));

// Routes
app.route('/api/chat', chatRoutes);
app.route('/api/history', historyRoutes);
app.route('/api/generate', generateRoutes);
app.route('/api/mutate', mutateRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/export', exportRoutes);
app.route('/api/autofix', autofixRoutes);
app.route('/api/deploy', deployRoutes);
app.route('/api/proxy', proxyRoutes);
app.route('/api/rewrite', rewriteRoutes);
app.route('/api/assets', assetsRoutes);
app.route('/api/generate-image', generateImageRoutes);
app.route('/api/audit', auditRoutes);
app.route('/api/generate-logic', logicRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});
