import React, { useState, useEffect, useRef } from 'react';
import { GeneratedFile } from '../types';
import { flattenFilesForPreview, createZipDownload } from '../utils/fileUtils';
import { Code, Play, Download, FileJson, FileCode, Monitor, Tablet, Smartphone, Maximize2, Minimize2, ExternalLink, Loader2 } from 'lucide-react';
import CodeEditor from './CodeEditor';

import { PropertyInspector } from './PropertyInspector';
import { DOMTreeExplorer } from './DOMTreeExplorer';
import { ComponentLibrary } from './ComponentLibrary';
import { VariablesPanel } from './VariablesPanel';
import { ThemeEditor } from './ThemeEditor';
import { PagesManager } from './PagesManager';
import { CollectionsPanel } from './CollectionsPanel';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { Settings2, AlignLeft, Library, Database, Palette, Settings, List } from 'lucide-react';


interface WorkspaceProps {
  files: GeneratedFile[];
  variables?: Record<string, string>;
  components?: Record<string, string>;
  theme?: Record<string, string>;
  seo?: Record<string, string>;
  collections?: Record<string, any>;
  onUpdateVariables?: (variables: Record<string, string>) => void;
  onUpdateComponents?: (components: Record<string, string>) => void;
  onUpdateTheme?: (theme: Record<string, string>) => void;
  onUpdateSEO?: (seo: Record<string, string>) => void;
  onUpdateCollections?: (collections: Record<string, any>) => void;
  onFileChange?: (files: GeneratedFile[], commitDescription?: string) => void;
  onOpenImageTool?: (onPick: (url: string) => void) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  files, 
  variables = {}, 
  components = {},
  theme = {},
  seo = {},
  collections = {},
  onUpdateVariables, 
  onUpdateComponents,
  onUpdateTheme,
  onUpdateSEO,
  onUpdateCollections,
  onFileChange, 
  onOpenImageTool 
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [activeFile, setActiveFile] = useState<string>(files[0]?.name || '');
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentPage, setCurrentPage] = useState('index.html');
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Local state for files allows editing within the workspace session
  const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);

  // Sync local files when the project/generation changes from parent
  useEffect(() => {
    setLocalFiles(files);
    if (!files.find(f => f.name === activeFile)) {
      setActiveFile(files[0]?.name || '');
    }
  }, [files]);

  const skipIframeReload = useRef(false);

  // Update preview whenever local files change (including edits)
  useEffect(() => {
    if (localFiles.length > 0) {
      if (skipIframeReload.current) {
        skipIframeReload.current = false;
        return;
      }
      const flattened = flattenFilesForPreview(localFiles, currentPage);
      setIframeLoading(true);
      setPreviewSrc(flattened);
    }
  }, [localFiles, currentPage]);

  // Sync variables to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_VARIABLES',
        variables
      }, '*');
    }
  }, [variables]);

  // Sync theme to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_THEME',
        theme
      }, '*');
    }
  }, [theme]);

  // Sync SEO to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_SEO',
        seo
      }, '*');
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_COLLECTIONS',
        collections
      }, '*');
    }
  }, [seo]);

  const updateLocalHtml = (path: number[], updateFn: (el: HTMLElement) => void, skipReload: boolean = true, commitDescription?: string) => {
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
      const newHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
      skipIframeReload.current = skipReload;
      handleFileChange(newHtml, htmlFile.name, commitDescription);
    }
  };

  const handleFileChange = (newContent: string, fileName?: string, commitDescription?: string) => {
    const targetFile = fileName || activeFile;
    const newFiles = localFiles.map(f => 
      f.name === targetFile ? { ...f, content: newContent } : f
    );
    setLocalFiles(newFiles);
    if (onFileChange) {
      onFileChange(newFiles, commitDescription);
    }
  };

  const currentFile = localFiles.find(f => f.name === activeFile);
  const currentFileContent = currentFile?.content || '';

  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [domTree, setDomTree] = useState<any>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'FORGE_ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        if (!isInspectorOpen) setIsInspectorOpen(true);
      } else if (e.data.type === 'FORGE_DOM_TREE') {
        setDomTree(e.data.tree);
      } else if (e.data.type === 'FORGE_TEXT_EDITED') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  el.textContent = e.data.text;
               }, true, 'Update Text');
               return { ...prev, textContent: e.data.text };
            }
            return prev;
         });
      } else if (e.data.type === 'FORGE_DELETE_ELEMENT') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  el.remove();
               }, false, 'Delete Element');
               return null;
            }
            return prev;
         });
      } else if (e.data.type === 'FORGE_DUPLICATE_ELEMENT') {
         setSelectedElement((prev: any) => {
            if (prev && prev.id === e.data.id) {
               updateLocalHtml(prev.path, (el) => {
                  const clone = el.cloneNode(true);
                  if (clone instanceof HTMLElement) {
                     clone.removeAttribute('data-forge-id');
                     const descendants = clone.querySelectorAll('[data-forge-id]');
                     descendants.forEach(d => d.removeAttribute('data-forge-id'));
                  }
                  el.parentNode?.insertBefore(clone, el.nextSibling);
               }, false, 'Duplicate Element');
            }
            return prev;
         });
      } else if (e.data.type === 'FORGE_INSERT_COMPONENT') {
         const { html, componentName, targetId } = e.data;
         setLocalFiles(prevFiles => {
             const newFiles = [...prevFiles];
             const fileIndex = newFiles.findIndex(f => f.name === activeFile);
             if (fileIndex === -1) return prevFiles;

             const parser = new DOMParser();
             const doc = parser.parseFromString(newFiles[fileIndex].content, 'text/html');
             const target = targetId ? doc.querySelector(`[data-forge-id="${targetId}"]`) : doc.body;
             
             if (target) {
                 const wrapper = doc.createElement('div');
                 wrapper.innerHTML = html.trim();
                 const child = wrapper.firstElementChild;
                 if (child) {
                     if (componentName) {
                         child.setAttribute('data-component', componentName);
                     }
                     target.appendChild(child);
                 }
             }

             newFiles[fileIndex] = {
                 ...newFiles[fileIndex],
                 content: doc.documentElement.outerHTML
             };

             if (onFileChange) {
                 onFileChange(newFiles, 'Drag and Drop Component');
             }
             return newFiles;
         });
      } else if (e.data.type === 'FORGE_EXECUTE_ACTION') {
         if (onUpdateVariables) {
            const { action, key, value } = e.data;
            const currentVars = variables || {};
            let newValue = value;
            
            if (action === 'toggleVariable') {
               newValue = currentVars[key] === 'true' ? 'false' : 'true';
            }
            
            onUpdateVariables({
               ...currentVars,
               [key]: newValue
            });
         }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInspectorOpen, localFiles, variables, onUpdateVariables]); // added localFiles to dependencies

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      el.remove();
    }, false, 'Delete Element');
    setSelectedElement(null);
  };

  const handleDuplicateElement = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      const clone = el.cloneNode(true);
      if (clone instanceof HTMLElement) {
         clone.removeAttribute('data-forge-id');
         const descendants = clone.querySelectorAll('[data-forge-id]');
         descendants.forEach(d => d.removeAttribute('data-forge-id'));
      }
      el.parentNode?.insertBefore(clone, el.nextSibling);
    }, false, 'Duplicate Element');
  };

  const handleInsertComponent = (html: string) => {
    if (selectedElement) {
      updateLocalHtml(selectedElement.path, (el) => {
        el.insertAdjacentHTML('beforeend', html);
      }, false, 'Insert Component');
    } else {
      updateLocalHtml([], (el) => {
        el.insertAdjacentHTML('beforeend', html);
      }, false, 'Insert Component');
    }
  };

  const handleAutoFix = (fixedHtml: string) => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = fixedHtml.trim();
      const newEl = tempDiv.firstElementChild;
      if (newEl && el.parentNode) {
        // Retain the forge ID so selection works
        const forgeId = el.getAttribute('data-forge-id');
        if (forgeId) newEl.setAttribute('data-forge-id', forgeId);
        el.parentNode.replaceChild(newEl, el);
      }
    }, false, 'AI Auto-Fix');
  };

  const handleUpdateSrc = (url: string) => {
    if (!selectedElement) return;

    setSelectedElement((prev: any) => ({
      ...prev,
      src: url
    }));

    // Find the actual base64 content for the preview
    const assetFile = localFiles.find(f => f.name === url || f.name.endsWith(url));
    const previewUrl = assetFile && assetFile.content.startsWith('data:image') ? assetFile.content : url;

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_SRC',
        id: selectedElement.id,
        url: previewUrl
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
       el.setAttribute('src', url);
    }, true, 'Update Image');
  };

  const handleToggleClass = (className: string, toggle: boolean) => {
    if (!selectedElement) return;

    const newClassStr = toggle 
      ? `${selectedElement.className || ''} ${className}`.trim() 
      : (selectedElement.className || '').replace(new RegExp(`\\b${className}\\b`, 'g'), '').trim();

    setSelectedElement((prev: any) => ({
      ...prev,
      className: newClassStr
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_TOGGLE_CLASS',
        id: selectedElement.id,
        className,
        toggle
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
      if (toggle) el.classList.add(className);
      else el.classList.remove(className);

      if (className === 'animate-on-scroll' && toggle) {
         const doc = el.ownerDocument;
         let scriptBlock = doc.getElementById('forge-scroll-observer');
         if (!scriptBlock) {
            scriptBlock = doc.createElement('script');
            scriptBlock.id = 'forge-scroll-observer';
            scriptBlock.textContent = `
              document.addEventListener('DOMContentLoaded', () => {
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('is-visible');
                      observer.unobserve(entry.target);
                    }
                  });
                });
                document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
              });
            `;
            doc.body.appendChild(scriptBlock);
         }
         
         let styleBlock = doc.getElementById('forge-scroll-styles');
         if (!styleBlock) {
            styleBlock = doc.createElement('style');
            styleBlock.id = 'forge-scroll-styles';
            styleBlock.textContent = `
              .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
              }
              .animate-on-scroll.is-visible {
                opacity: 1;
                transform: translateY(0);
              }
            `;
            doc.head.appendChild(styleBlock);
         }
      }
    }, true, `Toggle class ${className}`);
  };

  const handleUpdateStyle = (property: string, value: string, state?: string) => {
    if (!selectedElement) return;
    
    setSelectedElement((prev: any) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [property]: value
      }
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_STYLE',
        id: selectedElement.id,
        property,
        value,
        breakpoint,
        state
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
       const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
       
       if (state === 'hover') {
         let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-hover-'));
         if (!uniqueClass) {
           uniqueClass = 'forge-hover-' + Math.random().toString(36).substring(2, 9);
           el.classList.add(uniqueClass);
         }
         
         const doc = el.ownerDocument;
         let styleBlock = doc.getElementById('forge-hover-styles');
         if (!styleBlock) {
           styleBlock = doc.createElement('style');
           styleBlock.id = 'forge-hover-styles';
           doc.head.appendChild(styleBlock);
         }
         
         styleBlock.textContent += `\n.${uniqueClass}:hover { ${kebabProp}: ${value} !important; }`;
       } else if (breakpoint === 'desktop') {
         el.style.setProperty(kebabProp, value);
       } else {
         let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-resp-'));
         if (!uniqueClass) {
           uniqueClass = 'forge-resp-' + Math.random().toString(36).substring(2, 9);
           el.classList.add(uniqueClass);
         }
         
         const doc = el.ownerDocument;
         let styleBlock = doc.getElementById('forge-responsive-styles');
         if (!styleBlock) {
           styleBlock = doc.createElement('style');
           styleBlock.id = 'forge-responsive-styles';
           doc.head.appendChild(styleBlock);
         }
         
         const mediaQuery = breakpoint === 'mobile' ? '@media (max-width: 767px)' : '@media (min-width: 768px) and (max-width: 1023px)';
         styleBlock.textContent += `\n${mediaQuery} { .${uniqueClass} { ${kebabProp}: ${value} !important; } }`;
       }
    });
  };

  const handleUpdateText = (text: string) => {
    if (!selectedElement) return;
    
    setSelectedElement((prev: any) => ({
      ...prev,
      textContent: text
    }));

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_TEXT',
        id: selectedElement.id,
        text
      }, '*');
    }

    updateLocalHtml(selectedElement.path, (el) => {
       el.textContent = text;
    });
  };

  const handleBindVariable = (attribute: string, variableName: string) => {
    if (!selectedElement) return;

    const datasetKey = `bind${attribute.charAt(0).toUpperCase() + attribute.slice(1)}`;

    setSelectedElement((prev: any) => ({
      ...prev,
      dataset: {
        ...prev.dataset,
        [datasetKey]: variableName
      }
    }));

    updateLocalHtml(selectedElement.path, (el) => {
      if (variableName) {
        el.setAttribute(`data-bind-${attribute}`, variableName);
      } else {
        el.removeAttribute(`data-bind-${attribute}`);
      }
    }, false, `Bind ${attribute} to ${variableName}`);
  };

  const handleUpdateAttribute = (attr: string, value: string) => {
    if (!selectedElement) return;

    setSelectedElement((prev: any) => ({
      ...prev,
      dataset: {
        ...prev.dataset,
        [attr]: value
      }
    }));

    updateLocalHtml(selectedElement.path, (el) => {
      if (value) {
        el.setAttribute(attr, value);
      } else {
        el.removeAttribute(attr);
      }
    }, false, `Update ${attr} to ${value}`);
  };

  const handleSelectNode = (id: string) => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_SELECT_NODE',
        id
      }, '*');
    }
  };


  const getFileIcon = (name: string) => {
    if (name.endsWith('.html')) return <Monitor className="w-4 h-4" />;
    if (name.endsWith('.css')) return <FileCode className="w-4 h-4" />;
    if (name.endsWith('.js')) return <Code className="w-4 h-4" />;
    return <FileJson className="w-4 h-4" />;
  };

  const handleOpenNewWindow = () => {
    const blob = new Blob([previewSrc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  if (!localFiles || localFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full rounded-[32px] border border-hall-200 dark:border-hall-800 text-hall-500 dark:text-hall-400 p-8 text-center bg-white/50 dark:bg-hall-950/50 backdrop-blur-sm shadow-sm transition-all duration-300">
        <div className="bg-hall-100 dark:bg-hall-900 rounded-full p-5 mb-5 shadow-inner scale-100 hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          <Code className="w-8 h-8 text-hall-600 dark:text-hall-500" />
        </div>
        <h3 className="text-xl font-bold text-hall-900 dark:text-ink mb-2">No files yet</h3>
        <p className="text-sm max-w-sm font-medium">Generate some code or add files to see the preview and code editor here.</p>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col shadow-sm transition-all duration-500 ease-in-out h-full ${
        isFullScreen 
          ? 'absolute inset-0 z-[100]' 
          : 'w-full rounded-[32px] border border-hall-200 dark:border-hall-800'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-hall-200 dark:border-hall-800 bg-hall-50 dark:bg-hall-900/50 rounded-t-2xl md:rounded-t-3xl shrink-0">
        <div className="flex items-center gap-1 p-1 bg-hall-200 dark:bg-hall-800 rounded-full shadow-inner">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm scale-100'
                : 'text-hall-500 dark:text-hall-400 hover:text-hall-800 dark:hover:text-hall-200 hover:scale-105 active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              activeTab === 'code'
                ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm scale-100'
                : 'text-hall-500 dark:text-hall-400 hover:text-hall-800 dark:hover:text-hall-200 hover:scale-105 active:scale-95'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Code</span>
          </button>
        </div>

        {activeTab === 'preview' && (
          <div className="hidden md:flex items-center gap-1 p-1 bg-hall-200 dark:bg-hall-800 rounded-full shadow-inner animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setBreakpoint('desktop')}
              className={`group relative p-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                breakpoint === 'desktop'
                  ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm scale-100'
                  : 'text-hall-500 dark:text-hall-400 hover:text-hall-800 dark:hover:text-hall-200 hover:scale-105 active:scale-95'
              }`}
              aria-label="Desktop View"
            >
              <Monitor className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Desktop View
              </div>
            </button>
            <button
              onClick={() => setBreakpoint('tablet')}
              className={`group relative p-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                breakpoint === 'tablet'
                  ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm scale-100'
                  : 'text-hall-500 dark:text-hall-400 hover:text-hall-800 dark:hover:text-hall-200 hover:scale-105 active:scale-95'
              }`}
              aria-label="Tablet View"
            >
              <Tablet className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Tablet View
              </div>
            </button>
            <button
              onClick={() => setBreakpoint('mobile')}
              className={`group relative p-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                breakpoint === 'mobile'
                  ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm scale-100'
                  : 'text-hall-500 dark:text-hall-400 hover:text-hall-800 dark:hover:text-hall-200 hover:scale-105 active:scale-95'
              }`}
              aria-label="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Mobile View
              </div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-2">
           
           <button
             onClick={() => setIsPagesOpen(!isPagesOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isPagesOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Pages Manager"
           >
             <FileCode className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Pages Manager
             </div>
           </button>

           <button
             onClick={() => setIsLibraryOpen(!isLibraryOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isLibraryOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Component Library"
           >
             <Library className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Component Library
             </div>
           </button>

           <button
             onClick={() => setIsVariablesOpen(!isVariablesOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isVariablesOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Variables"
           >
             <Database className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Variables
             </div>
           </button>

           <button
             onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isCollectionsOpen ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Collections"
           >
             <List className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Data Collections
             </div>
           </button>

           >
             <Database className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Global Variables
             </div>
           </button>

           <button
             onClick={() => setIsThemeOpen(!isThemeOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isThemeOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Theme"
           >
             <Palette className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Global Theme
             </div>
           </button>
           
           <button
             onClick={() => setIsTreeOpen(!isTreeOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isTreeOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="DOM Tree"
           >
             <AlignLeft className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               DOM Tree View
             </div>
           </button>
           
           <button
             onClick={() => setIsInspectorOpen(!isInspectorOpen)}
             className={`group relative p-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isInspectorOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Inspector"
           >
             <Settings2 className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Property Inspector
             </div>
           </button>
           
           <div className="h-4 w-px bg-hall-300 dark:bg-hall-700 mx-1"></div>

           <button
             onClick={() => setIsSettingsOpen(true)}
             className="group relative p-2 text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink rounded-full hover:bg-hall-200 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500"
             aria-label="Project Settings"
           >
             <Settings className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Project Settings
             </div>
           </button>

           <div className="h-4 w-px bg-hall-300 dark:bg-hall-700 mx-1"></div>

           <button
             onClick={handleOpenNewWindow}
             className="group relative p-2 text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink rounded-full hover:bg-hall-200 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500"
             aria-label="Open in New Window"
           >
             <ExternalLink className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Open Preview Window
             </div>
           </button>

           <button
             onClick={() => setIsFullScreen(!isFullScreen)}
             className="group relative p-2 text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink rounded-full hover:bg-hall-200 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500"
             aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
           >
             {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               {isFullScreen ? "Exit Full Screen" : "Toggle Full Screen"}
             </div>
           </button>
           
           <div className="h-4 w-px bg-hall-300 dark:bg-hall-700 mx-1"></div>

           <button
             onClick={() => createZipDownload(localFiles, 'gemini-project', theme, seo)}
             className="flex items-center gap-2 px-3 py-1.5 text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800 rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
             title="Export ZIP"
           >
             <Download className="w-4 h-4" />
             <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden rounded-b-[32px]">
        
        
        {/* Pages Manager Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300 ${isPagesOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <PagesManager 
            files={localFiles}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onAddPage={(name) => {
              const newFile = { name: name.endsWith('.html') ? name : `${name}.html`, content: '<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n  <div class="min-h-screen bg-white text-black p-8">New Page</div>\n</body>\n</html>', type: 'html' as const };
              const newFiles = [...localFiles, newFile];
              setLocalFiles(newFiles);
              if (onFileChange) onFileChange(newFiles, `Added page ${name}`);
            }}
            onDeletePage={(name) => {
              if (name === 'index.html') return; // Cannot delete index
              const newFiles = localFiles.filter(f => f.name !== name);
              setLocalFiles(newFiles);
              if (currentPage === name) setCurrentPage('index.html');
              if (onFileChange) onFileChange(newFiles, `Deleted page ${name}`);
            }}
          />
        </div>

        {/* Component Library Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300 ${isLibraryOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <ComponentLibrary 
            onInsertComponent={handleInsertComponent}
            savedComponents={components}
            onClose={() => setIsLibraryOpen(false)}
          />
        </div>

        {/* DOM Tree Explorer */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isTreeOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <DOMTreeExplorer 
            tree={domTree} 
            selectedNodeId={selectedElement?.id || null} 
            onSelectNode={handleSelectNode}
            onClose={() => setIsTreeOpen(false)} 
          />
        </div>

        {/* Variables Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isVariablesOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <VariablesPanel 
            variables={variables}
            onUpdateVariables={(newVars) => {
              if (onUpdateVariables) {
                onUpdateVariables(newVars);
              }
            }}
            onClose={() => setIsVariablesOpen(false)} 
          />
        </div>

        
        {/* Collections Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isCollectionsOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <CollectionsPanel 
            collections={collections}
            onUpdateCollections={(newColls) => {
              if (onUpdateCollections) {
                onUpdateCollections(newColls);
              }
            }}
            onClose={() => setIsCollectionsOpen(false)} 
          />
        </div>

        {/* Theme Editor Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isThemeOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <ThemeEditor 
            theme={theme}
            onUpdateTheme={(newTheme) => {
              if (onUpdateTheme) {
                onUpdateTheme(newTheme);
              }
            }}
            onClose={() => setIsThemeOpen(false)} 
          />
        </div>

        {/* Project Settings Modal */}
        {isSettingsOpen && (
          <ProjectSettingsModal 
            seo={seo}
            onUpdateSEO={(newSEO) => {
              if (onUpdateSEO) {
                onUpdateSEO(newSEO);
              }
            }}
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}

        {/* Property Inspector */}
        <div className={`absolute top-0 bottom-0 right-0 z-30 transition-transform duration-300 ${isInspectorOpen && activeTab === 'preview' ? 'translate-x-0' : 'translate-x-full'}`}>
          <PropertyInspector 
            selectedElement={selectedElement} 
            variables={variables}
            pages={localFiles.filter(f => f.name.endsWith('.html') || f.name === 'index.html').map(f => f.name)}
            onBindVariable={handleBindVariable}
            onUpdateStyle={handleUpdateStyle}
            onToggleClass={handleToggleClass}
            onUpdateText={handleUpdateText}
            onUpdateAttribute={handleUpdateAttribute}
            onDelete={handleDeleteElement}
            onDuplicate={handleDuplicateElement}
            onAutoFix={handleAutoFix}
            onClose={() => setIsInspectorOpen(false)} 
            onOpenImageTool={() => {
               if (onOpenImageTool) {
                   onOpenImageTool(handleUpdateSrc);
               }
            }}
            onSaveComponent={(html) => {
              if (onUpdateComponents) {
                const name = prompt("Enter a name for this component:");
                if (name) {
                  onUpdateComponents({ ...components, [name]: html });
                }
              }
            }}
          />
        </div>

        {/* Preview View */}
        <div className={`absolute inset-0 transition-opacity duration-300 flex justify-center bg-hall-100/50 dark:bg-hall-950/50 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div 
            className={`relative h-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              breakpoint === 'mobile' ? 'w-[375px] border-x border-hall-200 dark:border-hall-800 shadow-2xl' :
              breakpoint === 'tablet' ? 'w-[768px] border-x border-hall-200 dark:border-hall-800 shadow-2xl' :
              'w-full'
            }`}
          >
            <iframe
              title="Preview"
              srcDoc={previewSrc}
              className="w-full h-full bg-white dark:bg-hall-950"
              sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
              onLoad={(e) => {
                setIframeLoading(false);
                const iframe = e.target as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_VARIABLES',
                    variables
                  }, '*');
                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_THEME',
                    theme
                  }, '*');
                  iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_SEO',
        seo
      }, '*');
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_COLLECTIONS',
        collections
      }, '*');
                }
              }}
            />
            
            {/* Subtle Loading Indicator */}
            <div 
              className={`absolute inset-0 flex items-center justify-center bg-hall-50/20 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none ${
                iframeLoading ? 'opacity-100' : 'opacity-0'
              }`}
            >
               <div className="bg-hall-950 bg-hall-800 rounded-full p-2.5 shadow-xl border border-hall-200 border-hall-700 animate-in fade-in zoom-in-90 duration-200">
                  <Loader2 className="w-5 h-5 animate-spin text-hall-900 text-hall-100" />
               </div>
            </div>
          </div>
        </div>

        {/* Code View */}
        <div className={`absolute inset-0 flex flex-col md:flex-row transition-opacity duration-300 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {/* Sidebar */}
          <div className="w-full md:w-64 h-auto md:h-full bg-hall-50/50 dark:bg-hall-900/50 backdrop-blur-md border-b md:border-b-0 md:border-r border-hall-200 dark:border-hall-800 overflow-y-auto flex-shrink-0">
             <div className="p-4 text-xs font-bold text-hall-500 dark:text-hall-500 uppercase tracking-widest hidden md:block">Files</div>
             <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 space-y-0 md:space-y-1 p-2 md:px-3 scrollbar-hide">
                {localFiles.map(file => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFile(file.name)}
                    className={`flex-shrink-0 flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap md:w-full focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      activeFile === file.name 
                        ? 'bg-white dark:bg-hall-800 text-hall-900 dark:text-ink font-bold shadow-sm scale-100' 
                        : 'text-hall-600 dark:text-hall-400 hover:bg-hall-100 dark:hover:bg-hall-800/50 hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {getFileIcon(file.name)}
                    <span className="truncate">{file.name}</span>
                  </button>
                ))}
             </div>
          </div>
          
          {/* Editor */}
          <div className="flex-1 bg-transparent overflow-hidden relative">
            <CodeEditor 
              value={currentFileContent}
              language={currentFile?.type || 'html'}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;