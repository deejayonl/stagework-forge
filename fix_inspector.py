import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

# Remove the incorrectly placed button
bad_btn = """
          <div className="flex items-center gap-2">
            <button
              onClick={onInsertSkipLink}
              className="w-full bg-hall-100 hover:bg-hall-200 dark:bg-hall-900 dark:hover:bg-hall-800 text-hall-900 dark:text-ink text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 border border-hall-200 dark:border-hall-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
              Insert Skip Link
            </button>
          </div>
"""
content = content.replace(bad_btn, '')

# Find Accessibility section
acc_idx = content.find('Accessibility & SEO')
if acc_idx != -1:
    # Find the end of the Accessibility section, or just insert it before the next major section
    # Let's insert it right after the ARIA Label input div
    aria_label_div = """          <div className="space-y-1">
            <label className="text-[10px] text-hall-500 font-bold">ARIA Label</label>
            <input
              type="text"
              className="w-full text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink"
              placeholder="Screen reader description"
              value={selectedElement.dataset?.['aria-label'] || selectedElement['aria-label'] || ''}
              onChange={(e) => onUpdateAttribute?.('aria-label', e.target.value)}
            />
          </div>"""
    
    new_btn = """
          <div className="mt-4 border-t border-hall-200 dark:border-hall-800 pt-3">
            <button
              onClick={onInsertSkipLink}
              className="w-full bg-hall-100 hover:bg-hall-200 dark:bg-hall-900 dark:hover:bg-hall-800 text-hall-900 dark:text-ink text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 border border-hall-200 dark:border-hall-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
              Insert Skip Link
            </button>
            <p className="text-[9px] text-hall-500 mt-1.5 text-center">Injects a visually hidden skip link at the top of the page.</p>
          </div>
"""
    content = content.replace(aria_label_div, aria_label_div + new_btn)

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
