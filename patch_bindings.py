import re

with open("src/components/PropertyInspector.tsx", "r") as f:
    content = f.read()

bindings_html = """
        {/* Data Bindings */}
        {hasBindings && onBindVariable && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Data Bindings
            </h4>
            
            <div className="space-y-3 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              
              {/* Text Binding */}
              {textContent !== undefined && tagName !== 'IMG' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Text Content</label>
                  <div className="flex gap-1">
                    <select 
                      className="flex-1 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedElement.dataset?.bindText?.split('.')[0] || selectedElement.dataset?.bindText || ''}
                      onChange={(e) => {
                        const base = e.target.value;
                        if (!base) onBindVariable('text', '');
                        else onBindVariable('text', base);
                      }}
                    >
                      <option value="">Static Text</option>
                      <optgroup label="List Item">
                        <option value="item">item</option>
                      </optgroup>
                      <optgroup label="Global Variables">
                        {Object.keys(variables).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </optgroup>
                      {Object.values(apis || {}).length > 0 && (
                        <optgroup label="API Responses">
                          {Object.values(apis || {}).map((api: any) => (
                            <option key={api.id} value={`api.${api.id}.response`}>{api.name} Response</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {selectedElement.dataset?.bindText && (
                      <input 
                        type="text" 
                        placeholder=".path.to.key"
                        className="w-24 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                        value={selectedElement.dataset?.bindText?.includes('.') ? '.' + selectedElement.dataset?.bindText?.split('.').slice(1).join('.') : ''}
                        onChange={(e) => {
                          const base = selectedElement.dataset?.bindText?.split('.')[0] || '';
                          const path = e.target.value.replace(/^\.+/, ''); // remove leading dots
                          onBindVariable('text', path ? `${base}.${path}` : base);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Image Source Binding */}
              {tagName === 'IMG' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Image Source (URL)</label>
                  <div className="flex gap-1">
                    <select 
                      className="flex-1 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedElement.dataset?.bindSrc?.split('.')[0] || selectedElement.dataset?.bindSrc || ''}
                      onChange={(e) => {
                        const base = e.target.value;
                        if (!base) onBindVariable('src', '');
                        else onBindVariable('src', base);
                      }}
                    >
                      <option value="">Static Image</option>
                      <optgroup label="List Item">
                        <option value="item">item</option>
                      </optgroup>
                      <optgroup label="Global Variables">
                        {Object.keys(variables).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </optgroup>
                      {Object.values(apis || {}).length > 0 && (
                        <optgroup label="API Responses">
                          {Object.values(apis || {}).map((api: any) => (
                            <option key={api.id} value={`api.${api.id}.response`}>{api.name} Response</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {selectedElement.dataset?.bindSrc && (
                      <input 
                        type="text" 
                        placeholder=".path.to.image"
                        className="w-24 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                        value={selectedElement.dataset?.bindSrc?.includes('.') ? '.' + selectedElement.dataset?.bindSrc?.split('.').slice(1).join('.') : ''}
                        onChange={(e) => {
                          const base = selectedElement.dataset?.bindSrc?.split('.')[0] || '';
                          const path = e.target.value.replace(/^\.+/, '');
                          onBindVariable('src', path ? `${base}.${path}` : base);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* List Rendering Binding */}
              {tagName !== 'IMG' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">List Rendering (Array)</label>
                  <div className="flex gap-1">
                    <select 
                      className="flex-1 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                      value={selectedElement.dataset?.bindList?.split('.')[0] || selectedElement.dataset?.bindList || ''}
                      onChange={(e) => {
                        const base = e.target.value;
                        if (!base) onBindVariable('list', '');
                        else onBindVariable('list', base);
                      }}
                    >
                      <option value="">Static Children</option>
                      <optgroup label="Global Variables">
                        {Object.keys(variables).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </optgroup>
                      {Object.values(apis || {}).length > 0 && (
                        <optgroup label="API Responses">
                          {Object.values(apis || {}).map((api: any) => (
                            <option key={api.id} value={`api.${api.id}.response`}>{api.name} Response</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {selectedElement.dataset?.bindList && (
                      <input 
                        type="text" 
                        placeholder=".path.to.array"
                        className="w-24 text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
                        value={selectedElement.dataset?.bindList?.includes('.') ? '.' + selectedElement.dataset?.bindList?.split('.').slice(1).join('.') : ''}
                        onChange={(e) => {
                          const base = selectedElement.dataset?.bindList?.split('.')[0] || '';
                          const path = e.target.value.replace(/^\.+/, '');
                          onBindVariable('list', path ? `${base}.${path}` : base);
                        }}
                      />
                    )}
                  </div>
                  <p className="text-[9px] text-indigo-600/70 dark:text-indigo-400/70 leading-tight">Bind to an array to repeat this element.</p>
                </div>
              )}

            </div>
          </div>
        )}
"""

# Insert bindings_html right before Advanced Customizations
content = content.replace(
    "{/* Advanced Customizations */}",
    bindings_html + "\n        {/* Advanced Customizations */}"
)

# Also need to import Database icon if not already imported
if "Database" not in content[:1000]:
    content = content.replace("Sparkles, Library", "Sparkles, Library, Database")
    
with open("src/components/PropertyInspector.tsx", "w") as f:
    f.write(content)
