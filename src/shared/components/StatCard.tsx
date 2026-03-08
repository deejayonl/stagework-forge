import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: ReactNode
  accentColor?: string
}

export function StatCard({ label, value, subValue, icon, accentColor }: StatCardProps) {
  return (
    <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl space-y-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: accentColor ? `color-mix(in oklch, ${accentColor} 12%, transparent)` : 'var(--bg-hover)',
          color: accentColor ?? 'var(--text-secondary)',
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[100px]">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
