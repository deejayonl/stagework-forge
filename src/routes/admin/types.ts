export interface Session {
  key: string
  message_count: number
  updated: number
  created: number
}

export interface Subagent {
  id: string
  task: string
  label: string
  status: string
  created: number
}

export interface SystemStatus {
  model: string
  ready: boolean
  sessions: Session[]
  subagents: Subagent[]
  uptime: string
  workspace: string
}
