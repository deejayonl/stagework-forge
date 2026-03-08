import type { ReactNode } from 'react'
import { Ghost } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: ReactNode
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-[var(--border-subtle)] rounded-2xl gap-3 bg-[var(--bg-hover)]">
      <span className="text-[var(--text-muted)] opacity-30">
        {icon ?? <Ghost size={32} />}
      </span>
      <span className="text-xs font-medium text-[var(--text-muted)] opacity-50">
        {message}
      </span>
    </div>
  )
}
