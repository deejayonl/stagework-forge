import React, { useState } from 'react';
import { X, Globe, Save } from 'lucide-react';

interface ProjectSettingsModalProps {
  auth: Record<string, string>;
  onUpdateAuth: (auth: Record<string, string>) => void;
  seo: Record<string, string>;
  onUpdateSEO: (seo: Record<string, string>) => void;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ seo, onUpdateSEO, auth, onUpdateAuth, onClose }) => {
  const [title, setTitle] = useState(seo.title || '');
  const [description, setDescription] = useState(seo.description || '');
  const [ogImage, setOgImage] = useState(seo.ogImage || '');
  const [faviconUrl, setFaviconUrl] = useState(seo.faviconUrl || '');
  const [metaTags, setMetaTags] = useState(seo.metaTags || '');
  const [customHead, setCustomHead] = useState(seo.customHead || '');
  const [customBody, setCustomBody] = useState(seo.customBody || '');
  const [authProvider, setAuthProvider] = useState(auth?.provider || 'none');
  const [supabaseUrl, setSupabaseUrl] = useState(auth?.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(auth?.supabaseKey || '');
  const [firebaseConfig, setFirebaseConfig] = useState(auth?.firebaseConfig || '');
  const [activeTab, setActiveTab] = useState('seo');

  const handleSave = () => {
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
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hall-200 dark:border-hall-800">
          <div className="flex items-center gap-2 text-hall-900 dark:text-white">
            <Globe className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold">Project Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        
        {/* Tabs */}
        <div className="flex px-6 border-b border-hall-200 dark:border-hall-800">
          <button 
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seo' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}`}
          >
            SEO & Metadata
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'code' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}`}
          >
            Custom Code
          </button>
          <button 
            onClick={() => setActiveTab('auth')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'auth' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}`}
          >
            Authentication
          </button>
        </div>

        {/* Body */}
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          {activeTab === 'seo' ? (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">SEO & Metadata</h3>

            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                  Page Title
                </label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                  Meta Description
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your app for search engines..."
                  rows={3}
                  className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                  Favicon URL
                </label>
                <input 
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                  Open Graph Image URL
                </label>
                <input 
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                  Custom Meta Tags (HTML)
                </label>
                <textarea 
                  value={metaTags}
                  onChange={(e) => setMetaTags(e.target.value)}
                  placeholder='<meta name="author" content="John Doe">'
                  rows={3}
                  className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>
          
            </div>
          ) : activeTab === 'code' ? (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">Custom Code Injection</h3>
              <p className="text-xs text-hall-500 mb-4">Inject raw HTML, CSS, or JavaScript into your project. Code will be executed in the preview and exported files.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                    Custom &lt;head&gt; Code
                  </label>
                  <textarea 
                    value={customHead}
                    onChange={(e) => setCustomHead(e.target.value)}
                    placeholder='<!-- e.g. Google Analytics, custom fonts, global styles -->
<style>
  body { background: #000; }
</style>'
                    rows={6}
                    className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-hall-600 dark:text-hall-400 mb-1">
                    Custom &lt;body&gt; Code (Before closing tag)
                  </label>
                  <textarea 
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder='<!-- e.g. Chat widgets, tracking scripts -->
<script>
  console.log("App loaded");
</script>'
                    rows={6}
                    className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                  />
                </div>
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
          )}
        </div>


        {/* Footer */}
        <div className="px-6 py-4 border-t border-hall-200 dark:border-hall-800 bg-hall-50 dark:bg-hall-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
