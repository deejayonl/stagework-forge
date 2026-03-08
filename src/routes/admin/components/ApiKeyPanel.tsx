import { useState, useEffect } from 'react'
import { KeyRound, Eye, EyeOff, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Tooltip } from '@/shared/components/Tooltip'

// Placeholder for actual API key management endpoints
// You'll need to wire these up to the real backend later

interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
}

export function ApiKeyPanel() {
  const [keys, setKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    gemini: ''
  })
  
  const [showKeys, setShowKeys] = useState<Record<keyof ApiKeys, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load keys (mocked for now)
  useEffect(() => {
    // In a real app, you'd fetch the masked keys from the backend
    const savedKeys = localStorage.getItem('forge_api_keys')
    if (savedKeys) {
      try {
        setKeys(JSON.parse(savedKeys))
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      localStorage.setItem('forge_api_keys', JSON.stringify(keys))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleShow = (provider: keyof ApiKeys) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setKeys(prev => ({ ...prev, [provider]: value }))
  }

  return (
    <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold text-sm">
          <KeyRound size={18} className="text-indigo-500" />
          API Configuration
        </div>
        
        <Tooltip content="Save keys securely">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:-translate-y-0.5 hover:shadow-lg rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-spring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={14} />
                Saved
              </>
            ) : (
              <>
                <Save size={14} />
                Save Keys
              </>
            )}
          </button>
        </Tooltip>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* OpenAI */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.openai ? "text" : "password"}
                value={keys.openai}
                onChange={(e) => handleKeyChange('openai', e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:-translate-y-0.5 hover:border-indigo-500/50 shadow-sm transition-all duration-300 ease-spring font-mono placeholder:font-sans"
              />
              <Tooltip content={showKeys.openai ? "Hide Key" : "Reveal Key"}>
                <button
                  type="button"
                  onClick={() => toggleShow('openai')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full transition-all duration-300 ease-spring"
                >
                  {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Anthropic */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.anthropic ? "text" : "password"}
                value={keys.anthropic}
                onChange={(e) => handleKeyChange('anthropic', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:-translate-y-0.5 hover:border-indigo-500/50 shadow-sm transition-all duration-300 ease-spring font-mono placeholder:font-sans"
              />
              <Tooltip content={showKeys.anthropic ? "Hide Key" : "Reveal Key"}>
                <button
                  type="button"
                  onClick={() => toggleShow('anthropic')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full transition-all duration-300 ease-spring"
                >
                  {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Gemini */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKeys.gemini ? "text" : "password"}
                value={keys.gemini}
                onChange={(e) => handleKeyChange('gemini', e.target.value)}
                placeholder="AIza..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:-translate-y-0.5 hover:border-indigo-500/50 shadow-sm transition-all duration-300 ease-spring font-mono placeholder:font-sans"
              />
              <Tooltip content={showKeys.gemini ? "Hide Key" : "Reveal Key"}>
                <button
                  type="button"
                  onClick={() => toggleShow('gemini')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full transition-all duration-300 ease-spring"
                >
                  {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Tooltip>
            </div>
          </div>

        </div>
        
        <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-main)] p-3 rounded-2xl border border-[var(--border-subtle)]">
          <p><strong>Note:</strong> API keys are stored locally in this browser. When connected to a live Forge server, these keys will authenticate your sub-agents.</p>
        </div>
      </div>
    </section>
  )
}
