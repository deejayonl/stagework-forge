const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const newFunc = `
  const updateLocalHtml = (path: number[], updateFn: (el: HTMLElement) => void, skipReload: boolean = true) => {
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
      skipIframeReload.current = skipReload;
      handleFileChange(newHtml, htmlFile.name);
    }
  };
`;

content = content.replace(/const updateLocalHtml = \([\s\S]*?\}\s*\};\s*const handleFileChange/, newFunc.trim() + '\n\n  const handleFileChange');

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched updateLocalHtml');
