// Chat types — simple request/response model

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  sessionKey: string;
  isRunning: boolean;
  error: string | null;
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

export interface BFFStatus {
  model: string;
  ready: boolean;
  sessions: { key: string; message_count: number; created: number; updated: number }[];
  subagents: { id: string; label: string; status: string }[];
  uptime: string;
  workspace: string;
  active_request?: {
    prompt_preview: string;
    start_time: string;
    tools_used: string[];
  };
  active_tool?: {
    name: string;
    start_time: string;
  };
}

export interface BFFInfo {
  tools: { count: number; names: string[] };
  skills: { total: number; available: number; names: string[] };
}

export interface TaskStatus {
  activeTool: string | null;
  toolsUsed: string[];
  elapsed: number;
  promptPreview: string;
}

export interface StreamEvent {
  type: 'status' | 'complete' | 'error';
  data: TaskStatus | { response: string; sessionKey: string } | { message: string; code?: number };
}
