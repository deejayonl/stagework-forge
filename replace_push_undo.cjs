const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

// Replace pushUndoState
content = content.replace(/const pushUndoState = \(prevFiles: GeneratedFile\[\]\) => {[\s\S]*?};/g, `const pushUndoState = (prevFiles: GeneratedFile[]) => {
    pushState({ files: localFiles });
  };`);

// Replace handleUndo
content = content.replace(/const handleUndo = \(\) => {[\s\S]*?};/g, `const handleUndo = () => {
    if (!canUndo) return;
    undo();
  };`);

// Replace handleRedo
content = content.replace(/const handleRedo = \(\) => {[\s\S]*?};/g, `const handleRedo = () => {
    if (!canRedo) return;
    redo();
  };`);

// Replace undoStack.length === 0 with !canUndo
content = content.replace(/undoStack\.length === 0/g, '!canUndo');

// Replace redoStack.length === 0 with !canRedo
content = content.replace(/redoStack\.length === 0/g, '!canRedo');

// Update dependencies in useEffect
content = content.replace(/\[undoStack, redoStack, localFiles, selectedElement\]/g, '[canUndo, canRedo, localFiles, selectedElement]');

fs.writeFileSync('src/components/Workspace.tsx', content);
