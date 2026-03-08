const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let content = fs.readFileSync(file, 'utf8');

const contextMenuCode = `
        document.addEventListener('contextmenu', (e) => {
          if (e.target === document.body || e.target === document.documentElement) return;
          e.preventDefault();
          e.stopPropagation();
          
          selectedElement = e.target;
          
          updateBox(highlightBox, selectedElement);
          
          const computedStyle = window.getComputedStyle(selectedElement);
          
          if (!selectedElement.dataset.forgeId) {
            selectedElement.dataset.forgeId = 'node-' + Math.random().toString(36).substr(2, 9);
          }
          
          window.parent.postMessage({
            type: 'FORGE_CONTEXT_MENU',
            x: e.clientX,
            y: e.clientY,
            element: {
              id: selectedElement.dataset.forgeId,
              tagName: selectedElement.tagName.toLowerCase(),
              className: selectedElement.className,
              path: getElementPath(selectedElement),
              dataset: Object.keys(selectedElement.dataset).reduce((acc, key) => {
                acc[key] = selectedElement.dataset[key];
                return acc;
              }, {}),
              textContent: (selectedElement.childNodes.length === 1 && selectedElement.firstChild.nodeType === Node.TEXT_NODE) || selectedElement.childNodes.length === 0 || selectedElement.dataset.bindText
                ? selectedElement.textContent 
                : '',
              outerHTML: selectedElement.outerHTML
            }
          }, '*');
        }, true);
`;

if (!content.includes("FORGE_CONTEXT_MENU")) {
  content = content.replace("document.addEventListener('dblclick',", contextMenuCode + "\n        document.addEventListener('dblclick',");
  fs.writeFileSync(file, content);
  console.log('Patched injectEditorScript.ts');
} else {
  console.log('Already patched');
}
