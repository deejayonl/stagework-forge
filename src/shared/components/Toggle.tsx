import { useState } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      {label && (
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          {label}
        </span>
      )}
      <div className="relative">
        <div 
          className={`w-10 h-6 rounded-full transition-colors duration-300 ease-spring ${
            checked ? 'bg-indigo-500' : 'bg-[var(--bg-hover)]'
          }`}
        />
        <div 
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-500 ease-spring shadow-sm ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  )
}
