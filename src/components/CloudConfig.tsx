
import React, { useState, useEffect } from 'react';
import { Cloud, Check, ShieldCheck, AlertCircle, Key, UploadCloud, Loader2, ExternalLink, Settings, Globe } from 'lucide-react';
import { GeneratedFile } from '../types';
import { cloudService } from '../services/cloudService';

interface CloudConfigProps {
  isOpen: boolean;
  onClose: () => void;
  cloudToken: string | null;
  onSetCloudToken: (token: string | null) => void;
  files?: GeneratedFile[];
  projectName?: string;
}

const CloudConfig: React.FC<CloudConfigProps> = ({ 
  isOpen, 
  onClose, 
  cloudToken,
  onSetCloudToken,
  files,
  projectName
}) => {
  const [inputToken, setInputToken] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [provider, setProvider] = useState(localStorage.getItem('forge_ai_provider') || 'gemini');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
    const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success'>('idle');
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
        setInputToken(cloudToken || '');
        setStatus('idle');
        setDeployUrl(null);
        
        // Load existing Gemini key
        const savedGemini = localStorage.getItem('gemini_api_key') || '';
        setGeminiKey(savedGemini);
        const savedAnthropic = localStorage.getItem('anthropic_api_key') || '';
        setAnthropicKey(savedAnthropic);
        const savedOpenai = localStorage.getItem('openai_api_key') || '';
        setOpenaiKey(savedOpenai);
        setGeminiStatus('idle');
    }
  }, [isOpen, cloudToken]);

  const handleSaveToken = async () => {
    setIsValidating(true);
    setStatus('idle');
    try {
        const isValid = await cloudService.validateToken(inputToken);
        if (isValid) {
            onSetCloudToken(inputToken);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } else {
            setStatus('error');
        }
    } catch (e) {
        setStatus('error');
    } finally {
        setIsValidating(false);
    }
  };

  
  const handleSaveDomain = async () => {
    if (!customDomain.trim()) return;
    setDomainStatus('saving');
    try {
      // Assuming we have a project ID to configure the domain for
      // In a real app we'd pass the actual project ID
      const projectId = projectName || 'default';
      const res = await fetch(`/api/deploy/domain/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain.trim() })
      });
      if (res.ok) {
        setDomainStatus('success');
        setTimeout(() => setDomainStatus('idle'), 3000);
      } else {
        setDomainStatus('error');
      }
    } catch (e) {
      setDomainStatus('error');
    }
  };

  
  const handleSaveKey = () => {
    if (provider === 'gemini') {
      if (geminiKey.trim()) localStorage.setItem('gemini_api_key', geminiKey.trim());
      else localStorage.removeItem('gemini_api_key');
    } else if (provider === 'anthropic') {
      if (anthropicKey.trim()) localStorage.setItem('anthropic_api_key', anthropicKey.trim());
      else localStorage.removeItem('anthropic_api_key');
    } else if (provider === 'openai') {
      if (openaiKey.trim()) localStorage.setItem('openai_api_key', openaiKey.trim());
      else localStorage.removeItem('openai_api_key');
    }
    setGeminiStatus('success');
    setTimeout(() => setGeminiStatus('idle'), 2000);
  };


  const handleDisconnect = () => {
      onSetCloudToken(null);
      setInputToken('');
      setStatus('idle');
      setDeployUrl(null);
  };

  const handleDeploy = async () => {
    if (!cloudToken || !files || files.length === 0) return;
    setIsDeploying(true);
    setDeployUrl(null);
    setStatus('idle');
    try {
        const result = await cloudService.deployWorkspace(cloudToken, files, projectName || 'workspace');
        const url = result?.url || result?.shareUrl || (result?.hash ? `https://storage.onl/drive/file/${result.hash}` : 'https://storage.onl/drive');
        setDeployUrl(url);
        setStatus('success');
    } catch (e) {
        setStatus('error');
    } finally {
        setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-hall-900/60 bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-hall-950 bg-hall-900 border border-hall-200 border-hall-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-hall-900 text-ink">Settings</h2>
              <p className="text-xs text-hall-500 text-hall-400">Configure API keys and deployment</p>
            </div>
          </div>

          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* AI Models Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-hall-900 dark:text-hall-100">
                    <Settings className="w-4 h-4 text-purple-500" />
                    AI Provider
                </div>
                <div className="text-xs text-hall-500">
                    Select the model you want to use for generation.
                </div>
                <div className="flex gap-2">
                    <select 
                        value={provider}
                        onChange={(e) => {
                           setProvider(e.target.value);
                           localStorage.setItem("forge_ai_provider", e.target.value);
                           setGeminiStatus("idle");
                        }}
                        className="flex-1 bg-hall-50 dark:bg-hall-950 border border-hall-200 dark:border-hall-800 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="gemini">Google Gemini (Default)</option>
                        <option value="anthropic">Anthropic Claude</option>
                        <option value="openai">OpenAI</option>
                    </select>
                </div>
            </div>

            {/* Gemini API Key Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-hall-900 text-hall-100">
                    <Key className="w-4 h-4 text-amber-500" />
                    {provider === 'gemini' ? 'Gemini API Key' : provider === 'anthropic' ? 'Anthropic API Key' : 'OpenAI API Key'}
                </div>
                <div className="text-xs text-hall-500">
                    {provider === 'gemini' ? 'Required for code generation. Get your key from Google AI Studio.' : provider === 'anthropic' ? 'Required for code generation. Get your key from Anthropic Console.' : 'Required for code generation. Get your key from OpenAI Platform.'}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        value={provider === 'gemini' ? geminiKey : provider === 'anthropic' ? anthropicKey : openaiKey}
                        onChange={(e) => provider === 'gemini' ? setGeminiKey(e.target.value) : provider === 'anthropic' ? setAnthropicKey(e.target.value) : setOpenaiKey(e.target.value)}
                        placeholder={provider === 'gemini' ? "AIzaSy..." : provider === 'anthropic' ? "sk-ant-..." : "sk-..."}
                        className="flex-1 bg-hall-50 bg-hall-950 border border-hall-200 border-hall-800 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <button
                        onClick={handleSaveKey}
                        className="px-4 py-2 bg-hall-900 bg-hall-950 text-ink text-hall-950 hover:bg-hall-800 rounded-2xl text-sm font-medium transition-colors"
                    >
                        Save
                    </button>
                </div>
                {geminiStatus === 'success' && (
                    <div className="flex items-center gap-2 text-xs text-green-500 animate-in fade-in">
                        <Check className="w-3 h-3" />
                        Key saved locally
                    </div>
                )}
            </div>

            
            {/* Custom Domain Section */}
            <div className="space-y-3 pt-4 border-t border-hall-800/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-hall-900 dark:text-hall-100">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Custom Domain
                </div>
                <div className="text-xs text-hall-500">
                    Configure a custom domain for your deployed project.
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. myapp.com"
                        className="flex-1 bg-hall-50 dark:bg-hall-950 border border-hall-200 dark:border-hall-800 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button
                        onClick={handleSaveDomain}
                        disabled={domainStatus === 'saving'}
                        className="px-4 py-2 bg-hall-900 dark:bg-hall-950 text-ink dark:text-hall-950 hover:bg-hall-800 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {domainStatus === 'saving' ? 'Saving...' : 'Save'}
                    </button>
                </div>
                {domainStatus === 'success' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-500 animate-in fade-in">
                        <Check className="w-3 h-3" />
                        Domain configured successfully
                    </div>
                )}
                {domainStatus === 'error' && (
                    <div className="flex items-center gap-2 text-xs text-red-500 animate-in fade-in">
                        <AlertCircle className="w-3 h-3" />
                        Failed to configure domain
                    </div>
                )}
            </div>

            {/* Storage Configuration Section */}
            <div className="space-y-3 pt-4 border-t border-hall-800/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-hall-900 text-hall-100">
                    <Cloud className="w-4 h-4 text-indigo-500" />
                    Storage Configuration
                </div>
                
                {cloudToken ? (
                    <div className="space-y-3">
                        <div className="p-4 bg-accent-500/10 border border-accent-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2 text-accent-600 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                Connected to Cloud
                            </div>
                            <button 
                                onClick={handleDisconnect}
                                className="text-xs text-red-500 hover:text-red-600 underline"
                            >
                                Disconnect
                            </button>
                        </div>
                        
                        {/* Deployment Section */}
                        <div className="mt-4 pt-4 border-t border-hall-200 border-hall-800">
                            <h3 className="text-sm font-semibold text-hall-900 text-hall-100 mb-3 flex items-center gap-2">
                                <UploadCloud className="w-4 h-4" />
                                Deploy Workspace
                            </h3>
                            <button
                                onClick={handleDeploy}
                                disabled={isDeploying || !files || files.length === 0}
                                className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                {isDeploying ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
                                ) : (
                                    <><UploadCloud className="w-4 h-4" /> Deploy to Cloud</>
                                )}
                            </button>
                            
                            {deployUrl && (
                                <div className="mt-3 p-3 bg-hall-50 bg-hall-950 border border-hall-200 border-hall-800 rounded-2xl animate-in slide-in-from-top-2">
                                    <p className="text-xs text-hall-500 mb-1">Deployment Successful!</p>
                                    <a 
                                        href={deployUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 break-all"
                                    >
                                        {deployUrl} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                            
                            {status === 'error' && !deployUrl && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                                    <AlertCircle className="w-3 h-3" />
                                    Deployment Failed. Check console or API token.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-xs text-hall-500">
                            To sync files, please provide your Personal Access Token from 
                            <a href="https://storage.onl/account-settings" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline ml-1">
                                storage.onl
                            </a>.
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={inputToken}
                                onChange={(e) => setInputToken(e.target.value)}
                                placeholder="Paste your API Token here..."
                                className="flex-1 bg-hall-50 bg-hall-950 border border-hall-200 border-hall-800 rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <button
                                onClick={handleSaveToken}
                                disabled={!inputToken || isValidating}
                                className="px-4 py-2 bg-hall-900 bg-hall-950 text-ink text-hall-950 rounded-2xl text-sm font-medium disabled:opacity-50"
                            >
                                {isValidating ? '...' : 'Connect'}
                            </button>
                        </div>
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-xs text-red-500">
                                <AlertCircle className="w-3 h-3" />
                                Invalid Token or API Unreachable
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-xs text-accent-500">
                                <Check className="w-3 h-3" />
                                Connected Successfully!
                            </div>
                        )}
                    </div>
                )}
            </div>
            
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-hall-200 border-hall-800 text-hall-600 text-hall-400 hover:bg-hall-50 hover:bg-hall-800 transition-colors font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudConfig;
