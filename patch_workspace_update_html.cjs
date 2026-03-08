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

content = content.replace(/const handleFileChange = \([\s\S]*?};/, updateHtmlFunction.trim());

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched updateLocalHtml');
