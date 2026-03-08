const fs = require('fs');
const path = './src/components/ProjectSettingsModal.tsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'interface ProjectSettingsModalProps {',
  `interface ProjectSettingsModalProps {
  auth: Record<string, string>;
  onUpdateAuth: (auth: Record<string, string>) => void;`
);

content = content.replace(
  'export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ seo, onUpdateSEO, onClose }) => {',
  'export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ seo, onUpdateSEO, auth, onUpdateAuth, onClose }) => {'
);

// Add state for auth
const stateTarget = `  const [customBody, setCustomBody] = useState(seo.customBody || '');`;
const stateReplacement = `  const [customBody, setCustomBody] = useState(seo.customBody || '');
  const [authProvider, setAuthProvider] = useState(auth?.provider || 'none');
  const [supabaseUrl, setSupabaseUrl] = useState(auth?.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(auth?.supabaseKey || '');
  const [firebaseConfig, setFirebaseConfig] = useState(auth?.firebaseConfig || '');`;
content = content.replace(stateTarget, stateReplacement);

// Add handleSave update
const saveTarget = `  const handleSave = () => {
    onUpdateSEO({
      ...seo,
      title,
      description,
      ogImage,
      faviconUrl,
      metaTags,
      customHead,
      customBody
    });
    onClose();
  };`;
const saveReplacement = `  const handleSave = () => {
    onUpdateSEO({
      ...seo,
      title,
      description,
      ogImage,
      faviconUrl,
      metaTags,
      customHead,
      customBody
    });
    onUpdateAuth({
      ...auth,
      provider: authProvider,
      supabaseUrl,
      supabaseKey,
      firebaseConfig
    });
    onClose();
  };`;
content = content.replace(saveTarget, saveReplacement);

// Add Tab Button
const tabsTarget = `          <button 
            onClick={() => setActiveTab('code')}
            className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'code' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}\`}
          >
            Custom Code
          </button>
        </div>`;
const tabsReplacement = `          <button 
            onClick={() => setActiveTab('code')}
            className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'code' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}\`}
          >
            Custom Code
          </button>
          <button 
            onClick={() => setActiveTab('auth')}
            className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'auth' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}\`}
          >
            Authentication
          </button>
        </div>`;
content = content.replace(tabsTarget, tabsReplacement);

// Add Tab Body
const bodyTarget = `          ) : (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">Custom Code Injection</h3>`;
const bodyReplacement = `          ) : activeTab === 'code' ? (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">Custom Code Injection</h3>`;
content = content.replace(bodyTarget, bodyReplacement);

const bodyEndTarget = `                </div>
              </div>
            </div>
          )}`;
const bodyEndReplacement = `                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">Authentication Configuration</h3>
              <p className="text-xs text-hall-500 mb-4">Integrate Supabase or Firebase to enable authentication and database capabilities in your app.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                    Provider
                  </label>
                  <select
                    value={authProvider}
                    onChange={(e) => setAuthProvider(e.target.value)}
                    className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="none">None</option>
                    <option value="supabase">Supabase</option>
                    <option value="firebase">Firebase</option>
                  </select>
                </div>

                {authProvider === 'supabase' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                        Supabase URL
                      </label>
                      <input 
                        type="text"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                        Supabase Anon Key
                      </label>
                      <input 
                        type="password"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {authProvider === 'firebase' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                        Firebase Config (JSON)
                      </label>
                      <textarea 
                        value={firebaseConfig}
                        onChange={(e) => setFirebaseConfig(e.target.value)}
                        placeholder='{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}'
                        rows={8}
                        className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}`;
content = content.replace(bodyEndTarget, bodyEndReplacement);

fs.writeFileSync(path, content);
console.log("Successfully patched ProjectSettingsModal.tsx");
