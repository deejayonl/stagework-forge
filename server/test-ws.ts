import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { WebSocketServer } from 'ws';

const app = new Hono();
app.get('/', (c) => c.text('Hello'));

const server = serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const wss = new WebSocketServer({ server: server as any });
wss.on('connection', (ws) => {
  ws.send('connected');
});
console.log('Server is', server);
process.exit(0);
