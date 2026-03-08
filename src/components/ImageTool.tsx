
import React, { useState, useEffect } from 'react';
import { Download, Plus, CircleAlert, X, Sparkles, FolderInput, ArrowRight, Bot, WandSparkles, Image as ImageIcon, RefreshCw, ChevronLeft, Check, SquareCheck, Square, LoaderCircle } from 'lucide-react';
import { generateImage, planImageReplacements } from '../services/geminiService';
import { ImageSize, GeneratedFile, DetectedAsset, BatchImageGeneration } from '../types';
import { findAssets } from '../utils/fileUtils';

interface ImageToolProps {
  isOpen: boolean;
  onClose: () => void;
  files?: GeneratedFile[];
  onInjectAsset?: (base64: string, filename: string, prompt: string) => void;
  onReplaceAsset?: (replacements: BatchImageGeneration[]) => void;
  onPickAsset?: (url: string) => void;
}

const ImageTool: React.FC<ImageToolProps> = ({ isOpen, onClose, files = [], onInjectAsset, onReplaceAsset, onPickAsset }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Selection State
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [detectedAssets, setDetectedAssets] = useState<DetectedAsset[]>([]);
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Size1K);
  const [status, setStatus] = useState<'idle' | 'planning' | 'generating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<string>('');
  
  // Results
  const [generatedResults, setGeneratedResults] = useState<BatchImageGeneration[]>([]);
  
  // Single file manual name (only used for single generation)
  const [fileName, setFileName] = useState('');

  // Scan files when opened
  useEffect(() => {
    if (isOpen) {
      const assets = findAssets(files);
      setDetectedAssets(assets);
      setSelectedAssetIds(new Set()); // Reset selection
      setGeneratedResults([]);
      
      // If no assets found, go straight to creation
      if (assets.length === 0) {
          setView('create');
      } else {
          setView('list');
      }
      
      setStatus('idle');
      setPrompt('');
      setProgress('');
    }
  }, [isOpen, files]);

  const toggleSelection = (id: string) => {
    if (onPickAsset) {
        setSelectedAssetIds(new Set([id]));
        return;
    }
    const newSet = new Set(selectedAssetIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedAssetIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.size === detectedAssets.length) {
        setSelectedAssetIds(new Set());
    } else {
        setSelectedAssetIds(new Set(detectedAssets.map(a => a.id)));
    }
  };

  const handleCreateNew = () => {
      setSelectedAssetIds(new Set());
      setView('create');
      setPrompt('');
      setGeneratedResults([]);
      setStatus('idle');
  };

  const handleProceedWithSelection = () => {
      if (selectedAssetIds.size === 0) return;
      
      setView('create');
      setGeneratedResults([]);
      setStatus('idle');
      
      // Smart prompt preset
      if (selectedAssetIds.size === 1) {
          const id = Array.from(selectedAssetIds)[0];
          const asset = detectedAssets.find(a => a.id === id);
          if (asset) {
              setPrompt(`A better version of ${asset.url.split('/').pop()}`);
          }
      } else {
          setPrompt(`Replace these ${selectedAssetIds.size} images with... (e.g. 'Modern bakery theme')`);
      }
  };

  const handleBack = () => {
      setView('list');
      setStatus('idle');
      setGeneratedResults([]);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    
    try {
      if (selectedAssetIds.size <= 1) {
          // --- Single Mode (Existing Logic) ---
          setStatus('generating');
          const promptText = prompt;
          const base64Image = await generateImage(promptText, size);
          
          // Suggest a filename
          const sanitized = prompt.slice(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          const ext = 'png'; 
          const finalName = `assets/${sanitized}.${ext}`;
          setFileName(finalName); // Allow user to edit this for single mode
          
          // If replacement, target the selected asset url
          let targetUrl = '';
          if (selectedAssetIds.size === 1) {
             const id = Array.from(selectedAssetIds)[0];
             const asset = detectedAssets.find(a => a.id === id);
             if (asset) targetUrl = asset.url;
          }

          setGeneratedResults([{
              targetUrl, // Empty if insertion
              newAsset: {
                  name: finalName,
                  content: base64Image,
                  type: 'image'
              }
          }]);
          setStatus('success');

      } else {
          // --- Batch Mode (Sequential) ---
          setStatus('planning');
          setProgress('Analyzing context & planning prompts...');

          // 1. Identify selected assets
          const targets = detectedAssets.filter(a => selectedAssetIds.has(a.id));

          // 2. Call Plan Service
          const plan = await planImageReplacements(targets, prompt);

          setStatus('generating');
          const validResults: BatchImageGeneration[] = [];
          
          // 3. Execute SEQUENTIALLY to avoid Rate Limits (QuotaExceeded)
          // We do not use Promise.all here intentionally.
          
          for (let i = 0; i < plan.length; i++) {
              const item = plan[i];
              setProgress(`Generating image ${i + 1} of ${plan.length}...`);
              
              const targetAsset = targets.find(t => t.id === item.assetId);
              if (!targetAsset) continue;

              try {
                  const base64 = await generateImage(item.prompt, size);
                  validResults.push({
                      targetUrl: targetAsset.url,
                      newAsset: {
                          name: `assets/${item.suggestedName}`,
                          content: base64,
                          type: 'image'
                      }
                  });
              } catch (e: any) {
                  console.error(`Failed to generate ${item.suggestedName}`, e);
                  // If quota exceeded, stop immediately and return what we have
                  if (e.message?.includes('Quota') || e.message?.includes('429')) {
                      // We don't throw here, we just break and show partial results
                      break; 
                  }
                  // Otherwise try to continue with next item
              }
          }

          if (validResults.length === 0) {
              throw new Error("All image generations failed. Please try again or check your API quota.");
          }

          setGeneratedResults(validResults);
          setStatus('success');
      }

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleConfirm = () => {
      if (generatedResults.length === 0) return;
      
      if (selectedAssetIds.size > 0 && onReplaceAsset) {
          // Batch Replace
          // If in single mode, use the filename text input in case user changed it
          if (selectedAssetIds.size === 1 && fileName) {
             generatedResults[0].newAsset.name = fileName;
          }
          onReplaceAsset(generatedResults);
      } else if (onInjectAsset) {
          // Single Insert
          // Use filename text input
          const res = generatedResults[0];
          const finalName = fileName || res.newAsset.name;
          onInjectAsset(res.newAsset.content, finalName, prompt);
      }
      
      onClose();
  };

  // Helper to resolve preview URL for detected assets
  const getAssetPreview = (asset: DetectedAsset) => {
      if (asset.url.startsWith('http')) return asset.url;
      const cleanUrl = asset.url.replace(/^\.\//, '');
      const localFile = files.find(f => f.name === cleanUrl || f.name.endsWith(cleanUrl));
      if (localFile && localFile.content.startsWith('data:image')) {
          return localFile.content;
      }
      return null;
  };

  // Derived state for selection info
  const selectionCount = selectedAssetIds.size;
  const isAllSelected = detectedAssets.length > 0 && selectionCount === detectedAssets.length;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-hall-900/60 bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-hall-950 bg-hall-900 border border-hall-200 border-hall-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-hall-200 border-hall-800 flex justify-between items-center bg-hall-50 bg-hall-900/50 shrink-0">
          <div className="flex items-center gap-2">
            {view === 'create' && (
                <button 
                  onClick={handleBack}
                  className="mr-1 p-1 -ml-1 rounded-full hover:bg-hall-200 hover:bg-hall-800 text-hall-500 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            <h2 className="text-lg font-bold flex items-center gap-2 text-hall-900 text-ink">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Bot className="w-4 h-4" />
                </div>
                Asset Agent
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-hall-400 hover:text-hall-900 hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 relative">
            {/* View: List of Assets */}
            {view === 'list' && (
                <div className="p-6 space-y-6 pb-24">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-hall-900 text-ink">Project Assets</h3>
                            <p className="text-sm text-hall-500 text-hall-400">Select images to replace.</p>
                        </div>
                        {detectedAssets.length > 0 && !onPickAsset && (
                            <button 
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                            >
                                {isAllSelected ? <SquareCheck className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
                                {isAllSelected ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button 
                            onClick={handleCreateNew}
                            className="aspect-square rounded-xl border-2 border-dashed border-hall-300 border-hall-700 flex flex-col items-center justify-center gap-2 text-hall-500 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50/50 hover:bg-indigo-900/10 transition-all group"
                        >
                            <div className="p-3 rounded-full bg-hall-100 bg-hall-800 group-hover:bg-indigo-100 group-hover:bg-indigo-900/50 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium">Create New</span>
                        </button>

                        {detectedAssets.map(asset => {
                            const preview = getAssetPreview(asset);
                            const isSelected = selectedAssetIds.has(asset.id);
                            return (
                                <button
                                    key={asset.id}
                                    onClick={() => toggleSelection(asset.id)}
                                    className={`relative group aspect-square rounded-xl border-2 overflow-hidden transition-all text-left ${
                                        isSelected 
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                                        : 'border-hall-200 border-hall-800 hover:border-hall-300 hover:border-hall-600'
                                    }`}
                                >
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className={`w-5 h-5 rounded-xl border flex items-center justify-center transition-colors ${
                                            isSelected 
                                            ? 'bg-indigo-500 border-indigo-500 text-ink' 
                                            : 'bg-hall-950/80 bg-black/50 border-hall-300 border-hall-600'
                                        }`}>
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>

                                    {preview ? (
                                        <img src={preview} alt="asset" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-hall-100 bg-hall-900 text-hall-300 text-hall-700">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-ink text-[10px] truncate px-2 pb-1">
                                        {asset.url.split('/').pop()}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* View: Creation / Replacement */}
            {view === 'create' && (
                <div className="p-6 space-y-6">
                    {/* Header showing what we are doing */}
                    <div className="flex items-center gap-3 pb-4 border-b border-hall-100 border-hall-800/50">
                        {selectedAssetIds.size > 0 ? (
                            <>
                                <div className="flex -space-x-3 overflow-hidden">
                                    {Array.from(selectedAssetIds).slice(0, 3).map(id => {
                                        const asset = detectedAssets.find(a => a.id === id);
                                        const prev = asset ? getAssetPreview(asset) : null;
                                        return (
                                            <div key={id} className="w-12 h-12 rounded-full border-2 border-white border-hall-900 bg-hall-100 overflow-hidden shrink-0">
                                                {prev ? (
                                                    <img src={prev} className="w-full h-full object-cover" alt="" />
                                                ) : <div className="w-full h-full bg-hall-200" />}
                                            </div>
                                        )
                                    })}
                                    {selectedAssetIds.size > 3 && (
                                        <div className="w-12 h-12 rounded-full border-2 border-white border-hall-900 bg-hall-100 flex items-center justify-center text-xs font-bold text-hall-500">
                                            +{selectedAssetIds.size - 3}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
                                        {selectedAssetIds.size === 1 ? 'Single Replacement' : 'Batch Replacement'}
                                    </div>
                                    <div className="text-sm font-medium text-hall-700 text-hall-300">
                                        Updating {selectedAssetIds.size} {selectedAssetIds.size === 1 ? 'image' : 'images'}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="text-xs font-bold text-accent-500 uppercase tracking-wider mb-0.5">New Asset</div>
                                <div className="text-sm font-medium text-hall-700 text-hall-300">Generate and insert a new element</div>
                            </div>
                        )}
                    </div>

                    <div className={`space-y-6 transition-all duration-300 ${status === 'success' ? 'hidden' : 'opacity-100'}`}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-hall-900 text-hall-100">
                                {selectedAssetIds.size > 1 ? 'Batch Instruction' : 'Prompt'}
                            </label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={selectedAssetIds.size > 1 
                                    ? "Describe the theme or style for these images (e.g. 'Cyberpunk city style' or 'Minimalist geometric shapes')" 
                                    : "Describe the image you want to generate..."}
                                className="w-full bg-hall-50 bg-hall-950 border border-hall-200 border-hall-800 rounded-xl p-3 text-hall-900 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none min-h-[100px]"
                            />
                            {selectedAssetIds.size > 1 && (
                                <p className="text-xs text-hall-500">
                                    The AI will analyze each selected image's context and generate a unique, specific prompt based on your instruction.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-hall-900 text-hall-100">Resolution</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.values(ImageSize).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={`py-2 px-4 rounded-2xl text-sm font-medium border transition-all ${
                                    size === s 
                                        ? 'bg-hall-900 bg-hall-950 text-ink text-hall-950 border-hall-900 border-white shadow-sm' 
                                        : 'bg-hall-950 bg-hall-950 border-hall-200 border-hall-800 text-hall-600 text-hall-400 hover:border-hall-400'
                                    }`}
                                >
                                    {s}
                                </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={status === 'generating' || status === 'planning' || !prompt}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-ink font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {status === 'generating' || status === 'planning' ? (
                                <div className="flex items-center gap-2">
                                   <LoaderCircle className="w-4 h-4 animate-spin" />
                                   <span>{status === 'planning' ? 'Planning...' : 'Generating...'}</span>
                                </div>
                            ) : (
                                <>
                                <WandSparkles className="w-4 h-4" /> 
                                {selectedAssetIds.size > 1 ? 'Plan & Generate All' : 'Generate'}
                                </>
                            )}
                        </button>
                        
                        {(status === 'planning' || status === 'generating') && progress && (
                             <div className="text-xs text-center text-hall-500 animate-pulse">{progress}</div>
                        )}
                    </div>

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 text-red-400 text-sm bg-red-50 bg-red-900/20 p-3 rounded-2xl animate-in slide-in-from-top-2">
                            <CircleAlert className="w-4 h-4" />
                            Generation failed or interrupted. Check quotas.
                            <button onClick={() => setStatus('idle')} className="ml-auto underline">Reset</button>
                        </div>
                    )}

                    {/* Success / Result View */}
                    {status === 'success' && generatedResults.length > 0 && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-hall-500 text-hall-400 uppercase tracking-wider">Preview</h3>
                                <button 
                                    onClick={() => setStatus('idle')}
                                    className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
                                >
                                    Try Again
                                </button>
                            </div>

                            {/* Result Preview Grid */}
                            <div className={`grid gap-2 ${generatedResults.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {generatedResults.map((res, i) => (
                                    <div key={i} className="relative rounded-2xl overflow-hidden border border-hall-200 border-hall-800 bg-hall-50 bg-hall-950 aspect-square group">
                                        <img src={res.newAsset.content} alt={res.newAsset.name} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1">
                                            <p className="text-[10px] text-ink truncate text-center">{res.newAsset.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-2">
                                {generatedResults.length === 1 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-hall-900 text-hall-100 flex items-center gap-2">
                                        <FolderInput className="w-4 h-4" />
                                        Save Destination
                                        </label>
                                        <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            className="flex-1 bg-hall-50 bg-hall-950 border border-hall-200 border-hall-800 rounded-2xl p-2.5 text-sm font-mono text-hall-900 text-hall-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-ink font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {selectedAssetIds.size > 0 ? (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Confirm {generatedResults.length} Replacements
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Insert & Update Code
                                        </>
                                    )}
                                </button>
                                
                                <p className="text-xs text-hall-500 text-center leading-relaxed">
                                    {selectedAssetIds.size > 0 
                                        ? "The agent will update your code to point to these new assets."
                                        : "The agent will insert this asset and update your code."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Sticky Footer for Multi-Select Action */}
            {view === 'list' && selectionCount > 0 && (
                <div className="absolute bottom-4 left-4 right-4 animate-in slide-in-from-bottom-2">
                    <button
                        onClick={onPickAsset ? () => {
                            const id = Array.from(selectedAssetIds)[0];
                            const asset = detectedAssets.find(a => a.id === id);
                            if (asset) {
                                onPickAsset(asset.url);
                                onClose();
                            }
                        } : handleProceedWithSelection}
                        className="w-full bg-hall-900 bg-hall-950 text-ink text-hall-950 py-3 px-6 rounded-xl font-semibold shadow-xl shadow-hall-900/20 flex items-center justify-between group hover:scale-[1.02] transition-transform"
                    >
                        <span className="flex items-center gap-2">
                            <span className="bg-hall-700 bg-hall-200 text-ink text-hall-950 text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {selectionCount}
                            </span>
                            Selected
                        </span>
                        <span className="flex items-center gap-2">
                            {onPickAsset ? 'Select Asset' : 'Plan & Generate'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageTool;
