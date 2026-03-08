const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldListSection = `            <select 
              className="w-full text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedElement.dataset?.bindList || ''}
              onChange={(e) => onBindVariable('list', e.target.value)}
            >
              <option value="">Static Children (No Repeat)</option>
              {Object.keys(variables).map(key => (
                <option key={key} value={key}>Bind Array: {key}</option>
              ))}
            </select>`;

const newListSection = `            <select 
              className="w-full text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedElement.dataset?.bindList || ''}
              onChange={(e) => onBindVariable('list', e.target.value)}
            >
              <option value="">Static Children (No Repeat)</option>
              {Object.values(collections || {}).length > 0 && (
                <optgroup label="Collections">
                  {Object.values(collections || {}).map((c: any) => (
                    <option key={c.id} value={c.id}>Bind Collection: {c.name}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Variables">
                {Object.keys(variables).map(key => (
                  <option key={key} value={key}>Bind Array: {key}</option>
                ))}
              </optgroup>
            </select>`;

code = code.replace(oldListSection, newListSection);
fs.writeFileSync(path, code);
