import { useState, useEffect } from 'react'
import { MessageSquare, Bot, Brain, FolderLock, AlertCircle, Loader2 } from 'lucide-react'
import { getApiBase } from '@/shared/api/api-client'
import { StatCard } from '@/shared/components/StatCard'
import { Toggle } from '@/shared/components/Toggle'
import { AdminHeader } from './components/AdminHeader'
import { SessionList } from './components/SessionList'
import { SubagentList } from './components/SubagentList'
import { LogPanel } from './components/LogPanel'
import { ApiKeyPanel } from './components/ApiKeyPanel'
import type { SystemStatus } from './types'

const REFRESH_INTERVAL = 5_000

export default function AdminView() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [logs, setLogs] = useState('')
  const [service, setService] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${getApiBase()}/admin/status`)
      if (!res.ok) throw new Error('Failed to fetch status')
      const data: SystemStatus = await res.json()
      setStatus(data)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${getApiBase()}/admin/logs`)
      const data = await res.json()
      setLogs(data.output ?? '')
    } catch {
      /* silently ignore log fetch failures */
    }
  }

  const fetchService = async () => {
    try {
      const res = await fetch(`${getApiBase()}/admin/service`)
      const data = await res.json()
      setService(data.output ?? '')
    } catch {
      /* silently ignore service fetch failures */
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchLogs()
    fetchService()

    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchStatus()
        fetchLogs()
        fetchService()
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // ---------- Loading state ----------
  if (loading && !status) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[var(--bg-main)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-[var(--text-muted)]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Initializing Dashboard...
          </span>
        </div>
      </div>
    )
  }

  // ---------- Derived values ----------
  const modelShort = status?.model
    ? status.model.split('-')[1]?.toUpperCase() ?? status.model
    : 'N/A'

  return (
    <div className="min-h-full bg-[var(--bg-main)] pb-16">
      <AdminHeader uptime={status?.uptime ?? '0s'} ready={status?.ready ?? false} />

      <main className="max-w-[1200px] mx-auto mt-8 px-6 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="p-4 bg-[color-mix(in_oklch,var(--color-error)_10%,transparent)] border border-[color-mix(in_oklch,var(--color-error)_20%,transparent)] rounded-xl text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            API Gateway Offline. Please configure your API key below.
          </div>
        )}

        <div className="flex justify-end mb-4">
          <div onClick={() => setAutoRefresh(!autoRefresh)}>
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Auto-Refresh" />
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Sessions"
            value={status?.sessions.length ?? 0}
            icon={<MessageSquare size={20} />}
            accentColor="oklch(60% 0.15 250)"
          />
          <StatCard
            label="Running Subagents"
            value={status?.subagents.length ?? 0}
            icon={<Bot size={20} />}
            accentColor="oklch(60% 0.15 280)"
          />
          <StatCard
            label="Core Model"
            value={modelShort}
            subValue={status?.model}
            icon={<Brain size={20} />}
            accentColor="oklch(60% 0.15 320)"
          />
          <StatCard
            label="Workspace"
            value="Isolated"
            subValue={status?.workspace}
            icon={<FolderLock size={20} />}
            accentColor="oklch(60% 0.15 140)"
          />
        </section>

        {/* API Keys Configuration */}
        <ApiKeyPanel />

        {/* Sessions & Subagents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SessionList sessions={status?.sessions ?? []} />
          <SubagentList subagents={status?.subagents ?? []} />
        </div>

        {/* Logs & Service */}
        <LogPanel logs={logs} service={service} />
      </main>
    </div>
  )
}
