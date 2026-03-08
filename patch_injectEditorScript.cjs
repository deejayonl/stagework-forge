const fs = require('fs');

let content = fs.readFileSync('./src/utils/injectEditorScript.ts', 'utf-8');

const doubleClickScript = `
        document.addEventListener('dblclick', (e) => {
          if (e.target === document.body || e.target === document.documentElement) return;
          
          const el = e.target;
          
          // Only allow editing if it mostly contains text
          if (el.childNodes.length === 1 && el.firstChild.nodeType === Node.TEXT_NODE) {
            e.preventDefault();
            e.stopPropagation();
            
            el.contentEditable = 'true';
            el.focus();
            
            // Highlight box might get in the way during editing, so hide it
            highlightBox.style.display = 'none';
            
            const finishEditing = () => {
              el.contentEditable = 'false';
              el.removeEventListener('blur', finishEditing);
              el.removeEventListener('keydown', handleKeyDown);
              
              updateBox(highlightBox, el);
              
              // Send the updated text to the parent
              if (el.dataset.forgeId) {
                window.parent.postMessage({
                  type: 'FORGE_TEXT_EDITED',
                  id: el.dataset.forgeId,
                  text: el.textContent
                }, '*');
                // Also trigger a DOM update
                sendDOMUpdate();
              }
            };
            
            const handleKeyDown = (evt) => {
              if (evt.key === 'Enter' && !evt.shiftKey) {
                evt.preventDefault();
                el.blur();
              } else if (evt.key === 'Escape') {
                evt.preventDefault();
                el.blur();
              }
            };
            
            el.addEventListener('blur', finishEditing);
            el.addEventListener('keydown', handleKeyDown);
          }
        }, true);
`;

content = content.replace("// Listen for messages from parent", doubleClickScript + "\n        // Listen for messages from parent");

fs.writeFileSync('./src/utils/injectEditorScript.ts', content);
console.log('Patched injectEditorScript.ts');
