const fs = require('fs');
const file = './src/components/PropertyInspector.tsx';
let content = fs.readFileSync(file, 'utf8');

const formSection = `
        {/* Form Elements */}
        {['input', 'textarea', 'select', 'form', 'button'].includes(tagName.toLowerCase()) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Form Properties</h4>
            
            {tagName.toLowerCase() === 'form' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Action URL</label>
                <input
                  type="text"
                  placeholder="/api/submit"
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                  value={selectedElement.attributes?.action || ''}
                  onChange={(e) => onUpdateAttribute?.('action', e.target.value)}
                />
                <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Method</label>
                <select
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                  value={selectedElement.attributes?.method || 'get'}
                  onChange={(e) => onUpdateAttribute?.('method', e.target.value)}
                >
                  <option value="get">GET</option>
                  <option value="post">POST</option>
                </select>
              </div>
            )}

            {['input', 'textarea', 'select'].includes(tagName.toLowerCase()) && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Name (Key)</label>
                  <input
                    type="text"
                    placeholder="e.g., email"
                    className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                    value={selectedElement.attributes?.name || ''}
                    onChange={(e) => onUpdateAttribute?.('name', e.target.value)}
                  />
                </div>
                
                {['input', 'textarea'].includes(tagName.toLowerCase()) && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Placeholder</label>
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                      value={selectedElement.attributes?.placeholder || ''}
                      onChange={(e) => onUpdateAttribute?.('placeholder', e.target.value)}
                    />
                  </div>
                )}

                {tagName.toLowerCase() === 'input' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Input Type</label>
                    <select
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                      value={selectedElement.attributes?.type || 'text'}
                      onChange={(e) => onUpdateAttribute?.('type', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="number">Number</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                      <option value="date">Date</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                )}

                {tagName.toLowerCase() === 'button' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Button Type</label>
                    <select
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                      value={selectedElement.attributes?.type || 'button'}
                      onChange={(e) => onUpdateAttribute?.('type', e.target.value)}
                    >
                      <option value="button">Button</option>
                      <option value="submit">Submit</option>
                      <option value="reset">Reset</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="prop-required"
                    checked={selectedElement.attributes?.required !== undefined && selectedElement.attributes?.required !== null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateAttribute?.('required', 'true');
                      } else {
                        onUpdateAttribute?.('required', '');
                      }
                    }}
                    className="rounded border-hall-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="prop-required" className="text-xs font-medium text-hall-600 dark:text-hall-400">
                    Required Field
                  </label>
                </div>
              </>
            )}
          </div>
        )}
`;

content = content.replace(
  /\{\/\* Link Navigation \*\/\}/,
  formSection + "\n\n        {/* Link Navigation */}"
);

fs.writeFileSync(file, content);
