const fs = require('fs');
let content = fs.readFileSync('./src/utils/injectEditorScript.ts', 'utf8');

const regex = /if \(e\.data\.type === 'FORGE_UPDATE_STYLE'\) \{[\s\S]*?\} else if \(e\.data\.type === 'FORGE_TOGGLE_CLASS'\) \{/;

const newStr = `if (e.data.type === 'FORGE_UPDATE_STYLE') {
            const { id, property, value, breakpoint, state } = e.data;
            const el = document.querySelector(\`[data-forge-id="\${id}"]\`);
            if (el) {
              const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
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
                el.style[property] = value;
              } else {
                let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-resp-'));
                if (!uniqueClass) {
                  uniqueClass = 'forge-resp-' + Math.random().toString(36).substring(2, 9);
                  el.classList.add(uniqueClass);
                }
                let styleBlock = document.getElementById('forge-responsive-styles');
                if (!styleBlock) {
                  styleBlock = document.createElement('style');
                  styleBlock.id = 'forge-responsive-styles';
                  document.head.appendChild(styleBlock);
                }
                const mediaQuery = breakpoint === 'mobile' ? '@media (max-width: 767px)' : '@media (min-width: 768px) and (max-width: 1023px)';
                styleBlock.textContent += '\\n' + mediaQuery + ' { .' + uniqueClass + ' { ' + kebabProp + ': ' + value + ' !important; } }';
              }
              updateBox(highlightBox, el);
            }
          } else if (e.data.type === 'FORGE_TOGGLE_CLASS') {`;

content = content.replace(regex, newStr);
fs.writeFileSync('./src/utils/injectEditorScript.ts', content);
