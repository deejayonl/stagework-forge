import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import PromptInput from '../../components/PromptInput';
import Workspace from '../../components/Workspace';
import ImageTool from '../../components/ImageTool';
import ProjectSidebar from '../../components/ProjectSidebar';
import CloudConfig from '../../components/CloudConfig';
import { generateCode } from '../../services/geminiService';
import { Attachment, GeneratedFile, BatchImageGeneration } from '../../types';
import { Sparkles, Layout, Monitor, Briefcase, ChevronRight } from 'lucide-react';
import { ExportModal } from '../../components/ExportModal';
import { ProjectSettingsModal } from '../../components/ProjectSettingsModal';
import { useProjects } from '../../hooks/useProjects';
import LiveCursors from '../../components/LiveCursors';


const SUGGESTIONS = [
  { label: 'Portfolio', prompt: "Create a stunning personal portfolio website with a dark mode aesthetic, a project gallery grid, an 'About Me' section with skill tags, and a working contact form." },
  { label: 'SaaS Dashboard', prompt: "Build a modern SaaS analytics dashboard with a collapsible sidebar, overview charts using dummy data, a recent activity table, and a user profile settings page." },
  { label: 'E-commerce', prompt: "Design a high-converting product landing page for a premium coffee brand, featuring a hero video section, product feature grid, customer reviews, and a sticky 'Buy Now' button." },
  { label: 'Calculator', prompt: "Develop a complex mortgage calculator that includes real-time monthly payment updates, an interactive slider for interest rates, and a visual amortization schedule." },
  { label: 'Chat App', prompt: "Build a responsive chat interface with a contact list sidebar, message history view, typing indicators, and a message input area with attachment support." },
  { label: 'Kanban Board', prompt: "Create a Trello-style Kanban board application with drag-and-drop columns for 'To Do', 'In Progress', and 'Done', allowing users to add and edit task cards." },
  { label: 'Crypto Tracker', prompt: "Design a cryptocurrency price tracker with a live ticker, a detailed coin list with percentage changes, and a portfolio value chart." },
];

interface ForgeViewProps {
  onGeneratingChange?: (isGenerating: boolean) => void;
  initialWorkspaces?: any[];
}

