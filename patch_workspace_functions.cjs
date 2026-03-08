const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const handlers = `
  const handleDeleteElement = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      el.remove();
    }, false);
    setSelectedElement(null);
  };

  const handleDuplicateElement = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      const clone = el.cloneNode(true);
      if (clone instanceof HTMLElement) {
         clone.removeAttribute('data-forge-id');
         const descendants = clone.querySelectorAll('[data-forge-id]');
         descendants.forEach(d => d.removeAttribute('data-forge-id'));
      }
      el.parentNode?.insertBefore(clone, el.nextSibling);
    }, false);
  };

  const handleUpdateStyle = (property: string, value: string) => {
`;

content = content.replace(/const handleUpdateStyle = \(property: string, value: string\) => \{/, handlers.trim() + ' {');

const inspectorProps = `
          <PropertyInspector 
            selectedElement={selectedElement} 
            onUpdateStyle={handleUpdateStyle}
            onUpdateText={handleUpdateText}
            onDelete={handleDeleteElement}
            onDuplicate={handleDuplicateElement}
            onClose={() => setIsInspectorOpen(false)} 
          />
`;

content = content.replace(/<PropertyInspector\s+selectedElement=\{selectedElement\}\s+onUpdateStyle=\{handleUpdateStyle\}\s+onUpdateText=\{handleUpdateText\}\s+onClose=\{\(\) => setIsInspectorOpen\(false\)\}\s+\/>/, inspectorProps.trim());

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched Workspace functions and props');
