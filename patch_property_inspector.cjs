const fs = require('fs');
const path = './src/components/PropertyInspector.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add collections to props
code = code.replace(
  'variables?: Record<string, string>;',
  'variables?: Record<string, string>;\n  collections?: Record<string, any>;'
);

code = code.replace(
  'variables = {},',
  'variables = {},\n  collections = {},'
);

// We need to replace `Object.keys(variables).length > 0` with a new condition
// Let's create a helper `hasBindings` at the top of the component
code = code.replace(
  'const [isHoverMode, setIsHoverMode] = useState(false);',
  'const [isHoverMode, setIsHoverMode] = useState(false);\n  const hasBindings = Object.keys(variables).length > 0 || Object.keys(collections).length > 0;'
);

// Replace all `Object.keys(variables).length > 0 && onBindVariable` with `hasBindings && onBindVariable`
code = code.replaceAll(
  'Object.keys(variables).length > 0 && onBindVariable',
  'hasBindings && onBindVariable'
);

// Replace the hardcoded List Item Bindings with dynamic collections + fallback
const hardcodedBindings = `<optgroup label="List Item Bindings">
                    <option value="item">Bind: item (string)</option>
                    <option value="item.name">Bind: item.name</option>
                    <option value="item.title">Bind: item.title</option>
                    <option value="item.description">Bind: item.description</option>
                  </optgroup>`;

const dynamicBindings = `{Object.values(collections).length > 0 ? (
                    Object.values(collections).map(c => (
                      <optgroup key={c.id} label={\`Collection: \${c.name}\`}>
                        {c.fields.map((f: any) => (
                          <option key={\`\${c.id}.\${f.name}\`} value={\`item.\${f.name}\`}>
                            Bind: item.{f.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <optgroup label="List Item Bindings">
                      <option value="item">Bind: item (string)</option>
                      <option value="item.name">Bind: item.name</option>
                      <option value="item.title">Bind: item.title</option>
                      <option value="item.description">Bind: item.description</option>
                    </optgroup>
                  )}`;

code = code.replaceAll(hardcodedBindings, dynamicBindings);

// For the `data-bind-list` dropdown, we replace the hardcoded "List Array Bindings"
const listBindings = `{tagName !== 'IMG' && hasBindings && onBindVariable && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Repeat List (Map)</label>
              <select 
                className="text-[10px] bg-hall-100 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded p-1 text-hall-700 dark:text-hall-300 outline-none max-w-[100px]"
                value={selectedElement.dataset?.bindList || ''}
                onChange={(e) => onBindVariable('list', e.target.value)}
              >
                <option value="">No Repeat</option>
                <optgroup label="List Arrays">
                  {Object.keys(variables).map(key => (
                    <option key={key} value={key}>Map over: {key}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            {selectedElement.dataset?.bindList && (
              <div className="text-[10px] text-hall-500 bg-hall-100 dark:bg-hall-900 p-2 rounded">
                This element and its children will be repeated for each item in the bound array.
              </div>
            )}
          </div>
        )}`;

const newListBindings = `{tagName !== 'IMG' && hasBindings && onBindVariable && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Repeat List (Map)</label>
              <select 
                className="text-[10px] bg-hall-100 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded p-1 text-hall-700 dark:text-hall-300 outline-none max-w-[100px]"
                value={selectedElement.dataset?.bindList || ''}
                onChange={(e) => onBindVariable('list', e.target.value)}
              >
                <option value="">No Repeat</option>
                {Object.values(collections).length > 0 && (
                  <optgroup label="Collections">
                    {Object.values(collections).map(c => (
                      <option key={c.id} value={c.id}>Map over: {c.name}</option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Variables">
                  {Object.keys(variables).map(key => (
                    <option key={key} value={key}>Map over: {key}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            {selectedElement.dataset?.bindList && (
              <div className="text-[10px] text-hall-500 bg-hall-100 dark:bg-hall-900 p-2 rounded">
                This element and its children will be repeated for each item in the bound collection/array.
              </div>
            )}
          </div>
        )}`;

code = code.replace(listBindings, newListBindings);

fs.writeFileSync(path, code);
