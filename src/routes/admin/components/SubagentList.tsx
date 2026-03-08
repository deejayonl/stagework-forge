import { Cpu } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import type { Subagent } from '../types'

interface SubagentListProps {
  subagents: Subagent[]
}

export function SubagentList({ subagents }: SubagentListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
          <Cpu size={16} />
          Managed Subagents
        </h2>
        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-xl">
          {subagents.length} Threads
        </span>
      </div>

      <div className="space-y-2">
        {subagents.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl space-y-3 group hover:border-[var(--color-success)]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-spring cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide bg-[color-mix(in_oklch,var(--color-success)_12%,transparent)] text-[var(--color-success)] px-2 py-0.5 rounded-xl">
                  {t.status}
                </span>
                <span className="text-xs font-bold tracking-tight text-[var(--text-primary)]">
                  {t.label || t.id}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {new Date(t.created).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] italic line-clamp-2 leading-relaxed">
              &ldquo;{t.task}&rdquo;
            </p>
          </div>
        ))}
        {subagents.length === 0 && <EmptyState message="No background tasks running" />}
      </div>
    </section>
  )
}
