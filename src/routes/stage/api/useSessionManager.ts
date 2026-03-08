import { useState, useCallback } from 'react';
import type { ChatMessage } from './types.ts';
import type { ChatContext } from './hooks.ts';
import { sendMessage } from './client.ts';

const MAX_SESSIONS = 6;

export interface ChatSession {
  id: string;
  label: string;
  messages: ChatMessage[];
  sessionKey: string | null;
  isRunning: boolean;
  error: string | null;
  createdAt: number;
}

export interface SessionManagerState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isMultiSession: boolean;
  canCreateSession: boolean;
  createSession: (task: string) => void;
  closeSession: (id: string) => void;
  closeAllSessions: () => void;
  focusSession: (id: string) => void;
  activeChat: ChatContext;
}

let sessionCounter = 0;

function generateSessionId(): string {
  return `session-${Date.now()}-${++sessionCounter}`;
}

export function useSessionManager(): SessionManagerState {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createSession = useCallback(
    (task: string) => {
      setSessions((prev) => {
        if (prev.length >= MAX_SESSIONS) return prev;

        const id = generateSessionId();
        const label = task.length > 40 ? task.slice(0, 40) + '...' : task;
        const newSession: ChatSession = {
          id,
          label,
          messages: [{ role: 'user', content: task, timestamp: Date.now() }],
          sessionKey: null,
          isRunning: true,
          error: null,
          createdAt: Date.now(),
        };

        // Send to BFF asynchronously
        sendMessage(task)
          .then((res) => {
            setSessions((curr) =>
              curr.map((s) =>
                s.id === id
                  ? {
                      ...s,
                      sessionKey: res.sessionKey,
                      messages: [...s.messages, { role: 'assistant' as const, content: res.response, timestamp: Date.now() }],
                      isRunning: false,
                    }
                  : s
              )
            );
          })
          .catch((err) => {
            setSessions((curr) =>
              curr.map((s) =>
                s.id === id ? { ...s, error: String(err), isRunning: false } : s
              )
            );
          });

        setActiveSessionId(id);
        return [...prev, newSession];
      });
    },
    []
  );

  const closeSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      setActiveSessionId((currentActive) => {
        if (currentActive === id) {
          return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        }
        return currentActive;
      });
      return remaining;
    });
  }, []);

  const closeAllSessions = useCallback(() => {
    setSessions([]);
    setActiveSessionId(null);
  }, []);

  const focusSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  // Build the active session's ChatContext for Dashboard backward compat
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? null;

  const activeChat: ChatContext = {
    messages: activeSession?.messages ?? [],
    isRunning: activeSession?.isRunning ?? false,
    error: activeSession?.error ?? null,
    sessionKey: activeSession?.sessionKey ?? null,
    activeTool: null,
    toolsUsed: [],
    elapsed: 0,
    cancel: () => {},
    send: async (message: string) => {
      if (sessions.length === 0) {
        createSession(message);
      } else if (activeSession?.isRunning) {
        createSession(message);
      } else if (activeSession) {
        // Send follow-up in existing session
        const id = activeSession.id;
        setSessions((curr) =>
          curr.map((s) =>
            s.id === id
              ? {
                  ...s,
                  messages: [...s.messages, { role: 'user' as const, content: message, timestamp: Date.now() }],
                  isRunning: true,
                  error: null,
                }
              : s
          )
        );

        try {
          const res = await sendMessage(message, activeSession.sessionKey ?? undefined);
          setSessions((curr) =>
            curr.map((s) =>
              s.id === id
                ? {
                    ...s,
                    sessionKey: res.sessionKey,
                    messages: [...s.messages, { role: 'assistant' as const, content: res.response, timestamp: Date.now() }],
                    isRunning: false,
                  }
                : s
            )
          );
        } catch (err) {
          setSessions((curr) =>
            curr.map((s) =>
              s.id === id ? { ...s, error: String(err), isRunning: false } : s
            )
          );
        }
      }
    },
    reset: () => {
      if (activeSession) closeSession(activeSession.id);
    },
  };

  return {
    sessions,
    activeSessionId,
    isMultiSession: sessions.length > 1,
    canCreateSession: sessions.length < MAX_SESSIONS,
    createSession,
    closeSession,
    closeAllSessions,
    focusSession,
    activeChat,
  };
}
