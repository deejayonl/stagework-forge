import sys

with open('src/components/PropertyInspector.tsx', 'r') as f:
    lines = f.readlines()

insert_idx = -1
for i, line in enumerate(lines):
    if "{/* Advanced Customizations */}" in line:
        insert_idx = i
        break

if insert_idx != -1:
    block = """
        {/* Accessibility & SEO */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Accessibility & SEO</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] text-hall-500 font-bold flex items-center gap-1">
              Semantic Tag
            </label>
            <select
              className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-amber-500"
              value={tagName}
              onChange={(e) => onChangeTag?.(e.target.value)}
            >
              <optgroup label="Containers">
                <option value="div">div</option>
                <option value="span">span</option>
                <option value="section">section</option>
                <option value="article">article</option>
                <option value="aside">aside</option>
                <option value="main">main</option>
                <option value="header">header</option>
                <option value="footer">footer</option>
                <option value="nav">nav</option>
              </optgroup>
              <optgroup label="Typography">
                <option value="h1">h1</option>
                <option value="h2">h2</option>
                <option value="h3">h3</option>
                <option value="h4">h4</option>
                <option value="h5">h5</option>
                <option value="h6">h6</option>
                <option value="p">p</option>
                <option value="strong">strong</option>
                <option value="em">em</option>
                <option value="blockquote">blockquote</option>
              </optgroup>
              <optgroup label="Lists">
                <option value="ul">ul</option>
                <option value="ol">ol</option>
                <option value="li">li</option>
              </optgroup>
              <optgroup label="Media">
                <option value="img">img</option>
                <option value="video">video</option>
                <option value="audio">audio</option>
                <option value="figure">figure</option>
                <option value="figcaption">figcaption</option>
              </optgroup>
              <optgroup label="Interactive">
                <option value="button">button</option>
                <option value="a">a</option>
              </optgroup>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500 font-bold">ARIA Role</label>
              <input
                type="text"
                className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink"
                placeholder="e.g. button, alert"
                value={selectedElement.dataset?.role || selectedElement.role || ''}
                onChange={(e) => onUpdateAttribute?.('role', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500 font-bold">Tab Index</label>
              <input
                type="number"
                className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink"
                placeholder="e.g. 0, -1"
                value={selectedElement.dataset?.tabindex || selectedElement.tabIndex || ''}
                onChange={(e) => onUpdateAttribute?.('tabindex', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-hall-500 font-bold">ARIA Label</label>
            <input
              type="text"
              className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink"
              placeholder="Screen reader description"
              value={selectedElement.dataset?.['aria-label'] || selectedElement['aria-label'] || ''}
              onChange={(e) => onUpdateAttribute?.('aria-label', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="aria-hidden"
              checked={selectedElement.dataset?.['aria-hidden'] === 'true' || selectedElement['aria-hidden'] === 'true'}
              onChange={(e) => onUpdateAttribute?.('aria-hidden', e.target.checked ? 'true' : '')}
            />
            <label htmlFor="aria-hidden" className="text-xs text-hall-900 dark:text-ink">
              Hide from screen readers (aria-hidden)
            </label>
          </div>

          {tagName === 'img' && (
            <div className="space-y-1 mt-2 border-t border-hall-200 dark:border-hall-800 pt-2">
              <label className="text-[10px] text-hall-500 font-bold">Alt Text (SEO)</label>
              <input
                type="text"
                className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink"
                placeholder="Image description"
                value={selectedElement.dataset?.alt || selectedElement.alt || ''}
                onChange={(e) => onUpdateAttribute?.('alt', e.target.value)}
              />
            </div>
          )}
        </div>
"""
    lines.insert(insert_idx, block)
    with open('src/components/PropertyInspector.tsx', 'w') as f:
        f.writelines(lines)
    print("Inserted successfully")
else:
    print("Could not find insertion point")
