// ============================================================================
// History Routes — Past performance records
// ============================================================================

import { Hono } from 'hono';
import { historyStore } from '../services/history-store.js';

export const historyRoutes = new Hono();

historyRoutes.get('/', (c) => {
  return c.json(historyStore.getAll());
});

historyRoutes.get('/:id', (c) => {
  const id = c.req.param('id');
  const entry = historyStore.get(id);

  if (!entry) {
    return c.json({ error: 'History entry not found' }, 404);
  }

  return c.json(entry);
});
