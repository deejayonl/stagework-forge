const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Workspace.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add contextMenu state
if (!content.includes('contextMenu')) {
  content = content.replace(
    /const \[isDeployOpen, setIsDeployOpen\] = useState\(false\);/,
    `const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, element: any} | null>(null);`
  );
}

// 2. Add FORGE_CONTEXT_MENU handler
if (!content.includes('FORGE_CONTEXT_MENU')) {
  content = content.replace(
    /else if \(e\.data\.type === 'FORGE_EXECUTE_ACTION'\) {/,
    `else if (e.data.type === 'FORGE_CONTEXT_MENU') {
         setSelectedElement(e.data.element);
         setContextMenu({
           x: e.data.x,
           y: e.data.y,
           element: e.data.element
         });
      } else if (e.data.type === 'FORGE_EXECUTE_ACTION') {`
  );
}

// 3. Add context menu actions
if (!content.includes('handleCopyHtml')) {
  content = content.replace(
    /const handleDuplicateElement = \(\) => {/,
    `const handleCopyHtml = () => {
    if (!selectedElement) return;
    navigator.clipboard.writeText(selectedElement.outerHTML || '').then(() => {
      setContextMenu(null);
    });
  };

  const handlePasteHtml = async () => {
    if (!selectedElement) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateLocalHtml(selectedElement.path, (el) => {
          el.insertAdjacentHTML('afterend', text);
        }, false, 'Paste HTML');
      }
    } catch (e) {
      console.error('Failed to read clipboard');
    }
    setContextMenu(null);
  };

  const handleSaveAsComponent = () => {
    if (!selectedElement || !onUpdateComponents) return;
    const name = prompt('Enter a name for this component:');
    if (name) {
      const html = selectedElement.outerHTML || '';
      onUpdateComponents({
        ...components,
        [name]: html
      });
    }
    setContextMenu(null);
  };

  const handleDuplicateElement = () => {`
  );
}

// 4. Update handleDeleteElement to close context menu
if (!content.includes('setContextMenu(null);') && content.includes('const handleDeleteElement = () => {')) {
  content = content.replace(
    /setSelectedElement\(null\);\s*};/,
    `setSelectedElement(null);
    setContextMenu(null);
  };`
  );
}

// 5. Update handleDuplicateElement to close context menu
if (content.includes('const handleDuplicateElement = () => {')) {
  content = content.replace(
    /el\.parentNode\?\.insertBefore\(clone, el\.nextSibling\);\s*}, false, 'Duplicate Element'\);\s*};/,
    `el.parentNode?.insertBefore(clone, el.nextSibling);
    }, false, 'Duplicate Element');
    setContextMenu(null);
  };`
  );
}

// 6. Close context menu when clicking elsewhere
if (!content.includes('handleGlobalClick')) {
  content = content.replace(
    /return \(\s*<div className='flex flex-col h-full bg-white relative'>/,
    `const handleGlobalClick = () => {
    if (contextMenu) setContextMenu(null);
  };

  return (
    <div className='flex flex-col h-full bg-white relative' onClick={handleGlobalClick}>`
  );
}

// 7. Render Context Menu JSX
if (!content.includes('className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg"')) {
  const jsx = `
        {contextMenu && (
          <div
            className="absolute z-[9999] bg-white border border-gray-200 rounded-md shadow-lg py-1 w-48"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleDuplicateElement}
            >
              Duplicate
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDeleteElement}
            >
              Delete
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleCopyHtml}
            >
              Copy HTML
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handlePasteHtml}
            >
              Paste HTML
            </button>
            {onUpdateComponents && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleSaveAsComponent}
                >
                  Save as Component
                </button>
              </>
            )}
          </div>
        )}
`;

  content = content.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)$/,
    `          ${jsx}
        </div>
      </div>
    </div>
  </div>
</div>
  )`
  );
}

fs.writeFileSync(file, content);
console.log('Patched Workspace.tsx for context menu');
