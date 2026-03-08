import { createContext, useContext } from 'react';
import type { ChatContext } from './api/hooks.ts';

export const ChatCtx = createContext<ChatContext | null>(null);

export function useChatCtx(): ChatContext {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChatCtx must be used within ChatCtx.Provider');
  return ctx;
}
