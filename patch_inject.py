import re

with open('./src/utils/injectEditorScript.ts', 'r') as f:
    content = f.read()

# Update hover logic to handle hover, focus, active, focus-visible
old_hover_logic = """
              if (state === 'hover') {
                let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-hover-'));
                if (!uniqueClass) {
                  uniqueClass = 'forge-hover-' + Math.random().toString(36).substring(2, 9);
                  el.classList.add(uniqueClass);
                }
                let styleBlock = document.getElementById('forge-hover-styles');
                if (!styleBlock) {
                  styleBlock = document.createElement('style');
                  styleBlock.id = 'forge-hover-styles';
                  document.head.appendChild(styleBlock);
                }
                styleBlock.textContent += '\\n.' + uniqueClass + ':hover { ' + kebabProp + ': ' + value + ' !important; }';
              } else if (!breakpoint || breakpoint === 'desktop') {
"""

new_state_logic = """
              if (state && ['hover', 'focus', 'active', 'focus-visible'].includes(state)) {
                let uniqueClass = Array.from(el.classList).find(c => c.startsWith(`forge-${state}-`));
                if (!uniqueClass) {
                  uniqueClass = `forge-${state}-` + Math.random().toString(36).substring(2, 9);
                  el.classList.add(uniqueClass);
                }
                let styleBlock = document.getElementById(`forge-${state}-styles`);
                if (!styleBlock) {
                  styleBlock = document.createElement('style');
                  styleBlock.id = `forge-${state}-styles`;
                  document.head.appendChild(styleBlock);
                }
                styleBlock.textContent += '\\n.' + uniqueClass + ':' + state + ' { ' + kebabProp + ': ' + value + ' !important; }';
              } else if (!breakpoint || breakpoint === 'desktop') {
"""

content = content.replace(old_hover_logic, new_state_logic)

with open('./src/utils/injectEditorScript.ts', 'w') as f:
    f.write(content)
