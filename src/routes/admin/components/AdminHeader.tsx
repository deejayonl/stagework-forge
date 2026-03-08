import { Settings } from 'lucide-react'

interface AdminHeaderProps {
  uptime: string
  ready: boolean
}

export function AdminHeader({ uptime, ready }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--text-primary)] flex items-center justify-center">
          <Settings size={14} className="text-[var(--bg-surface)]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
            Stagework Admin
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
            Command Center
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
            Uptime
          </span>
          <span className="text-xs font-mono text-[var(--text-primary)]">{uptime}</span>
        </div>
        <div className="h-6 w-px bg-[var(--border-subtle)]" />
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            ready
              ? 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)]'
              : 'bg-[var(--color-error)] shadow-[0_0_8px_var(--color-error)]'
          }`}
        />
      </div>
    </header>
  )
}
