const fs = require('fs');
let content = fs.readFileSync('./src/utils/injectEditorScript.ts', 'utf-8');

const shortcutScript = `
        document.addEventListener('keydown', (e) => {
          if (!selectedElement) return;
          
          // Don't trigger if we are editing text
          if (document.activeElement && document.activeElement.contentEditable === 'true') return;
          
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            const id = selectedElement.dataset.forgeId;
            if (id) {
              window.parent.postMessage({ type: 'FORGE_DELETE_ELEMENT', id }, '*');
            }
          } else if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            const id = selectedElement.dataset.forgeId;
            if (id) {
              window.parent.postMessage({ type: 'FORGE_DUPLICATE_ELEMENT', id }, '*');
            }
          }
        });

        // Listen for messages from parent
`;

content = content.replace("// Listen for messages from parent", shortcutScript.trim());

fs.writeFileSync('./src/utils/injectEditorScript.ts', content);
console.log('Patched shortcuts in injectEditorScript');
