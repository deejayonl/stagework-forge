const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/CloudConfig.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const domainIconImport = "import { Cloud, Check, X, ShieldCheck, AlertCircle, LogOut, UserCircle, Key, UploadCloud, Loader2, ExternalLink, Settings, Globe } from 'lucide-react';";

content = content.replace(
  "import { Cloud, Check, X, ShieldCheck, AlertCircle, LogOut, UserCircle, Key, UploadCloud, Loader2, ExternalLink, Settings } from 'lucide-react';",
  domainIconImport
);

const domainState = `  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success'>('idle');
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');`;

content = content.replace(
  "const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success'>('idle');",
  domainState
);

const handleSaveDomain = `
  const handleSaveDomain = async () => {
    if (!customDomain.trim()) return;
    setDomainStatus('saving');
    try {
      // Assuming we have a project ID to configure the domain for
      // In a real app we'd pass the actual project ID
      const projectId = projectName || 'default';
      const res = await fetch(\`/api/deploy/domain/\${projectId}\`, {
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
`;

content = content.replace(
  "const handleSaveGeminiKey = () => {",
  handleSaveDomain + "\n  const handleSaveGeminiKey = () => {"
);

const domainSection = `
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
`;

content = content.replace(
  "{/* Storage Configuration Section */}",
  domainSection + "\n            {/* Storage Configuration Section */}"
);

fs.writeFileSync(filePath, content);
console.log('Patched CloudConfig.tsx to add Custom Domain section');
