// React hooks for chat state management — streaming + live activity

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, HistoryEntry, TaskStatus } from './types.ts';
import { sendTask, subscribeToTask, cancelTask, getHistory } from './client.ts';

export interface ChatContext {
  messages: ChatMessage[];
  isRunning: boolean;
  error: string | null;
  sessionKey: string | null;
  activeTool: string | null;
  toolsUsed: string[];
  elapsed: number;
  send: (message: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useStreamingChat(): ChatContext {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const taskIdRef = useRef<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const clearStream = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    taskIdRef.current = null;
    setActiveTool(null);
    setToolsUsed([]);
    setElapsed(0);
  }, []);

  const cancel = useCallback(() => {
    if (taskIdRef.current) {
      cancelTask(taskIdRef.current).catch(() => {});
    }
    clearStream();
    setIsRunning(false);
  }, [clearStream]);

  const send = useCallback(
    async (message: string) => {
      // If already running, interrupt: cancel current and re-send
      if (isRunning && taskIdRef.current) {
        await cancelTask(taskIdRef.current).catch(() => {});
        clearStream();
      }

      setError(null);
      setIsRunning(true);
      setActiveTool(null);
      setToolsUsed([]);
      setElapsed(0);

      const userMsg: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const { taskId, sessionKey: sk } = await sendTask(message, sessionKey ?? undefined);
        taskIdRef.current = taskId;
        setSessionKey(sk);

        // Subscribe to SSE stream
        const unsub = subscribeToTask(taskId, (event) => {
          switch (event.type) {
            case 'status': {
              const s = event.data as TaskStatus;
              setActiveTool(s.activeTool);
              setToolsUsed(s.toolsUsed);
              setElapsed(s.elapsed);
              break;
            }
            case 'complete': {
              const d = event.data as { response: string; sessionKey: string };
              setSessionKey(d.sessionKey);
              const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: d.response,
                timestamp: Date.now(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
              clearStream();
              setIsRunning(false);
              break;
            }
            case 'error': {
              const e = event.data as { message: string };
              setError(e.message);
              clearStream();
              setIsRunning(false);
              break;
            }
          }
        });

        unsubRef.current = unsub;
      } catch (err) {
        setError(String(err));
        setIsRunning(false);
      }
    },
    [sessionKey, isRunning, clearStream]
  );

  const reset = useCallback(() => {
    cancel();
    setMessages([]);
    setError(null);
    setSessionKey(null);
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  return { messages, isRunning, error, sessionKey, activeTool, toolsUsed, elapsed, send, cancel, reset };
}

/** Backward-compatible useChat that delegates to useStreamingChat */
export function useChat(): ChatContext {
  return useStreamingChat();
}

export function useOrchInfo() {
  const [info, setInfo] = useState<OrchInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrchInfo();
      setInfo(data);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { info, loading, refresh };
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setEntries(data);
    } catch {
      // silently fail — history is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
