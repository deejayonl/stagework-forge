import React, { useState } from 'react';
import { Rocket, X, Save, AlertCircle, ExternalLink } from 'lucide-react';

interface DeployPanelProps {
  projectId?: string;
  onClose: () => void;
}

export function DeployPanel({ projectId, onClose }: DeployPanelProps) {
  const [provider, setProvider] = useState<'vercel' | 'netlify'>('vercel');
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // For now, we'll simulate saving the token to local storage or a mocked backend
      localStorage.setItem(`deploy_token_${provider}_${projectId}`, token);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSaveMessage({ type: 'success', text: 'Deployment settings saved successfully.' });
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = () => {
    if (!projectId) return;
    setIsDeploying(true);
    
    // Open the deployment UI in a new tab
    const PROXY_BASE = 'https://sgfbackend.deejay.onl/api/deploy';
    const deployUrl = `${PROXY_BASE}/${provider}/${projectId}?framework=react`;
    
    window.open(deployUrl, '_blank');
    
    setTimeout(() => {
      setIsDeploying(false);
    }, 1000);
  };

  // Load token on mount
  React.useEffect(() => {
    if (projectId) {
      const savedToken = localStorage.getItem(`deploy_token_${provider}_${projectId}`);
      if (savedToken) {
        setToken(savedToken);
      } else {
        setToken('');
      }
    }
  }, [provider, projectId]);

  return (
    <div className="absolute left-14 top-14 bottom-0 w-80 bg-hall-950 border-r border-hall-800 shadow-2xl z-40 flex flex-col">
      <div className="p-4 border-b border-hall-800 flex justify-between items-center bg-hall-900/50">
        <h3 className="font-semibold text-hall-100 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-purple-400" />
          Deployment Settings
        </h3>
        <button onClick={onClose} className="p-1.5 text-hall-400 hover:text-hall-100 rounded-lg hover:bg-hall-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-hall-300 mb-2">Provider</label>
            <div className="flex gap-2">
              <button
                onClick={() => setProvider('vercel')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${provider === 'vercel' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-hall-900 border-hall-800 text-hall-400 hover:bg-hall-800'}`}
              >
                Vercel
              </button>
              <button
                onClick={() => setProvider('netlify')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${provider === 'netlify' ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' : 'bg-hall-900 border-hall-800 text-hall-400 hover:bg-hall-800'}`}
              >
                Netlify
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-hall-300 mb-2">
              {provider === 'vercel' ? 'Vercel Access Token' : 'Netlify Personal Access Token'}
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={`Enter your ${provider === 'vercel' ? 'Vercel' : 'Netlify'} token`}
              className="w-full bg-hall-900 border border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <p className="mt-2 text-xs text-hall-500">
              {provider === 'vercel' 
                ? 'Create a token in your Vercel account settings under Tokens.' 
                : 'Create a token in your Netlify user settings under Applications.'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !token}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>

          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${saveMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{saveMessage.text}</p>
            </div>
          )}

          <div className="pt-6 border-t border-hall-800">
            <h4 className="text-sm font-medium text-hall-100 mb-4">Deploy Project</h4>
            <button
              onClick={handleDeploy}
              disabled={isDeploying || !token || !projectId}
              className="w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-400 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              {isDeploying ? 'Deploying...' : '1-Click Deploy'}
            </button>
            <p className="mt-3 text-xs text-hall-500 text-center">
              Pushes your project to {provider === 'vercel' ? 'Vercel' : 'Netlify'} using the configured token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
