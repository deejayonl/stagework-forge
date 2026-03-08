// ============================================================================
// Server Entry — Start Hono BFF API
// ============================================================================

import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = 3001;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Stagework BFF listening on http://localhost:${info.port}`);
});

process.on('SIGINT', () => { process.exit(0); });
process.on('SIGTERM', () => { process.exit(0); });
