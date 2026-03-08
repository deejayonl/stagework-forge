const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/Workspace.tsx');
let content = fs.readFileSync(file, 'utf8');

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

if (!content.includes('className="absolute z-[9999] bg-white border border-gray-200 rounded-md shadow-lg py-1 w-48"')) {
  // Find the last </div>
  const lastDivIndex = content.lastIndexOf('</div>');
  content = content.slice(0, lastDivIndex) + jsx + content.slice(lastDivIndex);
  fs.writeFileSync(file, content);
  console.log('JSX injected');
} else {
  console.log('JSX already present');
}
