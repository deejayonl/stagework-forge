#!/bin/bash
cat << 'INNER' > replace_workspace.js
const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

// Replace the Workspace wrapper at the bottom
const wrapperMatch = /const Workspace = \(props: WorkspaceProps\) => \([\s\S]*?export default Workspace;/;
const newWrapper = `const Workspace = (props: WorkspaceProps) => {
  const handleStateChange = (state: any) => {
    if (props.onFileChange && state.files && state.files.length > 0) {
      props.onFileChange(state.files, 'History Change');
    }
  };

  return (
    <WorkspaceProvider initialState={{ files: props.files, status: "idle" }} onStateChange={handleStateChange}>
      <WorkspaceInner {...props} />
    </WorkspaceProvider>
  );
};

export default Workspace;`;

content = content.replace(wrapperMatch, newWrapper);

// We also need to update localFiles when history changes in WorkspaceInner
// Find the localFiles useState and add a useEffect below it
const localFilesMatch = "const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);";
const useEffectAdd = `const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);

  // Sync localFiles when history changes via undo/redo
  useEffect(() => {
    if (history.present.files && history.present.files.length > 0) {
      setLocalFiles(history.present.files);
    }
  }, [history.present.files]);`;

content = content.replace(localFilesMatch, useEffectAdd);

// In handleFileChange, when we do pushState, we also need to update localFiles.
// But wait, handleFileChange sets localFiles. pushUndoState pushes the OLD files.
// Let's modify pushUndoState.
// We want to push the PREVIOUS state before the change.
// But wait, WorkspaceContext pushState updates the PRESENT state and pushes the OLD present to past.
// So pushState({ files: newFiles }) will make newFiles the present, and the old files go to past.
// So in handleFileChange we should call pushState({ files: newFiles }) AFTER creating newFiles.

const handleFileChangeMatch = /const handleFileChange = \([\s\S]*?\n\s*if \(onFileChange\) \{[\s\S]*?\}\n\s*\};/;
const newHandleFileChange = `const handleFileChange = (newContent: string, fileName?: string, commitDescription?: string) => {
    const targetFile = fileName || activeFile;
    const newFiles = localFiles.map(f => 
      f.name === targetFile ? { ...f, content: newContent } : f
    );
    setLocalFiles(newFiles);
    pushState({ files: newFiles });
    if (onFileChange) {
      onFileChange(newFiles, commitDescription);
    }
  };`;

content = content.replace(handleFileChangeMatch, newHandleFileChange);

// Remove pushUndoState since we integrated it
content = content.replace(/const pushUndoState = \([\s\S]*?\n\s*\}\n\s*\};\n/g, '');

fs.writeFileSync('src/components/Workspace.tsx', content);
INNER

node replace_workspace.cjs
