const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

const generateStart = code.indexOf("const handleGenerate = async (prompt: string, useThinking: boolean, attachments: Attachment[]) => {");
const generateEnd = code.indexOf("const handleAssetInject", generateStart);

const newGenerateCode = `const handleGenerate = async (prompt: string, useThinking: boolean, attachments: Attachment[]) => {
    isSubmitting.current = true;
    
    if (draftTimeout.current) clearTimeout(draftTimeout.current);
    
    setIsGenerating(true);
    onGeneratingChange?.(true);
    setError(null);
    
    try {
      if (globalMode && projects.length > 0 && !currentProject) {
          // Global Mode: Apply mutation to ALL projects concurrently
          if (draftAbortController.current) {
            draftAbortController.current.abort();
            draftAbortController.current = null;
          }
          
          const promises = projects.map(async (p) => {
             const pFiles = p.versions[p.currentVersionIndex].files;
             const finalFiles = await generateCode(
               prompt, 
               useThinking, 
               attachments, 
               pFiles
             );
             addVersionToProject(p.id, finalFiles, prompt);
          });
          
          await Promise.all(promises);
      } else {
          // Isolated Mode
          let finalFiles: GeneratedFile[];
          
          if (currentProject && !useThinking && attachments.length === 0 && prompt === lastDraftPrompt.current) {
             if (draftPromise.current) {
                 finalFiles = await draftPromise.current;
             } else if (previewFiles) {
                 finalFiles = previewFiles;
             } else {
                 if (draftAbortController.current) {
                   draftAbortController.current.abort();
                   draftAbortController.current = null;
                 }
                 finalFiles = await generateCode(
                   prompt, 
                   useThinking, 
                   attachments, 
                   currentFiles,
                   (partialFiles) => setPreviewFiles(partialFiles)
                 );
             }
             addVersion(finalFiles, prompt);
          } else {
            if (draftAbortController.current) {
              draftAbortController.current.abort();
              draftAbortController.current = null;
            }
            
            finalFiles = await generateCode(
              prompt, 
              useThinking, 
              attachments, 
              currentProject ? currentFiles : [],
              (partialFiles) => setPreviewFiles(partialFiles)
            );
            
            if (currentProject) {
              addVersion(finalFiles, prompt);
            } else {
              createProject(finalFiles, prompt);
            }
          }
      }
    } catch (err: any) {
      if (err.message !== 'AbortError') {
        setError(err.message || 'Something went wrong while generating code.');
      }
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
      setPreviewFiles(null);
      isSubmitting.current = false;
      draftPromise.current = null;
      lastDraftPrompt.current = '';
    }
  };

  `;

code = code.substring(0, generateStart) + newGenerateCode + code.substring(generateEnd);

fs.writeFileSync(forgeViewPath, code);
