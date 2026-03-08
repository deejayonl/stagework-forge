import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

keyframes_controls = """
          <div className="space-y-1 mt-3 pt-3 border-t border-hall-200 dark:border-hall-800">
            <label className="text-[10px] text-hall-500 font-bold">Custom Animation</label>
            <div className="space-y-2">
              <input 
                type="text" 
                value={styles.animationName || ''} 
                onChange={(e) => handleStyleChange('animationName', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="Animation Name (e.g. slideIn)"
              />
              <textarea
                value={selectedElement.dataset?.keyframes || ''}
                onChange={(e) => {
                  if (onUpdateAttribute) {
                    onUpdateAttribute('data-keyframes', e.target.value);
                  }
                }}
                className="w-full h-20 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink font-mono"
                placeholder="@keyframes slideIn {\\n  from { opacity: 0; }\\n  to { opacity: 1; }\\n}"
              />
              <p className="text-[8px] text-hall-500">Define keyframes here and they will be injected automatically.</p>
            </div>
          </div>
"""

# Insert after timing function
idx = content.find('placeholder="cubic-bezier(...)"')
if idx != -1:
    end_idx = content.find('</div>', idx)
    end_idx = content.find('</div>', end_idx + 1)
    content = content[:end_idx + 6] + '\n' + keyframes_controls + content[end_idx + 6:]

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
