import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

anim_controls = """          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Duration</label>
              <input 
                type="text" 
                value={styles.animationDuration || ''} 
                onChange={(e) => handleStyleChange('animationDuration', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 2s, 500ms"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Delay</label>
              <input 
                type="text" 
                value={styles.animationDelay || ''} 
                onChange={(e) => handleStyleChange('animationDelay', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 1s"
              />
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Timing Function (Easing)</label>
            <div className="flex gap-2">
              <select 
                value={styles.animationTimingFunction || ''} 
                onChange={(e) => handleStyleChange('animationTimingFunction', e.target.value)}
                className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">Default</option>
                <option value="linear">linear</option>
                <option value="ease">ease</option>
                <option value="ease-in">ease-in</option>
                <option value="ease-out">ease-out</option>
                <option value="ease-in-out">ease-in-out</option>
              </select>
              <input 
                type="text" 
                value={styles.animationTimingFunction || ''} 
                onChange={(e) => handleStyleChange('animationTimingFunction', e.target.value)}
                className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="cubic-bezier(...)"
              />
            </div>
          </div>
"""

target = """                </button>
              );
            })}
          </div>"""

# Find the specific target under Animations
idx = content.find('animate-ping')
if idx != -1:
    end_idx = content.find('</div>', idx)
    end_idx = content.find('</div>', end_idx + 1)
    # The end of the animations grid
    content = content[:end_idx + 6] + '\n' + anim_controls + content[end_idx + 6:]

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
