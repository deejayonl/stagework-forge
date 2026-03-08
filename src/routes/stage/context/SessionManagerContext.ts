import { createContext, useContext } from 'react';
import type { ChatSession } from '../api/useSessionManager.ts';
import type { ChatContext } from '../api/hooks.ts';

export interface SessionManagerContextType {
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

export const SessionManagerCtx = createContext<SessionManagerContextType | null>(null);

export function useSessionManagerCtx(): SessionManagerContextType {
  const ctx = useContext(SessionManagerCtx);
  if (!ctx) throw new Error('useSessionManagerCtx must be used within SessionManagerProvider');
  return ctx;
}