const ForgeView: React.FC<ForgeViewProps> = ({ onGeneratingChange, initialWorkspaces }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImageToolOpen, setIsImageToolOpen] = useState(false);
  const [imagePickCallback, setImagePickCallback] = useState<((url: string) => void) | null>(null);
  const [isCloudConfigOpen, setIsCloudConfigOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  
  
  // Storage Token State
  const [cloudToken, setCloudToken] = useState<string | null>(localStorage.getItem('forge_cloud_token'));

  const handleSetCloudToken = (newToken: string | null) => {
      if (newToken) {
          localStorage.setItem('forge_cloud_token', newToken);
      } else {
          localStorage.removeItem('forge_cloud_token');
      }
      setCloudToken(newToken);
  };
  
  // Project Management with Storage Token
  const { 
    projects, 
    currentProject, 
    currentFiles, 
    createProject, 
    addVersion, 
    updateCurrentVersion,
    updateProjectVariables,
    updateProjectComponents,
    updateProjectTheme,
    updateProjectSEO,
    updateProjectCollections,
    updateProjectApis,
    updateProjectAssets,
    addVersionToProject,
    deleteProject, 
    selectProject, 
    startNewProject,
    loadProjectsFromBFF,
    canUndo,
    canRedo,
    undo,
    redo,
    jumpToVersion,
    activeUsers
  } = useProjects(cloudToken);
  
  // Theme State
  
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  
  const [globalMode, setGlobalMode] = useState(true);

  useEffect(() => {
    if (initialWorkspaces && initialWorkspaces.length > 0 && projects.length === 0 && !isBootstrapping) {
      const activeWorkspace = initialWorkspaces[0];
      const blueprintNodes = activeWorkspace.nodes.filter((n: any) => n.id.startsWith('blueprint-'));
      
      if (blueprintNodes.length > 0) {
        bootstrapBlueprints(blueprintNodes);
      }
    }
  }, [initialWorkspaces, projects.length]);

  const bootstrapBlueprints = async (nodes: any[]) => {
    setIsBootstrapping(true);
    setGlobalMode(true);
    for (const node of nodes) {
       
       try {
           const prompt = `Generate a complete frontend for this blueprint:\n${node.title}\n\n${node.content}`;
           const finalFiles = await generateCode(prompt, false, [], []);
           createProject(finalFiles, node.title);
       } catch (err) {
           console.error("Failed to bootstrap", node.title, err);
       }
    }
    setIsBootstrapping(false);
    startNewProject(); // Clear current project to enter global mode
  };

const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#000000');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#fafafa'); // hall-50
    }
  }, [isDark]);

  const handleUndo = useCallback(() => {
    if (fileChangeTimeout.current) clearTimeout(fileChangeTimeout.current);
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    if (fileChangeTimeout.current) clearTimeout(fileChangeTimeout.current);
    redo();
  }, [redo]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) handleRedo();
        } else {
          if (canUndo) handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  const fileChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleWorkspaceFileChange = (files: GeneratedFile[], commitDescription?: string) => {
    if (previewFiles) return;
    
    if (commitDescription) {
      if (fileChangeTimeout.current) clearTimeout(fileChangeTimeout.current);
      addVersion(files, commitDescription);
    } else {
      updateCurrentVersion(files);
      if (fileChangeTimeout.current) clearTimeout(fileChangeTimeout.current);
      fileChangeTimeout.current = setTimeout(() => {
        addVersion(files, 'Editor Mutation');
      }, 1500);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  const handleExportOpen = () => setIsExportModalOpen(true);
  
  const handleDeployConfirm = async (framework: string, provider: string) => {
    if (!currentProject) return;
    const API_BASE = 'https://sgfbackend.deejay.onl/api/deploy';
    setIsExportModalOpen(false);
    
    try {
      window.open(`${API_BASE}/${provider}/${currentProject.id}?framework=${framework}`, '_blank');
    } catch (err) {
      console.error('Deploy failed:', err);
      alert('Deployment failed. Please try again later.');
    }
  };

  const handleExportConfirm = (framework: string) => {
    if (!currentProject) return;
    const API_BASE = 'https://sgfbackend.deejay.onl/api/export';
    window.open(`${API_BASE}/${currentProject.id}?framework=${framework}`, '_blank');
    setIsExportModalOpen(false);
  };


  const [previewFiles, setPreviewFiles] = useState<GeneratedFile[] | null>(null);
  const draftAbortController = useRef<AbortController | null>(null);
  const draftTimeout = useRef<NodeJS.Timeout | null>(null);
  const draftPromise = useRef<Promise<GeneratedFile[]> | null>(null);
  const isSubmitting = useRef(false);
  const lastDraftPrompt = useRef('');

  const handleDraftChange = (prompt: string) => {
    if (isSubmitting.current) return;
    
    // Only draft if we have an existing project
    if (!currentProject || currentFiles.length === 0) return;
    
    // Clear draft if prompt is empty
    if (!prompt.trim()) {
      if (draftAbortController.current) {
        draftAbortController.current.abort();
        draftAbortController.current = null;
      }
      setPreviewFiles(null);
      draftPromise.current = null;
      lastDraftPrompt.current = '';
      return;
    }

    lastDraftPrompt.current = prompt;

    if (draftTimeout.current) {
      clearTimeout(draftTimeout.current);
    }
    
    draftTimeout.current = setTimeout(() => {
      if (draftAbortController.current) {
        draftAbortController.current.abort();
      }
      draftAbortController.current = new AbortController();
      
      const promise = generateCode(
        prompt, 
        false, 
        [], 
        currentFiles,
        (partialFiles) => {
            setPreviewFiles(partialFiles);
        },
        draftAbortController.current.signal
      ).then(finalFiles => {
        setPreviewFiles(finalFiles);
        return finalFiles;
      }).catch(err => {
        if (err.message !== 'AbortError') {
          console.error("Draft error:", err);
        }
        throw err;
      });
      
      draftPromise.current = promise;
    }, 1000);
  };


  const handleGenerate = async (prompt: string, useThinking: boolean, attachments: Attachment[]) => {
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

  const handleAssetInject = async (base64: string, filename: string, originalPrompt: string) => {
    setIsGenerating(true);
    onGeneratingChange?.(true);
    setError(null);
    
    const newAssetFile: GeneratedFile = {
      name: filename,
      content: base64,
      type: 'image'
    };

    if (currentProject) {
      const updatedAssets = { ...(currentProject.assets || {}) };
      updatedAssets[filename] = base64;
      updateProjectAssets(updatedAssets);
    }

    const integrationPrompt = `
SYSTEM UPDATE: A new asset has been created and added to the project file system.

Asset Details:
- Name: "${filename}"
- Description: "${originalPrompt}"

TASK:
Analyze the current HTML/CSS and inject this asset in the most relevant location.
1. If this is a logo, replace the current logo text/image.
2. If this is a background, update the relevant CSS class or style.
3. If this is a generic image, find a placeholder (like picsum.photos) and replace it.
4. IMPORTANT: You MUST use the exact path "${filename}" in the src="" or url() attribute.
5. Do not delete other files. Return the full project code.
`;

    try {
      const updatedContext = [...currentFiles, newAssetFile];
      const generatedFiles = await generateCode(integrationPrompt, false, [], updatedContext);
      
      const assetExists = generatedFiles.find(f => f.name === filename);
      const finalFiles = assetExists ? generatedFiles : [...generatedFiles, newAssetFile];

      if (currentProject) {
        addVersion(finalFiles, `Integrated asset: ${filename}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to integrate asset.');
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  };

  const handleBatchAssetReplace = async (replacements: BatchImageGeneration[]) => {
    setError(null);

    try {
        let finalFiles = [...currentFiles];

        finalFiles = finalFiles.map(file => {
            if (file.type === 'image') return file;
            let newContent = file.content;
            replacements.forEach(replacement => {
                if (replacement.targetUrl) {
                     newContent = newContent.split(replacement.targetUrl).join(replacement.newAsset.name);
                }
            });
            return { ...file, content: newContent };
        });

        replacements.forEach(replacement => {
             const existingIndex = finalFiles.findIndex(f => f.name === replacement.newAsset.name);
             if (existingIndex >= 0) {
                 finalFiles[existingIndex] = replacement.newAsset;
             } else {
                 finalFiles.push(replacement.newAsset);
             }
        });

        if (currentProject) {
            const count = replacements.length;
            const logMsg = count === 1 
                ? `Replaced asset '${replacements[0].targetUrl?.split('/').pop()}' with '${replacements[0].newAsset.name}'`
                : `Batch replaced ${count} assets`;
            addVersion(finalFiles, logMsg);
        }

    } catch (err: any) {
        setError(err.message || 'Failed to replace assets.');
    } 
  };

  const hasProject = currentFiles.length > 0 || projects.length > 0;
  const isInitialGen = isGenerating && !hasProject;


  return (
    <div className="h-full flex flex-col bg-transparent text-hall-50 overflow-hidden font-sans selection:bg-hall-950 selection:text-hall-50 relative">
      <LiveCursors roomName={currentProject?.id || 'global'} />
      {/* Soft gradient to make text readable but keep canvas visible */}
      
      {/* Re-add gradient overlay but lighter */}
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasProject ? 'opacity-0' : 'opacity-100'}`}>
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[120px]" />
        </div>
      </div>

      <Header 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        projectName={currentProject?.name}
        onOpenAssets={() => {
          setImagePickCallback(null);
          setIsImageToolOpen(true);
        }}
        onExport={currentProject ? handleExportOpen : undefined}
        onOpenSettings={currentProject ? () => setIsSettingsOpen(true) : undefined}
        activeUsers={activeUsers}
      />

      <ProjectSidebar 
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelect={selectProject}
        onDelete={deleteProject}
        onNew={startNewProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLoadFromBFF={loadProjectsFromBFF}
      />
      
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportConfirm}
        onDeploy={handleDeployConfirm}
        projectName={currentProject?.name || 'My Project'}
      />

      {isSettingsOpen && currentProject && (
        <ProjectSettingsModal 
          seo={currentProject.seo || {}}
          onUpdateSEO={updateProjectSEO}
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <div 
        className={`absolute inset-0 z-25 bg-black/20 backdrop-blur-[1px] transition-opacity duration-500 ${
           isInitialGen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
      />

      <main className="flex-1 relative w-full h-full">
        
        <div 
          className={`absolute left-0 right-0 bottom-0 top-[64px] z-10 px-2 pb-24 md:px-4 md:pb-32 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            hasProject 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-[20px] scale-95 pointer-events-none'
          }`}
        >
          <div className="w-full h-full">
             {hasProject && globalMode && !currentProject ? (
                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-8">
                  {projects.map(p => (
                    <div key={p.id} className="h-[60vh] md:h-full relative rounded-[32px] overflow-hidden border border-amber-500/20 shadow-lg" onClick={() => { setGlobalMode(false); selectProject(p.id); }}>
                       <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-md text-white text-xs font-bold py-2 px-4 z-20 flex justify-between items-center cursor-pointer hover:bg-black/80 transition-colors">
                          <span>{p.name}</span>
                          <span className="text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Select to Isolate</span>
                       </div>
                       <div className="w-full h-full pt-8 pointer-events-none">
                         <Workspace 
                           projectId={p.id}
                           files={p.versions[p.currentVersionIndex].files}
                           variables={p.variables || {}}
                           components={p.components || {}}
                           onUpdateVariables={() => {}}
                           onUpdateComponents={() => {}}
                           onFileChange={() => {}}
                           onOpenImageTool={(callback) => {
                             setImagePickCallback(() => callback);
                             setIsImageToolOpen(true);
                           }}
                         />
                       </div>
                    </div>
                  ))}
                </div>
             ) : (
                hasProject && <Workspace 
                 projectId={currentProject?.id}
                 files={previewFiles || currentFiles}
                 versions={currentProject?.versions}
                 currentVersionIndex={currentProject?.currentVersionIndex}
                 onJumpToVersion={jumpToVersion} 
                 variables={currentProject?.variables || {}}
                 components={currentProject?.components || {}}
                 theme={currentProject?.theme || {}}
                 seo={currentProject?.seo || {}}
                 collections={currentProject?.collections || {}}
                 apis={currentProject?.apis || {}}
                 onUpdateVariables={updateProjectVariables}
                 onUpdateComponents={updateProjectComponents}
                 onUpdateTheme={updateProjectTheme}
                 onUpdateCollections={updateProjectCollections}
                 onUpdateApis={updateProjectApis}
                 assets={currentProject?.assets || {}}
                 onUpdateAssets={updateProjectAssets}
                 onUpdateSEO={updateProjectSEO}
                 onFileChange={handleWorkspaceFileChange}
                 onOpenImageTool={(callback) => {
                   setImagePickCallback(() => callback);
                   setIsImageToolOpen(true);
                 }}
               />
             )}
          </div>
        </div>

        <div 
          className={`absolute inset-0 z-[60] flex flex-col items-center pointer-events-none transition-all duration-500 ease-out ${
            (hasProject || isGenerating) ? 'opacity-0 -translate-y-[40px] scale-95 blur-sm' : 'opacity-100 translate-y-0 scale-100 blur-0'
          }`}
        >
           <div className="text-center px-5 max-w-4xl mx-auto w-full pt-[12vh] md:pt-[15vh]">
             
             
             <h1 className="text-[2rem] leading-[1.15] sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-6 tracking-tighter text-ink text-center">
               All great outputs start with{' '}
               <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                 intentional input
               </span>
               .
             </h1>
             <p className="text-hall-500 text-center mb-8 max-w-2xl mx-auto">
               Take 5 minutes to write your ideas out. We need to compact user ideas into executable plans.
             </p>
             
             <p className="hidden md:block text-hall-500 max-w-xl mx-auto text-lg leading-relaxed mb-8 font-medium">
               Just tell me what you want to create, attach a screenshot, or paste a wireframe. 
               I'll write the production-ready code for you in seconds.
             </p>
             <p className="md:hidden text-hall-500 max-w-xs mx-auto text-[15px] leading-relaxed mb-5 font-medium">
               Describe what you want to build. Attach screenshots for context.
             </p>

             {/* Starter Templates */}
             <div className="mt-16 max-w-3xl mx-auto pointer-events-auto">
               <div className="flex items-center justify-center gap-2 mb-6">
                 <Sparkles className="w-5 h-5 text-amber-500" />
                 <h2 className="text-xl font-bold text-hall-900 dark:text-ink">Starter Templates</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { id: 'landing', icon: Layout, title: 'Landing Page', desc: 'High-converting modern landing page', prompt: 'Create a modern landing page with a hero section, features grid, social proof testimonials, and a clear call-to-action footer. Use a clean, minimal aesthetic.' },
                   { id: 'dashboard', icon: Monitor, title: 'SaaS Dashboard', desc: 'Analytics dashboard with sidebar', prompt: 'Build a SaaS analytics dashboard with a collapsible sidebar navigation, top header with user profile, summary stat cards, and a data table for recent transactions.' },
                   { id: 'portfolio', icon: Briefcase, title: 'Personal Portfolio', desc: 'Showcase your work & skills', prompt: 'Design a personal developer portfolio with a hero section introducing the person, a masonry grid of past projects, a skills section, and a contact form. Use a dark mode aesthetic.' },
                 ].map(template => (
                   <button
                     key={template.id}
                     onClick={() => {
                       setSuggestion(template.prompt);
                       // Add a slight delay to let the suggestion populate before focusing/generating
                       setTimeout(() => {
                         const input = document.querySelector('textarea');
                         if (input) input.focus();
                       }, 100);
                     }}
                     className="group flex flex-col items-start p-5 rounded-2xl bg-white/50 dark:bg-hall-900/50 border border-hall-200 dark:border-hall-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-white dark:hover:bg-hall-900 shadow-sm hover:shadow-md transition-all duration-300 ease-out text-left focus:outline-none focus:ring-2 focus:ring-amber-500 hover:-translate-y-1"
                   >
                     <div className="p-3 rounded-xl bg-hall-100 dark:bg-hall-800 text-hall-600 dark:text-hall-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-4">
                       <template.icon className="w-6 h-6" />
                     </div>
                     <h3 className="text-lg font-bold text-hall-900 dark:text-ink mb-1 flex items-center justify-between w-full">
                       {template.title}
                       <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-amber-500" />
                     </h3>
                     <p className="text-sm text-hall-500 dark:text-hall-400 font-medium">{template.desc}</p>
                   </button>
                 ))}
               </div>
             </div>

           </div>
        </div>

        <div 
          className={`absolute left-0 right-0 z-50 flex flex-col items-center justify-start px-3 md:px-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isInitialGen 
              ? 'top-[15vh]' 
              : 'top-[80px]' 
          }`}
        >
          <div className={`w-full transition-all duration-700 ease-out pointer-events-auto ${hasProject ? 'max-w-2xl' : 'max-w-3xl'}`}>
             
             {/* Carousel immediately above the input prompt */}
             <div className="w-full pointer-events-auto overflow-x-auto scrollbar-hide md:mask-gradient md:overflow-hidden pb-4">
                <div className="flex gap-2 md:gap-3 md:animate-marquee md:hover:[animation-play-state:paused] md:w-max px-1">
                  {[...SUGGESTIONS, ...SUGGESTIONS].map((s, i) => (
                    <button 
                      key={`${s.label}-${i}`}
                      onClick={() => setSuggestion(s.prompt)}
                      className="px-5 py-2.5 rounded-full bg-hall-50 hover:bg-hall-200 active:bg-hall-300 dark:bg-hall-900/40 dark:hover:bg-hall-800 dark:active:bg-hall-700 backdrop-blur-sm border border-hall-200 dark:border-hall-800/50 text-sm font-semibold text-hall-600 dark:text-hall-300 hover:text-ink transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 hover:scale-[1.03] hover:-translate-y-0.5 whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-hall-950 shadow-sm hover:shadow-md"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
             </div>

             <PromptInput 
               onGenerate={handleGenerate}
               onChange={handleDraftChange} 
               isGenerating={isGenerating} 
               compact={hasProject} 
               suggestion={suggestion}
               onClearSuggestion={() => setSuggestion('')}
             />
             
             {error && (
               <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-800 rounded-2xl text-indigo-400 text-sm text-center animate-in slide-in-from-top-2 backdrop-blur-md shadow-lg">
                 {error}
               </div>
             )}
          </div>
        </div>

      </main>

      <ImageTool 
        isOpen={isImageToolOpen} 
        onClose={() => {
          setIsImageToolOpen(false);
          setImagePickCallback(null);
        }}
        files={currentFiles}
        onInjectAsset={hasProject ? handleAssetInject : undefined}
        onReplaceAsset={hasProject ? handleBatchAssetReplace : undefined}
        onPickAsset={imagePickCallback || undefined}
      />

      <CloudConfig 
        isOpen={isCloudConfigOpen}
        onClose={() => setIsCloudConfigOpen(false)}
        cloudToken={cloudToken}
        onSetCloudToken={handleSetCloudToken}
        files={currentFiles}
        projectName={currentProject?.name}
      />
    </div>
  );
};

export default ForgeView;
