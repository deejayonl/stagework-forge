import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class WsManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      // Expecting URL like /preview-sync?projectId=123
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const projectId = url.searchParams.get('projectId');

      if (!projectId) {
        ws.close(1008, 'Project ID is required');
        return;
      }

      if (!this.clients.has(projectId)) {
        this.clients.set(projectId, new Set());
      }
      this.clients.get(projectId)!.add(ws);

      console.log(`[WS] Client connected for project ${projectId}`);

      ws.on('message', (message) => {
        // Broadcast the message to all other clients connected to the same project
        const clients = this.clients.get(projectId);
        if (clients) {
          for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message.toString());
            }
          }
        }
      });

      ws.on('close', () => {
        this.clients.get(projectId)?.delete(ws);
        console.log(`[WS] Client disconnected for project ${projectId}`);
      });
    });
  }

  public broadcast(projectId: string, message: any) {
    const clients = this.clients.get(projectId);
    if (clients) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    }
  }
}

let wsManager: WsManager | null = null;

export const initWsManager = (server: Server) => {
  wsManager = new WsManager(server);
};

export const getWsManager = () => wsManager;
