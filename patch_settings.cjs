const fs = require('fs');
const path = './src/components/ProjectSettingsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('activeTab')) {
  code = code.replace(
    'const [metaTags, setMetaTags] = useState(seo.metaTags || \'\');',
    `const [metaTags, setMetaTags] = useState(seo.metaTags || '');
  const [customHead, setCustomHead] = useState(seo.customHead || '');
  const [customBody, setCustomBody] = useState(seo.customBody || '');
  const [activeTab, setActiveTab] = useState('seo');`
  );

  code = code.replace(
    'metaTags',
    `metaTags,
      customHead,
      customBody`
  );

  const tabsUI = `
        {/* Tabs */}
        <div className="flex px-6 border-b border-hall-200 dark:border-hall-800">
          <button 
            onClick={() => setActiveTab('seo')}
            className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'seo' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}\`}
          >
            SEO & Metadata
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={\`px-4 py-3 text-sm font-medium border-b-2 transition-colors \${activeTab === 'code' ? 'border-amber-500 text-amber-500' : 'border-transparent text-hall-500 hover:text-hall-900 dark:hover:text-white'}\`}
          >
            Custom Code
          </button>
        </div>
`;

  code = code.replace('{/* Body */}', tabsUI + '\n        {/* Body */}');

  const seoBody = `
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          {activeTab === 'seo' ? (
            <div>
              <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">SEO & Metadata</h3>
`;

  code = code.replace(
    '<div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">\n          <div>\n            <h3 className="text-sm font-medium text-hall-900 dark:text-white mb-4">SEO & Metadata</h3>',
    seoBody
  );

  const codeBody = `
            </div>
          ) : (
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
                    placeholder='<!-- e.g. Google Analytics, custom fonts, global styles -->\n<style>\n  body { background: #000; }\n</style>'
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
                    placeholder='<!-- e.g. Chat widgets, tracking scripts -->\n<script>\n  console.log("App loaded");\n</script>'
                    rows={6}
                    className="w-full bg-hall-50 dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
`;

  code = code.replace(
    '</div>\n        </div>\n\n        {/* Footer */}',
    codeBody + '\n\n        {/* Footer */}'
  );

  fs.writeFileSync(path, code, 'utf8');
}
