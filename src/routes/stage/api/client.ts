// API client — fetch wrapper for BFF chat proxy with SSE streaming support

import type { HistoryEntry, BFFStatus, BFFInfo } from './types.ts';
import { getApiBase } from '../../../shared/api/api-client';

const getBaseUrl = () => `${getApiBase()}/api`;

export interface ChatResponse {
  response: string;
  sessionKey: string;
}

export interface SendTaskResponse {
  taskId: string;
  sessionKey: string;
}

export type StreamCallback = (event: {
  type: 'status' | 'complete' | 'error';
  data: any;
}) => void;

/** Non-blocking send — returns taskId immediately */
export async function sendTask(message: string, sessionKey?: string): Promise<SendTaskResponse> {
  const res = await fetch(`${getBaseUrl()}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionKey }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Send failed (${res.status}): ${body}`);
  }
  return res.json();
}

/** Subscribe to SSE stream for a task. Returns an unsubscribe function. */
export function subscribeToTask(taskId: string, onEvent: StreamCallback): () => void {
  const source = new EventSource(`${getBaseUrl()}/chat/${taskId}/stream`);

  const handleEvent = (type: string) => (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onEvent({ type: type as 'status' | 'complete' | 'error', data });
    } catch {
      // ignore parse errors
    }
  };

  source.addEventListener('status', handleEvent('status'));
  source.addEventListener('complete', handleEvent('complete'));
  source.addEventListener('error', handleEvent('error'));

  // Also handle native EventSource errors (connection lost, etc.)
  source.onerror = () => {
    // EventSource will auto-reconnect; if task is done the stream closes
    // We only need to clean up if the source is CLOSED
    if (source.readyState === EventSource.CLOSED) {
      source.close();
    }
  };

  return () => {
    source.close();
  };
}

/** Cancel a running task */
export async function cancelTask(taskId: string): Promise<void> {
  await fetch(`${getBaseUrl()}/chat/${taskId}/cancel`, { method: 'POST' });
}

/** Get BFF info (tools + skills list) */
export async function getBFFInfo(): Promise<BFFInfo | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/chat/info`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Legacy: blocking send (still useful for simple cases) */
export async function sendMessage(message: string, sessionKey?: string): Promise<ChatResponse> {
  const res = await fetch(`${getBaseUrl()}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionKey }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Send failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const res = await fetch(`${getBaseUrl()}/history`);
  if (!res.ok) throw new Error(`History fetch failed: ${res.statusText}`);
  return res.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${getBaseUrl()}/health`);
  if (!res.ok) throw new Error('Server unreachable');
  return res.json();
}

export async function getBFFStatus(): Promise<BFFStatus | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/chat/status`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
