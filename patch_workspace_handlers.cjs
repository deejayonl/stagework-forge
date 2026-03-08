const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const updateHtmlFunction = `
  const updateLocalHtml = (path: number[], updateFn: (el: HTMLElement) => void) => {
    const htmlFile = localFiles.find(f => f.name.endsWith('.html') || f.name === 'index.html');
    if (!htmlFile) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlFile.content, 'text/html');
    
    let current: HTMLElement | null = doc.body;
    for (const index of path) {
      if (!current || !current.children[index]) {
        current = null;
        break;
      }
      current = current.children[index] as HTMLElement;
    }

    if (current) {
      updateFn(current);
      
      // Serialize back to HTML string
      const newHtml = '<!DOCTYPE html>\\n' + doc.documentElement.outerHTML;
      skipIframeReload.current = true;
      handleFileChange(newHtml, htmlFile.name);
    }
  };

  const handleFileChange = (newContent: string, fileName?: string) => {
    const targetFile = fileName || activeFile;
    const newFiles = localFiles.map(f => 
      f.name === targetFile ? { ...f, content: newContent } : f
    );
    setLocalFiles(newFiles);
    if (onFileChange) {
      onFileChange(newFiles);
    }
  };
`;

content = content.replace(/const updateLocalHtml = \([\s\S]*?};/, updateHtmlFunction.trim());

const handlersCode = `
  const handleUpdateStyle = (property: string, value: string) => {
    if (!selectedElement) return;
    
    setSelectedElement((prev: any) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [property]: value
      }
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_STYLE',
        id: selectedElement.id,
        property,
        value
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
       // Convert camelCase to kebab-case
       const kebabProp = property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
       el.style.setProperty(kebabProp, value);
    });
  };

  const handleUpdateText = (text: string) => {
    if (!selectedElement) return;
    
    setSelectedElement((prev: any) => ({
      ...prev,
      textContent: text
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_TEXT',
        id: selectedElement.id,
        text
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
       el.textContent = text;
    });
  };
`;

content = content.replace(/const handleUpdateStyle = [\s\S]*?\}\s*\};\s*const handleUpdateText = [\s\S]*?\}\s*\};/, handlersCode.trim());

const messageListener = `
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'FORGE_ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        if (!isInspectorOpen) setIsInspectorOpen(true);
      } else if (e.data.type === 'FORGE_DOM_TREE') {
        setDomTree(e.data.tree);
      } else if (e.data.type === 'FORGE_TEXT_EDITED') {
         // Find element by id in domTree or fallback? 
         // Actually, if we just edited text, selectedElement is likely the one.
         // But let's just use selectedElement if the IDs match.
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
  }, [isInspectorOpen, localFiles]); // added localFiles to dependencies so updateLocalHtml has fresh closure
`;

content = content.replace(/useEffect\(\(\) => \{\s*const handleMessage = [\s\S]*?\}\s*\}, \[isInspectorOpen\]\);/, messageListener.trim());

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched Workspace.tsx handlers');
