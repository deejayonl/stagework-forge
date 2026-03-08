const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

const wrapperMatch = /const Workspace = \(props: WorkspaceProps\) => \([\s\S]*?export default Workspace;/;
const newWrapper = `const Workspace = (props: WorkspaceProps) => {
  return (
    <WorkspaceProvider 
      initialState={{ files: props.files, status: "idle" }} 
      onStateChange={(state) => {
        if (props.onFileChange && state.files && state.files.length > 0) {
          props.onFileChange(state.files, 'History Change');
        }
      }}
    >
      <WorkspaceInner {...props} />
    </WorkspaceProvider>
  );
};

export default Workspace;`;

content = content.replace(wrapperMatch, newWrapper);

const localFilesMatch = "const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);";
const useEffectAdd = `const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);

  // Sync localFiles when history changes via undo/redo
  useEffect(() => {
    if (history.present.files && history.present.files.length > 0) {
      setLocalFiles(history.present.files);
    }
  }, [history.present.files]);`;

content = content.replace(localFilesMatch, useEffectAdd);

// Replace handleFileChange
const handleFileChangeMatch = /const handleFileChange = \([\s\S]*?\n\s*if \(onFileChange\) \{\n\s*onFileChange\(newFiles, commitDescription\);\n\s*\}\n\s*\};/;
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

// Remove pushUndoState
content = content.replace(/const pushUndoState = \(prevFiles: GeneratedFile\[\]\) => \{\n\s*pushState\(\{ files: localFiles \}\);\n\s*\};\n/g, '');

fs.writeFileSync('src/components/Workspace.tsx', content);
