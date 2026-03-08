import { Terminal, Activity } from 'lucide-react'

interface LogPanelProps {
  logs: string
  service: string
}

export function LogPanel({ logs, service }: LogPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* System Logs */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
          <Terminal size={16} />
          System Logs
        </h2>
        <div className="p-4 bg-[#0a0a0a] border border-[#222] shadow-inner text-green-400 font-mono text-[10px] rounded-2xl h-[400px] overflow-auto whitespace-pre-wrap selection:bg-white selection:text-black hover:border-[#333] transition-colors">
          {logs || 'No logs available'}
        </div>
      </section>

      {/* Service Status */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
          <Activity size={16} />
          Service Status
        </h2>
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-inner rounded-2xl h-[400px] overflow-auto font-mono text-[10px] text-[var(--text-primary)] whitespace-pre hover:border-[var(--border-strong)] transition-colors">
          {service || 'Loading service status...'}
        </div>
      </section>
    </div>
  )
}
