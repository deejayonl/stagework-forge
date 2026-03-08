// ============================================================================
// HistoryStore — In-memory store for completed chat sessions
// ============================================================================

import type { HistoryEntry } from '../types/chat.js';

export type { HistoryEntry };

class HistoryStore {
  private entries: HistoryEntry[] = [];

  add(entry: HistoryEntry): void {
    this.entries.unshift(entry); // newest first
    if (this.entries.length > 100) {
      this.entries.pop();
    }
  }

  getAll(): HistoryEntry[] {
    return [...this.entries];
  }

  get(id: string): HistoryEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }
}

export const historyStore = new HistoryStore();
