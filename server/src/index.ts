// ============================================================================
// Server Entry — Start Hono BFF API
// ============================================================================

import { serve } from '@hono/node-server';
import { app } from './app.js';
import { WebSocketServer, WebSocket } from 'ws';

const port = 3001;

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Stagework BFF listening on http://localhost:${info.port}`);
});

// Setup WebSocket Live Sync
const wss = new WebSocketServer({ server: server as any });
const projectClients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '', `http://${host}`);
  
  if (!url.pathname.startsWith('/sync/')) {
    ws.close(1008, 'Invalid path');
    return;
  }

  const projectId = url.pathname.replace('/sync/', '');
  if (!projectId) {
    ws.close(1008, 'Project ID is required');
    return;
  }

  if (!projectClients.has(projectId)) {
    projectClients.set(projectId, new Set());
  }
  projectClients.get(projectId)!.add(ws);

  console.log(`[WS] Client connected for project ${projectId}`);

  ws.on('message', (message) => {
    // Broadcast the message to all other clients connected to the SAME project
    const clients = projectClients.get(projectId);
    if (clients) {
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message, { binary: true });
        }
      }
    }
  });

  ws.on('close', () => {
    projectClients.get(projectId)?.delete(ws);
    if (projectClients.get(projectId)?.size === 0) {
      projectClients.delete(projectId);
    }
    console.log(`[WS] Client disconnected for project ${projectId}`);
  });
});

process.on('SIGINT', () => { process.exit(0); });
process.on('SIGTERM', () => { process.exit(0); });
