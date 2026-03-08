const fs = require('fs');
let code = fs.readFileSync('src/components/CloudConfig.tsx', 'utf8');

const domainSection = `
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="bg-hall-50 dark:bg-hall-900 rounded-xl p-5 border border-hall-200 dark:border-hall-800">
                <h3 className="text-sm font-bold text-hall-900 dark:text-ink mb-2">Custom Domain</h3>
                <p className="text-sm text-hall-600 dark:text-hall-400 mb-4">
                  Connect a custom domain to your hosted project.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. myapp.com"
                    className="flex-1 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-ink focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                    Add Domain
                  </button>
                </div>
              </div>
            </div>
          )}
`;

code = code.replace(
  "{activeTab === 'deploy' && (",
  domainSection + "\n          {activeTab === 'deploy_old' && ("
);

// If activeTab === 'deploy' doesn't exist, let's just add it to the tabs.
fs.writeFileSync('src/components/CloudConfig.tsx', code);
