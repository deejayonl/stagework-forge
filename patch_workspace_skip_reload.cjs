const fs = require('fs');
let content = fs.readFileSync('./src/components/Workspace.tsx', 'utf-8');

const effectCode = `
  const skipIframeReload = useRef(false);

  // Update preview whenever local files change (including edits)
  useEffect(() => {
    if (localFiles.length > 0) {
      if (skipIframeReload.current) {
        skipIframeReload.current = false;
        return;
      }
      const flattened = flattenFilesForPreview(localFiles);
      setIframeLoading(true);
      setPreviewSrc(flattened);
    }
  }, [localFiles]);
`;

content = content.replace(/\/\/ Update preview whenever local files change[\s\S]*?\}, \[localFiles\]\);/, effectCode.trim());

// Add useRef import if not there
if (!content.includes('useRef')) {
  content = content.replace('useState, useEffect', 'useState, useEffect, useRef');
}

fs.writeFileSync('./src/components/Workspace.tsx', content);
console.log('Patched skipIframeReload');
