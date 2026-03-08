// ============================================================================
// Chat Types — Simple types for orch chat proxy
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  sessionKey: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  taskDescription: string;
  status: 'running' | 'completed' | 'error';
  startedAt: number;
  completedAt: number | null;
  messageCount: number;
  error: string | null;
}
