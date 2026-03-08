import React, { useState, useEffect, useRef } from 'react';
import { GeneratedFile } from '../types';
import { flattenFilesForPreview, createZipDownload } from '../utils/fileUtils';
import { Code, Play, Download, FileJson, FileCode, Monitor, Tablet, Smartphone, Maximize2, Minimize2, ExternalLink, Loader2, Rocket, Image as ImageIcon, QrCode } from 'lucide-react';
import CodeEditor from './CodeEditor';

import { QRCodeSVG } from "qrcode.react";
import { PropertyInspector } from './PropertyInspector';
import { MediaManager } from "./MediaManager";
import { DOMTreeExplorer } from './DOMTreeExplorer';
import { ComponentLibrary } from './ComponentLibrary';
import { VariablesPanel } from './VariablesPanel';
import { AuditPanel } from './AuditPanel';
import { ThemeEditor } from './ThemeEditor';
import { PagesManager } from './PagesManager';
import { CollectionsPanel } from './CollectionsPanel';
import { ApiIntegrationsPanel } from './ApiIntegrationsPanel';
import { DeployPanel } from './DeployPanel';
import { ContextMenu, ContextMenuAction } from './ContextMenu';
import { Moon, Settings2, AlignLeft, Library, Database, Palette, List, Network, Undo2, Redo2, Copy, Trash2, Box, ClipboardPaste, Palette as PaletteIcon, Component, ShieldCheck } from 'lucide-react';
import { useWorkspaceContext, WorkspaceProvider } from "../context/WorkspaceContext";


interface WorkspaceProps {
  projectId?: string;
  files: GeneratedFile[];
  versions?: any[];
  currentVersionIndex?: number;
  onJumpToVersion?: (index: number) => void;
  variables?: Record<string, string>;
  components?: Record<string, string>;
  theme?: Record<string, string>;
  customFonts?: string[];
  seo?: Record<string, string>;
  collections?: Record<string, any>;
  apis?: Record<string, any>;
  payments?: Record<string, string>;
  assets?: Record<string, string>;
  onUpdateVariables?: (variables: Record<string, string>) => void;
  onUpdateComponents?: (components: Record<string, string>) => void;
  onUpdateTheme?: (theme: Record<string, string>) => void;
  onUpdateFonts?: (fonts: string[]) => void;
  onUpdateSEO?: (seo: Record<string, string>) => void;
  onUpdateCollections?: (collections: Record<string, any>) => void;
  onUpdateApis?: (apis: Record<string, any>) => void;
  onUpdateAssets?: (assets: Record<string, string>) => void;
  onFileChange?: (files: GeneratedFile[], commitDescription?: string) => void;
  onOpenImageTool?: (onPick: (url: string) => void) => void;
}

