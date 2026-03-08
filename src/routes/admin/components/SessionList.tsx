import { List, Clock, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import type { Session } from '../types'

interface SessionListProps {
  sessions: Session[]
}

export function SessionList({ sessions }: SessionListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
          <List size={16} />
          Active Sessions
        </h2>
        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-xl">
          {sessions.length} Total
        </span>
      </div>

      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.key}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-between group hover:border-[var(--accent-primary)]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-spring cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold truncate max-w-[200px] text-[var(--text-primary)]">
                {s.key}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <Clock size={12} />
                Updated {new Date(s.updated).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                  {s.message_count}
                </span>
                <span className="text-[8px] uppercase tracking-tight text-[var(--text-muted)] font-bold">
                  Msgs
                </span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <EmptyState message="No active sessions found" />}
      </div>
    </section>
  )
}
