const fs = require('fs');
const path = './src/components/Workspace.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `const handleUpdateStyle = (property: string, value: string) => {`,
  `const handleToggleClass = (className: string, toggle: boolean) => {
    if (!selectedElement) return;

    const newClassStr = toggle 
      ? \`\${selectedElement.className || ''} \${className}\`.trim() 
      : (selectedElement.className || '').replace(new RegExp(\`\\\\b\${className}\\\\b\`, 'g'), '').trim();

    setSelectedElement((prev: any) => ({
      ...prev,
      className: newClassStr
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_TOGGLE_CLASS',
        id: selectedElement.id,
        className,
        toggle
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
      if (toggle) el.classList.add(className);
      else el.classList.remove(className);
    }, true, \`Toggle class \${className}\`);
  };

  const handleUpdateStyle = (property: string, value: string) => {`
);

code = code.replace(
  `onUpdateStyle={handleUpdateStyle}`,
  `onUpdateStyle={handleUpdateStyle}\n            onToggleClass={handleToggleClass}`
);

fs.writeFileSync(path, code);