const WorkspaceInner: React.FC<WorkspaceProps> = ({ 
  projectId,
  versions,
  currentVersionIndex,
  onJumpToVersion,
  files, 
  variables = {}, 
  components = {},
  theme = {},
  customFonts = [],
  seo = {},
  collections = {},
  apis = {},
  payments = {},
  assets = {},
  onUpdateVariables, 
  onUpdateComponents,
  onUpdateTheme,
  onUpdateFonts,
  onUpdateCollections,
  onUpdateApis,
  onUpdateAssets,
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
  const [isApisOpen, setIsApisOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [mediaPickCallback, setMediaPickCallback] = useState<((url: string) => void) | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, element: any} | null>(null);
  const { history, pushState, undo, redo, canUndo, canRedo } = useWorkspaceContext();
  
  // History Stack for Undo/Redo

  // Local state for files allows editing within the workspace session
  const [localFiles, setLocalFiles] = useState<GeneratedFile[]>(files);

  // Sync localFiles when history changes via undo/redo
  useEffect(() => {
    if (history.present.files && history.present.files.length > 0) {
      setLocalFiles(history.present.files);
    }
  }, [history.present.files]);

  // Sync local files when the project/generation changes from parent
  useEffect(() => {
    setLocalFiles(files);
    if (!files.find(f => f.name === activeFile)) {
      setActiveFile(files[0]?.name || '');
    }
  }, [files]);

  const [isPreviewDarkMode, setIsPreviewDarkMode] = useState(false);
  const skipIframeReload = useRef(false);

  // Update preview whenever local files change (including edits)
  useEffect(() => {
    if (localFiles.length > 0) {
      if (skipIframeReload.current) {
        skipIframeReload.current = false;
        return;
      }
      const flattened = flattenFilesForPreview(localFiles, currentPage, seo, theme, customFonts);
      setIframeLoading(true);
      setPreviewSrc(flattened);
    }
  }, [localFiles, currentPage, seo, theme, customFonts]);

  // Sync variables & collections to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      // Merge collections data into variables so data-bind-list can read it
      const mergedVariables = { ...variables };
      if (collections) {
        Object.values(collections).forEach((c: any) => {
          mergedVariables[c.id] = JSON.stringify(c.data || []);
        });
      }
      
      // Also inject API state into variables for binding
      if (apis) {
        Object.values(apis).forEach((api: any) => {
          if (api.lastResponse) {
             mergedVariables[`api.${api.id}.response`] = JSON.stringify(api.lastResponse);
          }
        });
      }

      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_VARIABLES',
        variables: mergedVariables
      }, '*');
    }
  }, [variables, collections, apis]);

  // Sync theme to iframe
  useEffect(() => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_UPDATE_THEME',
        theme,
        customFonts
      }, '*');
    }
  }, [theme, customFonts]);

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

  
  const handleUndo = () => {
    if (!canUndo) return;
    undo();
  };

  const handleRedo = () => {
    if (!canRedo) return;
    redo();
  };

  const handleFileChange = (newContent: string, fileName?: string, commitDescription?: string) => {
    const targetFile = fileName || activeFile;
    const newFiles = localFiles.map(f => 
      f.name === targetFile ? { ...f, content: newContent } : f
    );
    setLocalFiles(newFiles);
    pushState({ files: newFiles });
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
  const [isAuditOpen, setIsAuditOpen] = useState(false);

useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'FORGE_ELEMENT_SELECTED') {
        setSelectedElement(e.data.element);
        if (!isInspectorOpen) setIsInspectorOpen(true);
      } else if (e.data.type === 'FORGE_DOM_TREE') {
        setDomTree(e.data.tree);
      } else if (e.data.type === 'FORGE_KEYDOWN') {
        // Handle forwarded keyboard shortcuts from iframe
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdOrCtrl = isMac ? e.data.metaKey : e.data.ctrlKey;
        
        if (cmdOrCtrl && e.data.key.toLowerCase() === 'z') {
          if (e.data.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (cmdOrCtrl && e.data.key.toLowerCase() === 'y') {
          handleRedo();
        } else if (cmdOrCtrl && e.data.key.toLowerCase() === 'c') {
          if (selectedElement) handleCopyHtml();
        } else if (cmdOrCtrl && e.data.key.toLowerCase() === 'v') {
          if (selectedElement) handlePasteHtml();
        } else if (e.data.key === 'Delete' || e.data.key === 'Backspace') {
          if (selectedElement) handleDeleteElement();
        }
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
         const newFiles = [...localFiles];
         const fileIndex = newFiles.findIndex(f => f.name === activeFile);
         if (fileIndex !== -1) {
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
             
             handleFileChange('<!DOCTYPE html>\n' + doc.documentElement.outerHTML, activeFile, 'Drag and Drop Component');
         }
      } else if (e.data.type === 'FORGE_CONTEXT_MENU') {
         setSelectedElement(e.data.element);
         setContextMenu({
           x: e.data.x,
           y: e.data.y,
           element: e.data.element
         });
      } else if (e.data.type === 'FORGE_NAVIGATE') {
         const dest = e.data.target;
         // Handle absolute paths like /about.html or relative like ./about.html
         const cleanDest = dest.replace(/^(\.\/|\/)/, '');
         if (cleanDest && cleanDest.endsWith('.html')) {
            setCurrentPage(cleanDest);
            setActiveFile(cleanDest);
         } else if (cleanDest) {
            setCurrentPage(`${cleanDest}.html`);
            setActiveFile(`${cleanDest}.html`);
         }
         return;
      } else if (e.data.type === 'FORGE_EXECUTE_ACTION') {
         const { action, key, value, target } = e.data;
         if (action === 'navigate') {
            const dest = target.endsWith('.html') ? target : `${target}.html`;
            setCurrentPage(dest);
            setActiveFile(dest);
            return;
         }
         if (onUpdateVariables) {
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
  
  return (
) => window.removeEventListener('message', handleMessage);
  }, [isInspectorOpen, localFiles, variables, onUpdateVariables]); // added localFiles to dependencies

  
  const findNodePath = (node: any, id: string): number[] | null => {
    if (node.id === id) return node.path;
    if (node.children) {
      for (const child of node.children) {
        const p = findNodePath(child, id);
        if (p) return p;
      }
    }
    return null;
  };

  const handleMoveNode = (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    if (!domTree) return;
    const sourcePath = findNodePath(domTree, sourceId);
    const targetPath = findNodePath(domTree, targetId);
    
    if (!sourcePath || !targetPath) return;

    updateLocalHtml([], (body) => {
      let sourceEl: HTMLElement | null = body;
      for (const idx of sourcePath) {
        if (!sourceEl || !sourceEl.children[idx]) { sourceEl = null; break; }
        sourceEl = sourceEl.children[idx] as HTMLElement;
      }
      
      let targetEl: HTMLElement | null = body;
      for (const idx of targetPath) {
        if (!targetEl || !targetEl.children[idx]) { targetEl = null; break; }
        targetEl = targetEl.children[idx] as HTMLElement;
      }

      if (sourceEl && targetEl && sourceEl !== targetEl) {
        if (position === 'inside') {
          targetEl.appendChild(sourceEl);
        } else if (position === 'before') {
          targetEl.parentNode?.insertBefore(sourceEl, targetEl);
        } else if (position === 'after') {
          targetEl.parentNode?.insertBefore(sourceEl, targetEl.nextSibling);
        }
      }
    }, false, 'Move Element in DOM Tree');
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      el.remove();
    }, false, 'Delete Element');
    setSelectedElement(null);
  };

  const handleCopyHtml = () => {
    if (!selectedElement) return;
    navigator.clipboard.writeText(selectedElement.outerHTML || '').then(() => {
      setContextMenu(null);
    });
  };

  const handleWrapInContainer = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'w-full p-4';
      el.parentNode?.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    }, false, 'Wrap in Container');
    setContextMenu(null);
  };

  const handleCopyStyles = () => {
    if (!selectedElement) return;
    const stylesToCopy = JSON.stringify({ className: selectedElement.className || '', style: selectedElement.style || '' });
    navigator.clipboard.writeText(`forge-styles:${stylesToCopy}`).then(() => {
      setContextMenu(null);
    });
  };

  const handlePasteStyles = async () => {
    if (!selectedElement) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('forge-styles:')) {
        const styles = JSON.parse(text.replace('forge-styles:', ''));
        updateLocalHtml(selectedElement.path, (el) => {
          if (styles.className) {
            el.className = styles.className;
          }
          if (styles.style) {
            el.setAttribute('style', styles.style);
          }
        }, false, 'Paste Styles');
      }
    } catch (e) {
      console.error('Failed to read clipboard');
    }
    setContextMenu(null);
  };

  const handlePasteHtml = async () => {
    if (!selectedElement) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && !text.startsWith('forge-styles:')) {
        updateLocalHtml(selectedElement.path, (el) => {
          el.insertAdjacentHTML('afterend', text);
        }, false, 'Paste HTML');
      }
    } catch (e) {
      console.error('Failed to read clipboard');
    }
    setContextMenu(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (selectedElement) {
          e.preventDefault();
          handleCopyHtml();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        if (selectedElement) {
          e.preventDefault();
          handlePasteHtml();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          e.preventDefault();
          handleDeleteElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, localFiles, selectedElement]);

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
    setContextMenu(null);
  };

  const handleAddTableRow = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      let target: HTMLElement | null = el;
      if (['TD', 'TH', 'TR'].includes(el.tagName)) {
        target = (el.closest('tbody, thead, tfoot') || el.closest('table') || el) as HTMLElement;
      }
      if (!target) return;
      
      if (target.tagName === 'TABLE') {
        const tbody = target.querySelector('tbody');
        if (tbody) target = tbody;
      }

      const firstRow = target.querySelector('tr');
      const colCount = firstRow ? firstRow.children.length : 1;

      const newRow = document.createElement('tr');
      if (firstRow) newRow.className = firstRow.className;
      
      for (let i = 0; i < colCount; i++) {
        const cell = document.createElement(target.tagName === 'THEAD' ? 'th' : 'td');
        const refCell = firstRow?.children[i] as HTMLElement;
        if (refCell) cell.className = refCell.className;
        cell.textContent = `New Cell`;
        if (!refCell?.className) cell.style.padding = '1rem 1.5rem';
        newRow.appendChild(cell);
      }

      target.appendChild(newRow);
    }, false, 'Add Table Row');
  };

  const handleAddTableColumn = () => {
    if (!selectedElement) return;
    updateLocalHtml(selectedElement.path, (el) => {
      let table = el.closest('table') as HTMLTableElement | null;
      if (!table && el.tagName === 'TABLE') table = el as HTMLTableElement;
      if (!table) return;

      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const isHeader = row.closest('thead') !== null;
        const cell = document.createElement(isHeader ? 'th' : 'td');
        
        const lastCell = row.lastElementChild as HTMLElement;
        if (lastCell) cell.className = lastCell.className;
        
        cell.textContent = isHeader ? 'New Header' : 'New Data';
        if (!lastCell?.className) cell.style.padding = '1rem 1.5rem';
        
        row.appendChild(cell);
      });
    }, false, 'Add Table Column');
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
       
       if (state && ['hover', 'focus', 'active', 'focus-visible'].includes(state)) {
         let uniqueClass = Array.from(el.classList).find(c => c.startsWith(`forge-${state}-`));
         if (!uniqueClass) {
           uniqueClass = `forge-${state}-` + Math.random().toString(36).substring(2, 9);
           el.classList.add(uniqueClass);
         }
         
         const doc = el.ownerDocument;
         let styleBlock = doc.getElementById(`forge-${state}-styles`);
         if (!styleBlock) {
           styleBlock = doc.createElement('style');
           styleBlock.id = `forge-${state}-styles`;
           doc.head.appendChild(styleBlock);
         }
         
         styleBlock.textContent += `\n.${uniqueClass}:${state} { ${kebabProp}: ${value} !important; }`;
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

  const handleChangeTag = (newTag: string) => {
    if (!selectedElement) return;
    setSelectedElement((prev: any) => ({
      ...prev,
      tagName: newTag.toLowerCase()
    }));
    updateLocalHtml(selectedElement.path, (el) => {
      const newEl = el.ownerDocument.createElement(newTag);
      while (el.firstChild) {
        newEl.appendChild(el.firstChild);
      }
      Array.from(el.attributes).forEach(attr => {
        newEl.setAttribute(attr.name, attr.value);
      });
      el.replaceWith(newEl);
    }, false, `Change tag to ${newTag}`);
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
        
        if (attr === 'data-keyframes') {
          const doc = el.ownerDocument;
          let styleBlock = doc.getElementById(`forge-keyframes-${selectedElement.id}`);
          if (!styleBlock) {
            styleBlock = doc.createElement('style');
            styleBlock.id = `forge-keyframes-${selectedElement.id}`;
            doc.head.appendChild(styleBlock);
          }
          styleBlock.textContent = value;
        }
      } else {
        el.removeAttribute(attr);
        
        if (attr === 'data-keyframes') {
          const doc = el.ownerDocument;
          const styleBlock = doc.getElementById(`forge-keyframes-${selectedElement.id}`);
          if (styleBlock) styleBlock.remove();
        }
      }
    }, false, `Update ${attr} to ${value}`);

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FORGE_RELOAD' }, '*');
    }
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

  const handleHoverNode = (id: string | null) => {
    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'FORGE_HOVER_NODE',
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

  const handleInsertSkipLink = () => {
    updateLocalHtml([], (body) => {
      if (body.querySelector('.forge-skip-link')) return;

      const skipLink = body.ownerDocument.createElement('a');
      skipLink.className = 'forge-skip-link sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0';
      skipLink.href = '#main';
      skipLink.textContent = 'Skip to Main Content';
      skipLink.tabIndex = 0;
      
      body.insertBefore(skipLink, body.firstChild);
    }, false, 'Insert Skip Link');

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FORGE_RELOAD' }, '*');
    }
  };

  return (
    <div 
      className={`flex flex-col shadow-sm transition-all duration-500 ease-in-out h-full ${
        isFullScreen 
          ? 'absolute inset-0 z-[100]' 
          : 'w-full rounded-2xl md:rounded-[32px] border-x-0 md:border-x border-y border-hall-200 dark:border-hall-800'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-hall-200 dark:border-hall-800 bg-hall-50 dark:bg-hall-900/50 rounded-t-2xl md:rounded-t-[32px] shrink-0">
        <div className="flex items-center gap-1 p-1 bg-hall-200 dark:bg-hall-800 rounded-full shadow-inner">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
            className={`flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
              className={`group relative p-2 sm:p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
              className={`group relative p-2 sm:p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
              className={`group relative p-2 sm:p-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
            onClick={() => {
              setIsPreviewDarkMode(!isPreviewDarkMode);
              const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({ type: "FORGE_TOGGLE_DARK_MODE" }, "*");
              }
            }}
            className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isPreviewDarkMode ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800"}`}
            aria-label="Toggle Preview Dark Mode"
          >
            <Moon className="w-4 h-4" />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
              Preview Dark Mode
            </div>
          </button>

          {/* Undo/Redo Controls */}
          <div className="flex items-center mr-2 border-r border-hall-200 dark:border-hall-800 pr-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                !canUndo
                  ? 'text-hall-300 dark:text-hall-700 cursor-not-allowed'
                  : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800 active:scale-90 hover:scale-110'
              }`}
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Undo (Cmd/Ctrl+Z)
              </div>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                !canRedo
                  ? 'text-hall-300 dark:text-hall-700 cursor-not-allowed'
                  : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800 active:scale-90 hover:scale-110'
              }`}
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Redo (Cmd/Ctrl+Y)
              </div>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsQROpen(!isQROpen)}
              className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isQROpen ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" : "text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800"}`}
              aria-label="Mobile Preview QR"
            >
              <QrCode className="w-4 h-4" />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Mobile Preview
              </div>
            </button>
            {isQROpen && (
              <div className="absolute top-full mt-4 right-0 bg-white dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <h4 className="text-sm font-bold text-hall-900 dark:text-ink mb-2 text-center">Scan to Preview</h4>
                <div className="bg-white p-2 rounded-lg">
                  <QRCodeSVG 
                    value={`${window.location.origin}/preview/${projectId}`} 
                    size={160} 
                    bgColor={"#ffffff"} 
                    fgColor={"#000000"} 
                    level={"L"} 
                    includeMargin={false} 
                  />
                </div>
                <p className="text-xs text-hall-500 dark:text-hall-400 mt-3 text-center w-40">Scan with your phone to view the live project.</p>
              </div>
            )}
          </div>
           
           <button
             onClick={() => setIsPagesOpen(!isPagesOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isPagesOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Pages Manager"
           >
             <FileCode className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Pages Manager
             </div>
           </button>

           <button
             onClick={() => setIsLibraryOpen(!isLibraryOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isLibraryOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Component Library"
           >
             <Library className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Component Library
             </div>
           </button>

           <button
             onClick={() => setIsVariablesOpen(!isVariablesOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isVariablesOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Variables"
           >
             <Database className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Variables
             </div>
           </button>

           <button
             onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isCollectionsOpen ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Collections"
           >
             <List className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Data Collections
             </div>
           </button>
           <button
             onClick={() => setIsApisOpen(!isApisOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isApisOpen ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="APIs"
           >
             <Network className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               API Integrations
             </div>
           </button>

           <button
             onClick={() => setIsThemeOpen(!isThemeOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isThemeOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Theme"
           >
             <Palette className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Global Theme
             </div>
           </button>

           <button
             onClick={() => setIsAuditOpen(!isAuditOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isAuditOpen ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="A11y & SEO Audit"
           >
             <ShieldCheck className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               A11y & SEO Audit
             </div>
           </button>

           <button
             onClick={() => setIsDeployOpen(!isDeployOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDeployOpen ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Deploy"
           >
             <Rocket className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Deploy Project
             </div>
           </button>
          <button
            onClick={() => setIsMediaManagerOpen(!isMediaManagerOpen)}
            className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMediaManagerOpen ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" : "text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800"}`}
            aria-label="Media Manager"
          >
            <ImageIcon className="w-4 h-4" />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
              Media Manager
            </div>
          </button>
           

           <button
            onClick={() => {
              setIsPreviewDarkMode(!isPreviewDarkMode);
              const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({ type: "FORGE_TOGGLE_DARK_MODE" }, "*");
              }
            }}
            className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isPreviewDarkMode ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : "text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800"}`}
            aria-label="Toggle Preview Dark Mode"
          >
            <Moon className="w-4 h-4" />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
              Preview Dark Mode
            </div>
          </button>

           <button
             onClick={handleUndo}
             disabled={!canUndo}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!canUndo ? 'opacity-50 cursor-not-allowed text-hall-400 dark:text-hall-600' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Undo"
           >
             <Undo2 className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Undo (Ctrl+Z)
             </div>
           </button>
           
           <button
             onClick={handleRedo}
             disabled={!canRedo}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!canRedo ? 'opacity-50 cursor-not-allowed text-hall-400 dark:text-hall-600' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Redo"
           >
             <Redo2 className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Redo (Ctrl+Shift+Z)
             </div>
           </button>

           <div className="w-px h-6 bg-hall-200 dark:bg-hall-800 mx-1"></div>

           <button
             onClick={() => setIsHistoryOpen(!isHistoryOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isHistoryOpen ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="History"
           >
             <List className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Version History
             </div>
           </button>
           <button
             onClick={() => setIsTreeOpen(!isTreeOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isTreeOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="DOM Tree"
           >
             <AlignLeft className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               DOM Tree View
             </div>
           </button>
           
           <button
             onClick={() => setIsInspectorOpen(!isInspectorOpen)}
             className={`group relative p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isInspectorOpen ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-ink hover:bg-hall-200 dark:hover:bg-hall-800'}`}
             aria-label="Inspector"
           >
             <Settings2 className="w-4 h-4" />
             <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
               Property Inspector
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
      <div className="flex-1 min-h-0 relative overflow-hidden rounded-b-[32px]">
        
        
        {/* Pages Manager Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300 ${isPagesOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <PagesManager 
            files={localFiles}
            currentPage={currentPage}
            onPageChange={(page) => {
              setCurrentPage(page);
              setActiveFile(page);
            }}
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
              if (currentPage === name) {
                setCurrentPage('index.html');
                setActiveFile('index.html');
              }
              if (onFileChange) onFileChange(newFiles, `Deleted page ${name}`);
            }}
            onRenamePage={(oldName, newName) => {
              if (oldName === 'index.html') return; // Cannot rename index
              const newFiles = localFiles.map(f => f.name === oldName ? { ...f, name: newName } : f);
              setLocalFiles(newFiles);
              if (currentPage === oldName) {
                setCurrentPage(newName);
                setActiveFile(newName);
              }
              if (onFileChange) onFileChange(newFiles, `Renamed page ${oldName} to ${newName}`);
            }}
          />
        </div>

        {/* Component Library Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300 ${isLibraryOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <ComponentLibrary 
            onInsertComponent={handleInsertComponent}
            savedComponents={components}
            onClose={() => setIsLibraryOpen(false)}
            onDeleteComponent={(name) => {
              if (onUpdateComponents) {
                const newComponents = { ...components };
                delete newComponents[name];
                onUpdateComponents(newComponents);
              }
            }}
          />
        </div>

        {/* DOM Tree Explorer */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isTreeOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <DOMTreeExplorer 
            tree={domTree} 
            selectedNodeId={selectedElement?.id || null} 
            onSelectNode={handleSelectNode}
            onHoverNode={handleHoverNode}
            onMoveNode={handleMoveNode}
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

        
        
        {/* History Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isHistoryOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 shrink-0">
              <h3 className="text-sm font-bold text-hall-900 dark:text-ink flex items-center gap-2">
                <Undo2 className="w-4 h-4" />
                History
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {versions && versions.map((v, idx) => (
                <div 
                  key={v.id || idx}
                  onClick={() => onJumpToVersion && onJumpToVersion(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${idx === currentVersionIndex ? 'bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-400' : 'bg-white dark:bg-hall-900 border-hall-200 dark:border-hall-800 text-hall-700 dark:text-hall-300 hover:border-amber-500/30 hover:shadow-md'}`}
                >
                  <div className="text-xs font-bold mb-1">{idx === 0 ? 'Initial Generation' : `Mutation ${idx}`}</div>
                  <div className="text-[10px] opacity-70 truncate" title={v.prompt || 'Manual Edit'}>{v.prompt || 'Manual Edit'}</div>
                  <div className="text-[9px] opacity-50 mt-1">{new Date(v.timestamp).toLocaleTimeString()}</div>
                </div>
              )).reverse()}
            </div>
          </div>
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

        
        {/* APIs Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isApisOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <ApiIntegrationsPanel 
            apis={apis}
            projectId={projectId}
            onUpdate={(newApis) => {
              if (onUpdateApis) {
                onUpdateApis(newApis);
              }
            }}
            onClose={() => setIsApisOpen(false)} 
          />
        </div>
        {/* Theme Editor Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isThemeOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <ThemeEditor 
            theme={theme}
            customFonts={customFonts}
            onUpdateTheme={(newTheme) => {
              if (onUpdateTheme) {
                onUpdateTheme(newTheme);
              }
            }}
            onUpdateFonts={(fonts) => {
              if (onUpdateFonts) {
                onUpdateFonts(fonts);
              }
            }}
            onClose={() => setIsThemeOpen(false)} 
          />
        </div>

        {/* Audit Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isAuditOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <AuditPanel 
            currentHtml={localFiles[activeFile]?.content || ''}
            onApplyFix={(fixedHtml) => {
              handleCodeChange(fixedHtml);
            }}
            onClose={() => setIsAuditOpen(false)}
          />
        </div>

        {/* Deploy Panel */}
        <div className={`absolute top-0 bottom-0 left-0 z-30 transition-transform duration-300 ${isDeployOpen && activeTab === 'preview' ? 'translate-x-0' : '-translate-x-full'}`}>
          <DeployPanel 
            projectId={projectId}
            onClose={() => setIsDeployOpen(false)} 
          />
        </div>

        {/* Project Settings Modal */}
        <MediaManager
          isOpen={isMediaManagerOpen}
          onClose={() => {
            setIsMediaManagerOpen(false);
            setMediaPickCallback(null);
          }}
          assets={Object.entries(assets).map(([id, url]) => ({ id, url, name: id, type: "image", size: 0 }))}
          onUpload={async (files) => {
            // Use local URL temporarily for immediate UI feedback
            const newAssets = { ...assets };
            const filesArray = Array.from(files);
            
            // Temporary local URLs
            filesArray.forEach(file => {
              newAssets[file.name] = URL.createObjectURL(file);
            });
            if (onUpdateAssets) onUpdateAssets(newAssets);

            try {
              const formData = new FormData();
              filesArray.forEach(file => {
                formData.append(file.name, file);
              });

              const currentProjectId = projectId || 'local';
              const response = await fetch(`https://sgfbackend.deejay.onl/api/assets/upload/${currentProjectId}`, {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Upload failed');
              }

              const data = await response.json();
              if (data.success && data.urls) {
                // Update with permanent URLs from the server
                const finalAssets = { ...assets };
                data.urls.forEach((url: string, index: number) => {
                  const originalName = filesArray[index].name;
                  // Prepend BFF URL to the returned path
                  const fullUrl = `https://sgfbackend.deejay.onl${url}`;
                  finalAssets[originalName] = fullUrl;
                });
                if (onUpdateAssets) onUpdateAssets(finalAssets);
              }
            } catch (err) {
              console.error('Failed to upload assets to server:', err);
              // Revert on error or show notification
            }
          }}
          onDelete={(id) => {
            const newAssets = { ...assets };
            delete newAssets[id];
            if (onUpdateAssets) onUpdateAssets(newAssets);
          }}
          onSelect={(asset) => {
            if (mediaPickCallback) {
              mediaPickCallback(asset.url);
              setIsMediaManagerOpen(false);
              setMediaPickCallback(null);
            } else {
              navigator.clipboard.writeText(asset.url);
              alert("Asset URL copied to clipboard!");
            }
          }}
        />

        {/* Property Inspector */}
        <div className={`fixed md:absolute bottom-0 md:top-0 md:bottom-0 left-0 right-0 md:left-auto z-[100] md:z-30 h-[70vh] md:h-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isInspectorOpen && activeTab === 'preview' ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}>
          <PropertyInspector 
            activeBreakpoint={breakpoint}
            selectedElement={selectedElement} 
            variables={variables}
            collections={collections}
            apis={apis}
            payments={payments}
            customFonts={customFonts}
            pages={localFiles.filter(f => f.name.endsWith('.html') || f.name === 'index.html').map(f => f.name)}
            onBindVariable={handleBindVariable}
            onUpdateStyle={handleUpdateStyle}
            onToggleClass={handleToggleClass}
            onUpdateText={handleUpdateText}
            onUpdateAttribute={handleUpdateAttribute}
            onChangeTag={handleChangeTag}
            onDelete={handleDeleteElement}
            onDuplicate={handleDuplicateElement}
            onAddTableRow={handleAddTableRow}
            onAddTableColumn={handleAddTableColumn}
            onAutoFix={handleAutoFix}
            onInsertSkipLink={handleInsertSkipLink}
            onClose={() => setIsInspectorOpen(false)} 
            onOpenMediaManager={() => {
              setMediaPickCallback(() => handleUpdateSrc);
              setIsMediaManagerOpen(true);
            }}
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
                  const mergedVariables = { ...variables };
                  if (collections) {
                    Object.values(collections).forEach((c: any) => {
                      mergedVariables[c.id] = JSON.stringify(c.data || []);
                    });
                  }
                  
                  if (apis) {
                    Object.values(apis).forEach((api: any) => {
                      if (api.lastResponse) {
                         mergedVariables[`api.${api.id}.response`] = JSON.stringify(api.lastResponse);
                      }
                    });
                  }

                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_VARIABLES',
                    variables: mergedVariables
                  }, '*');
                  iframe.contentWindow.postMessage({
                    type: 'FORGE_UPDATE_THEME',
                    theme,
                    customFonts
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
    
        {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: handleDuplicateElement, shortcut: '⌘D' },
            { label: 'Delete', icon: <Trash2 className="w-4 h-4 text-red-500" />, onClick: handleDeleteElement, shortcut: '⌫', divider: true },
            { label: 'Wrap in Container', icon: <Box className="w-4 h-4" />, onClick: handleWrapInContainer },
            { label: 'Copy HTML', icon: <Copy className="w-4 h-4" />, onClick: handleCopyHtml, shortcut: '⌘C' },
            { label: 'Paste HTML', icon: <ClipboardPaste className="w-4 h-4" />, onClick: handlePasteHtml, shortcut: '⌘V', divider: true },
            { label: 'Copy Styles', icon: <PaletteIcon className="w-4 h-4" />, onClick: handleCopyStyles },
            { label: 'Paste Styles', icon: <PaletteIcon className="w-4 h-4" />, onClick: handlePasteStyles },
            ...(onUpdateComponents ? [
              { label: 'Save as Component', icon: <Component className="w-4 h-4" />, onClick: handleSaveAsComponent, divider: true }
            ] : [])
          ]}
        />
      )}
</div>
  );
};

const Workspace = (props: WorkspaceProps) => {
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

export default Workspace;