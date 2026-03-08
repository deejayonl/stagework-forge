const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const newHandler = `
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'FORGE_ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        if (!isInspectorOpen) setIsInspectorOpen(true);
      } else if (e.data.type === 'FORGE_DOM_TREE') {
        setDomTree(e.data.tree);
      } else if (e.data.type === 'FORGE_TEXT_EDITED') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  el.textContent = e.data.text;
               });
               return { ...prev, textContent: e.data.text };
            }
            return prev;
         });
      } else if (e.data.type === 'FORGE_DELETE_ELEMENT') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  el.remove();
               });
               return null; // deselect after delete
            }
            return prev;
         });
      } else if (e.data.type === 'FORGE_DUPLICATE_ELEMENT') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  const clone = el.cloneNode(true);
                  // Remove data-forge-id so a new one gets generated
                  if (clone instanceof HTMLElement) {
                     clone.removeAttribute('data-forge-id');
                     const descendants = clone.querySelectorAll('[data-forge-id]');
                     descendants.forEach(d => d.removeAttribute('data-forge-id'));
                  }
                  el.parentNode?.insertBefore(clone, el.nextSibling);
               });
            }
            return prev;
         });
      }
    };
`;

content = content.replace(/const handleMessage = \([\s\S]*?\}\s*return prev;\s*\}\);\s*\}\s*\};/, newHandler.trim());

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched Workspace.tsx for shortcuts');
