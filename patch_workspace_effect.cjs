const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const messageListener = `
  useEffect(() => {
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
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInspectorOpen, localFiles]); // added localFiles to dependencies
`;

const oldEffect = `  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'FORGE_ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        if (!isInspectorOpen) setIsInspectorOpen(true);
      } else if (e.data.type === 'FORGE_DOM_TREE') {
        setDomTree(e.data.tree);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInspectorOpen]);`;

content = content.replace(oldEffect, messageListener.trim());

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched Workspace effect');
