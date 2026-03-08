import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

new_transforms = """
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Transform Origin</label>
              <select 
                value={styles.transformOrigin || ''} 
                onChange={(e) => handleStyleChange('transformOrigin', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">center</option>
                <option value="top">top</option>
                <option value="top right">top right</option>
                <option value="right">right</option>
                <option value="bottom right">bottom right</option>
                <option value="bottom">bottom</option>
                <option value="bottom left">bottom left</option>
                <option value="left">left</option>
                <option value="top left">top left</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Perspective</label>
              <input 
                type="text" 
                value={styles.perspective || ''} 
                onChange={(e) => handleStyleChange('perspective', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 1000px"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Rotate X (3D)</label>
              <input 
                type="text" 
                value={styles.transform?.includes('rotateX') ? styles.transform.match(/rotateX\\((.*?)\\)/)?.[1] || '' : ''} 
                onChange={(e) => {
                  let currentTransform = styles.transform || '';
                  const val = e.target.value;
                  if (currentTransform.includes('rotateX')) {
                    currentTransform = currentTransform.replace(/rotateX\\([^)]+\\)/, val ? `rotateX(${val})` : '');
                  } else if (val) {
                    currentTransform += ` rotateX(${val})`;
                  }
                  handleStyleChange('transform', currentTransform.trim());
                }}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 45deg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Rotate Y (3D)</label>
              <input 
                type="text" 
                value={styles.transform?.includes('rotateY') ? styles.transform.match(/rotateY\\((.*?)\\)/)?.[1] || '' : ''} 
                onChange={(e) => {
                  let currentTransform = styles.transform || '';
                  const val = e.target.value;
                  if (currentTransform.includes('rotateY')) {
                    currentTransform = currentTransform.replace(/rotateY\\([^)]+\\)/, val ? `rotateY(${val})` : '');
                  } else if (val) {
                    currentTransform += ` rotateY(${val})`;
                  }
                  handleStyleChange('transform', currentTransform.trim());
                }}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 45deg"
              />
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Clip Path</label>
            <div className="flex gap-2">
              <select 
                value={styles.clipPath?.split('(')[0] || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) handleStyleChange('clipPath', '');
                  else if (val === 'circle') handleStyleChange('clipPath', 'circle(50% at 50% 50%)');
                  else if (val === 'ellipse') handleStyleChange('clipPath', 'ellipse(50% 25% at 50% 50%)');
                  else if (val === 'polygon') handleStyleChange('clipPath', 'polygon(50% 0%, 0% 100%, 100% 100%)');
                  else if (val === 'inset') handleStyleChange('clipPath', 'inset(10% 10% 10% 10%)');
                }}
                className="w-1/3 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">none</option>
                <option value="circle">circle</option>
                <option value="ellipse">ellipse</option>
                <option value="polygon">polygon</option>
                <option value="inset">inset</option>
              </select>
              <input 
                type="text" 
                value={styles.clipPath || ''} 
                onChange={(e) => handleStyleChange('clipPath', e.target.value)}
                className="w-2/3 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="Custom clip-path value"
              />
            </div>
          </div>
"""

target = """          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Translate (X Y)</label>"""

content = content.replace(target, new_transforms + '\n' + target)

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
