import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { fixHtmlNode, rewriteText } from '../services/geminiService';

interface PropertyInspectorProps {
  selectedElement: any;
  variables?: Record<string, string>;
  collections?: Record<string, any>;
  apis?: Record<string, any>;
  onBindVariable?: (attribute: string, variableName: string) => void;
  onUpdateStyle: (property: string, value: string, state?: string) => void;
  onToggleClass?: (className: string, toggle: boolean) => void;
  onUpdateText: (text: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onOpenImageTool?: () => void;
  onOpenMediaManager?: () => void;
  onAutoFix?: (html: string) => void;
  onUpdateAttribute?: (attr: string, value: string) => void;
  onSaveComponent?: (html: string) => void;
  pages?: string[];
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ 
  selectedElement, 
  variables = {},
  collections = {},
  apis = {},
  onBindVariable,
  onUpdateStyle, 
  onToggleClass,
  onUpdateText,
  onClose,
  onDelete,
  onDuplicate,
  onOpenImageTool,
  onOpenMediaManager,
  onAutoFix,
  onUpdateAttribute,
  onSaveComponent,
  pages = []
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [activeState, setActiveState] = useState<string>('none');
  const hasBindings = Object.keys(variables).length > 0 || Object.keys(collections).length > 0 || Object.keys(apis).length > 0;

  if (!selectedElement) return null;

  const handleStyleChange = (property: string, value: string) => {
    onUpdateStyle(property, value, activeState !== 'none' ? activeState : undefined);
  };

  const handleRewrite = async (tone: string) => {
    if (!selectedElement.textContent) return;
    setIsRewriting(true);
    try {
      const newText = await rewriteText(selectedElement.textContent, tone);
      onUpdateText(newText);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleMagicFix = async () => {
    if (!onAutoFix || !selectedElement.outerHTML) return;
    setIsFixing(true);
    try {
      const fixedHtml = await fixHtmlNode(selectedElement.outerHTML);
      onAutoFix(fixedHtml);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFixing(false);
    }
  };

  const { tagName, path, textContent, styles } = selectedElement;

  return (
    <div className="w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-l border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800">
        <h3 className="text-sm font-bold text-hall-900 dark:text-ink">Inspector</h3>
        <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        
        {/* Element Info */}
        <div className="bg-hall-100 dark:bg-hall-900 p-3 rounded-xl flex justify-between items-start">
          <div>
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mb-1">
              &lt;{tagName}&gt;
            </div>
            <div className="text-[10px] text-hall-500 dark:text-hall-400 break-all">
              {path.join(' > ')}
            </div>
          </div>
          <div className="flex gap-1 flex-col">
            {onAutoFix && selectedElement.outerHTML && (
              <button 
                onClick={handleMagicFix} 
                disabled={isFixing}
                title="AI Magic Fix" 
                className="p-1 text-hall-500 hover:text-indigo-500 hover:bg-hall-200 dark:hover:bg-hall-800 rounded transition-colors disabled:opacity-50"
              >
                {isFixing ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            {onDuplicate && (
              <button onClick={onDuplicate} title="Duplicate (Cmd+D)" className="p-1 text-hall-500 hover:text-amber-500 hover:bg-hall-200 dark:hover:bg-hall-800 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} title="Delete (Backspace/Del)" className="p-1 text-hall-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            )}
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex gap-2">
          {onAutoFix && (
            <button
              onClick={handleMagicFix}
              disabled={isFixing}
              className="flex-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {isFixing ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> : <Sparkles className="w-3.5 h-3.5" />}
              {isFixing ? 'Fixing...' : 'Magic Fix'}
            </button>
          )}
          {onSaveComponent && (
            <button
              onClick={() => {
                if (selectedElement.outerHTML) {
                  onSaveComponent(selectedElement.outerHTML);
                }
              }}
              className="flex-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Save Component
            </button>
          )}
        </div>

        {/* State Toggles */}
        <div className="bg-hall-100 dark:bg-hall-900 p-2 rounded-xl">
          <label className="text-[10px] font-bold text-hall-700 dark:text-hall-300 mb-1.5 block px-1 uppercase tracking-wider">Style State</label>
          <div className="flex gap-1">
            {['none', 'hover', 'focus', 'active'].map(state => (
              <button
                key={state}
                onClick={() => setActiveState(state)}
                className={`flex-1 text-[10px] py-1 rounded-md font-medium capitalize transition-all ${activeState === state ? 'bg-amber-500 text-white shadow-sm' : 'text-hall-500 hover:text-hall-700 dark:hover:text-hall-300 hover:bg-hall-200 dark:hover:bg-hall-800'}`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {textContent !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Text Content</label>
              {hasBindings && onBindVariable && (
                <select 
                  className="text-[10px] bg-hall-100 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded p-1 text-hall-700 dark:text-hall-300 outline-none max-w-[100px]"
                  value={selectedElement.dataset?.bindText || ''}
                  onChange={(e) => onBindVariable('text', e.target.value)}
                >
                  <option value="">Static Text</option>
                  {Object.values(collections).length > 0 ? (
                    Object.values(collections).map((c: any) => (
                      <optgroup key={c.id} label={`Collection: ${c.name}`}>
                        {c.fields.map((f: any) => (
                          <option key={`${c.id}.${f.name}`} value={`item.${f.name}`}>
                            Bind: item.{f.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <optgroup label="List Item Bindings">
                      <option value="item">Bind: item (string)</option>
                      <option value="item.name">Bind: item.name</option>
                      <option value="item.title">Bind: item.title</option>
                      <option value="item.description">Bind: item.description</option>
                    </optgroup>
                  )}
                  <optgroup label="Global Variables">
                    {Object.keys(variables).map(key => (
                      <option key={key} value={key}>Bind: {key}</option>
                    ))}
                  </optgroup>
                  {Object.values(apis || {}).length > 0 && (
                    <optgroup label="API Responses">
                      {Object.values(apis || {}).map((api: any) => (
                        <option key={api.id} value={`api.${api.id}.response`}>Bind: {api.name} Response</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              )}
            </div>
                        <textarea 
              value={textContent}
              onChange={(e) => onUpdateText(e.target.value)}
              disabled={!!selectedElement.dataset?.bindText}
              className={`w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg p-2 text-sm text-hall-900 dark:text-ink focus:ring-2 focus:ring-amber-500 outline-none resize-y min-h-[60px] ${selectedElement.dataset?.bindText ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {!selectedElement.dataset?.bindText && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-[10px] text-hall-500 font-bold mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> AI Rewrite:
                </span>
                {['Professional', 'Casual', 'Shorter', 'Longer'].map(tone => (
                  <button
                    key={tone}
                    onClick={() => handleRewrite(tone.toLowerCase())}
                    disabled={isRewriting}
                    className="text-[10px] bg-hall-100 dark:bg-hall-900 hover:bg-hall-200 dark:hover:bg-hall-800 px-2 py-1 rounded text-hall-700 dark:text-hall-300 disabled:opacity-50 transition-colors border border-hall-200 dark:border-hall-800"
                  >
                    {isRewriting ? '...' : tone}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Image Assets */}
        {tagName === 'IMG' && onOpenImageTool && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-hall-700 dark:text-hall-300">Image Source</label>
              {hasBindings && onBindVariable && (
                <select 
                  className="text-[10px] bg-hall-100 dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded p-1 text-hall-700 dark:text-hall-300 outline-none max-w-[100px]"
                  value={selectedElement.dataset?.bindSrc || ''}
                  onChange={(e) => onBindVariable('src', e.target.value)}
                >
                  <option value="">Static Image</option>
                  {Object.values(collections || {}).length > 0 ? (
                    Object.values(collections || {}).map((c: any) => (
                      <optgroup key={c.id} label={`Collection: ${c.name}`}>
                        {c.fields.filter((f: any) => f.type === 'image' || f.type === 'text').map((f: any) => (
                          <option key={`${c.id}.${f.name}`} value={`item.${f.name}`}>
                            Bind: item.{f.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    <optgroup label="List Item Bindings">
                      <option value="item">Bind: item (string URL)</option>
                      <option value="item.image">Bind: item.image</option>
                      <option value="item.url">Bind: item.url</option>
                      <option value="item.src">Bind: item.src</option>
                    </optgroup>
                  )}
                  <optgroup label="Global Variables">
                    {Object.keys(variables).map(key => (
                      <option key={key} value={key}>Bind: {key}</option>
                    ))}
                  </optgroup>
                  {Object.values(apis || {}).length > 0 && (
                    <optgroup label="API Responses">
                      {Object.values(apis || {}).map((api: any) => (
                        <option key={api.id} value={`api.${api.id}.response`}>Bind: {api.name} Response</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              )}
            </div>
            <button
              onClick={onOpenImageTool}
              disabled={!!selectedElement.dataset?.bindSrc}
              className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedElement.dataset?.bindSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Swap Asset
            </button>
            <button
              onClick={onOpenMediaManager}
              disabled={!!selectedElement.dataset?.bindSrc}
              className={`w-full bg-hall-200 hover:bg-hall-300 dark:bg-hall-800 dark:hover:bg-hall-700 text-hall-900 dark:text-ink text-sm font-medium py-2 mt-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedElement.dataset?.bindSrc ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Choose from Media Manager
            </button>
          </div>
        )}

        {/* Dynamic List Binding */}
        {tagName !== 'IMG' && hasBindings && onBindVariable && (
          <div className="space-y-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
                Repeat as List
              </label>
            </div>
            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 leading-tight">Bind to an array variable to repeat this element's children.</p>
            <select 
              className="w-full text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedElement.dataset?.bindList || ''}
              onChange={(e) => onBindVariable('list', e.target.value)}
            >
              <option value="">Static Children (No Repeat)</option>
              {Object.values(collections || {}).length > 0 && (
                <optgroup label="Collections">
                  {Object.values(collections || {}).map((c: any) => (
                    <option key={c.id} value={c.id}>Bind Collection: {c.name}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Variables">
                {Object.keys(variables).map(key => (
                  <option key={key} value={key}>Bind Array: {key}</option>
                ))}
              </optgroup>
              {Object.values(apis || {}).length > 0 && (
                <optgroup label="API Responses">
                  {Object.values(apis || {}).map((api: any) => (
                    <option key={api.id} value={`api.${api.id}.response`}>Bind API Array: {api.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        
        {/* Layout */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Layout</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] text-hall-500">Display Mode</label>
            <div className="flex bg-hall-100 dark:bg-hall-900 p-1 rounded-lg gap-1">
              {['block', 'flex', 'grid', 'inline-block'].map(mode => (
                <button
                  key={mode}
                  onClick={() => handleStyleChange('display', mode)}
                  className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-all ${styles.display === mode ? 'bg-white dark:bg-black text-hall-900 dark:text-ink shadow-sm' : 'text-hall-500 hover:text-hall-700 dark:hover:text-hall-300'}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Position</label>
              <select
                value={styles.position || 'static'}
                onChange={(e) => handleStyleChange('position', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="static">static</option>
                <option value="relative">relative</option>
                <option value="absolute">absolute</option>
                <option value="fixed">fixed</option>
                <option value="sticky">sticky</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Z-Index</label>
              <input 
                type="number" 
                value={styles.zIndex || ''} 
                onChange={(e) => handleStyleChange('zIndex', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="auto"
              />
            </div>
          </div>

          {styles.position && styles.position !== 'static' && (
            <div className="grid grid-cols-4 gap-1 mt-1">
              <div className="space-y-1">
                <label className="text-[9px] text-hall-500 block text-center">Top</label>
                <input 
                  type="text" 
                  value={styles.top || ''} 
                  onChange={(e) => handleStyleChange('top', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[9px] text-center text-hall-900 dark:text-ink"
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-hall-500 block text-center">Right</label>
                <input 
                  type="text" 
                  value={styles.right || ''} 
                  onChange={(e) => handleStyleChange('right', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[9px] text-center text-hall-900 dark:text-ink"
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-hall-500 block text-center">Bottom</label>
                <input 
                  type="text" 
                  value={styles.bottom || ''} 
                  onChange={(e) => handleStyleChange('bottom', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[9px] text-center text-hall-900 dark:text-ink"
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-hall-500 block text-center">Left</label>
                <input 
                  type="text" 
                  value={styles.left || ''} 
                  onChange={(e) => handleStyleChange('left', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[9px] text-center text-hall-900 dark:text-ink"
                  placeholder="auto"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Overflow X</label>
              <select
                value={styles.overflowX || 'visible'}
                onChange={(e) => handleStyleChange('overflowX', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
                <option value="scroll">scroll</option>
                <option value="auto">auto</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Overflow Y</label>
              <select
                value={styles.overflowY || 'visible'}
                onChange={(e) => handleStyleChange('overflowY', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="visible">visible</option>
                <option value="hidden">hidden</option>
                <option value="scroll">scroll</option>
                <option value="auto">auto</option>
              </select>
            </div>
          </div>
          
          {(styles.display === 'flex' || styles.display === 'inline-flex' || styles.display === 'grid') && (
            <div className="space-y-3 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
              {styles.display.includes('flex') && (
                <div className="space-y-1">
                  <label className="text-[10px] text-hall-500 flex justify-between">
                    <span>Direction</span>
                    <span className="text-hall-900 dark:text-ink font-mono">{styles.flexDirection || 'row'}</span>
                  </label>
                  <div className="flex bg-white dark:bg-black border border-hall-200 dark:border-hall-800 p-0.5 rounded gap-0.5">
                    {['row', 'column', 'row-reverse', 'column-reverse'].map(dir => (
                      <button
                        key={dir}
                        onClick={() => handleStyleChange('flexDirection', dir)}
                        className={`flex-1 text-[9px] py-1 rounded-sm ${(styles.flexDirection || 'row') === dir ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-bold' : 'text-hall-500 hover:bg-hall-100 dark:hover:bg-hall-900'}`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {styles.display === 'grid' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-hall-500 flex justify-between">
                      <span>Columns</span>
                      <span className="text-hall-900 dark:text-ink font-mono text-[9px] truncate max-w-[80px]">{styles.gridTemplateColumns || 'none'}</span>
                    </label>
                    <input
                      type="text"
                      value={styles.gridTemplateColumns || ''}
                      onChange={(e) => handleStyleChange('gridTemplateColumns', e.target.value)}
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                      placeholder="e.g. 1fr 1fr or repeat(3, 1fr)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-hall-500 flex justify-between">
                      <span>Rows</span>
                      <span className="text-hall-900 dark:text-ink font-mono text-[9px] truncate max-w-[80px]">{styles.gridTemplateRows || 'none'}</span>
                    </label>
                    <input
                      type="text"
                      value={styles.gridTemplateRows || ''}
                      onChange={(e) => handleStyleChange('gridTemplateRows', e.target.value)}
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                      placeholder="e.g. auto 1fr auto"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500 flex justify-between">
                  <span>Justify</span>
                  <span className="text-hall-900 dark:text-ink font-mono text-[9px] truncate max-w-[80px]">{styles.justifyContent || 'flex-start'}</span>
                </label>
                <select 
                  value={styles.justifyContent || 'flex-start'} 
                  onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-hall-500 flex justify-between">
                  <span>Align Items</span>
                  <span className="text-hall-900 dark:text-ink font-mono text-[9px]">{styles.alignItems || 'stretch'}</span>
                </label>
                <select 
                  value={styles.alignItems || 'stretch'} 
                  onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="stretch">stretch</option>
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="baseline">baseline</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-hall-500 flex justify-between">
                  <span>Gap</span>
                  <span className="text-hall-900 dark:text-ink font-mono text-[9px]">{styles.gap || '0px'}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="64" 
                    step="4"
                    value={parseInt(styles.gap) || 0} 
                    onChange={(e) => handleStyleChange('gap', e.target.value + 'px')}
                    className="flex-1 accent-amber-500"
                  />
                  <input
                    type="text"
                    value={styles.gap || ''}
                    onChange={(e) => handleStyleChange('gap', e.target.value)}
                    className="w-12 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink"
                    placeholder="0px"
                  />
                </div>
              </div>

              {styles.display === 'grid' && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-hall-500">Row Gap</label>
                    <input 
                      type="text" 
                      value={styles.rowGap || ''} 
                      onChange={(e) => handleStyleChange('rowGap', e.target.value)}
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                      placeholder="e.g. 16px"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-hall-500">Col Gap</label>
                    <input 
                      type="text" 
                      value={styles.columnGap || ''} 
                      onChange={(e) => handleStyleChange('columnGap', e.target.value)}
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                      placeholder="e.g. 16px"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Grid Column</label>
              <input 
                type="text" 
                value={styles.gridColumn || ''} 
                onChange={(e) => handleStyleChange('gridColumn', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. span 2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Grid Row</label>
              <input 
                type="text" 
                value={styles.gridRow || ''} 
                onChange={(e) => handleStyleChange('gridRow', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 1 / 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Flex Grow</label>
              <input 
                type="number" 
                value={styles.flexGrow || ''} 
                onChange={(e) => handleStyleChange('flexGrow', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Flex Shrink</label>
              <input 
                type="number" 
                value={styles.flexShrink || ''} 
                onChange={(e) => handleStyleChange('flexShrink', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Order</label>
              <input 
                type="number" 
                value={styles.order || ''} 
                onChange={(e) => handleStyleChange('order', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Flex Basis</label>
              <input 
                type="text" 
                value={styles.flexBasis || ''} 
                onChange={(e) => handleStyleChange('flexBasis', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Align Self</label>
              <select
                value={styles.alignSelf || 'auto'}
                onChange={(e) => handleStyleChange('alignSelf', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="auto">auto</option>
                <option value="flex-start">start</option>
                <option value="flex-end">end</option>
                <option value="center">center</option>
                <option value="baseline">baseline</option>
                <option value="stretch">stretch</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Justify Self</label>
              <select
                value={styles.justifySelf || 'auto'}
                onChange={(e) => handleStyleChange('justifySelf', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="auto">auto</option>
                <option value="start">start</option>
                <option value="end">end</option>
                <option value="center">center</option>
                <option value="stretch">stretch</option>
              </select>
            </div>
          </div>
        </div>

        
        {/* Sizing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Sizing</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Width</label>
              <input 
                type="text" 
                value={styles.width || ''} 
                onChange={(e) => handleStyleChange('width', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Height</label>
              <input 
                type="text" 
                value={styles.height || ''} 
                onChange={(e) => handleStyleChange('height', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Min W / Max W</label>
              <div className="flex gap-1">
                <input 
                  type="text" 
                  value={styles.minWidth || ''} 
                  onChange={(e) => handleStyleChange('minWidth', e.target.value)}
                  className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="min"
                />
                <input 
                  type="text" 
                  value={styles.maxWidth || ''} 
                  onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                  className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="max"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Min H / Max H</label>
              <div className="flex gap-1">
                <input 
                  type="text" 
                  value={styles.minHeight || ''} 
                  onChange={(e) => handleStyleChange('minHeight', e.target.value)}
                  className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="min"
                />
                <input 
                  type="text" 
                  value={styles.maxHeight || ''} 
                  onChange={(e) => handleStyleChange('maxHeight', e.target.value)}
                  className="w-1/2 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Spacing</h4>
          
          <div className="space-y-1">
            <label className="text-[10px] text-hall-500 font-bold">Padding</label>
            <div className="flex gap-1 mb-1">
              <input 
                type="text" 
                value={styles.padding || ''} 
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="All (e.g. 10px)"
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <input type="text" value={styles.paddingTop || ''} onChange={(e) => handleStyleChange('paddingTop', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Top" />
              <input type="text" value={styles.paddingRight || ''} onChange={(e) => handleStyleChange('paddingRight', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Right" />
              <input type="text" value={styles.paddingBottom || ''} onChange={(e) => handleStyleChange('paddingBottom', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Bottom" />
              <input type="text" value={styles.paddingLeft || ''} onChange={(e) => handleStyleChange('paddingLeft', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Left" />
            </div>
          </div>
          
          <div className="space-y-1 mt-3">
            <label className="text-[10px] text-hall-500 font-bold">Margin</label>
            <div className="flex gap-1 mb-1">
              <input 
                type="text" 
                value={styles.margin || ''} 
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="All (e.g. 10px auto)"
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <input type="text" value={styles.marginTop || ''} onChange={(e) => handleStyleChange('marginTop', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Top" />
              <input type="text" value={styles.marginRight || ''} onChange={(e) => handleStyleChange('marginRight', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Right" />
              <input type="text" value={styles.marginBottom || ''} onChange={(e) => handleStyleChange('marginBottom', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Bottom" />
              <input type="text" value={styles.marginLeft || ''} onChange={(e) => handleStyleChange('marginLeft', e.target.value)} className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink" placeholder="Left" />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Typography</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Color</label>
              <input 
                type="text" 
                value={styles.color || ''} 
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Font Size</label>
              <input 
                type="text" 
                value={styles.fontSize || ''} 
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Font Family</label>
              <input 
                type="text" 
                value={styles.fontFamily || ''} 
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="inherit"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Font Weight</label>
              <select 
                value={styles.fontWeight || ''} 
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
              >
                <option value="">Inherit</option>
                <option value="100">100 - Thin</option>
                <option value="200">200 - Extra Light</option>
                <option value="300">300 - Light</option>
                <option value="400">400 - Normal</option>
                <option value="500">500 - Medium</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
                <option value="800">800 - Extra Bold</option>
                <option value="900">900 - Black</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Line Height</label>
              <input 
                type="text" 
                value={styles.lineHeight || ''} 
                onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="normal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Letter Spacing</label>
              <input 
                type="text" 
                value={styles.letterSpacing || ''} 
                onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="normal"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Text Align</label>
              <select 
                value={styles.textAlign || ''} 
                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">inherit</option>
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
                <option value="justify">justify</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Font Style</label>
              <select 
                value={styles.fontStyle || ''} 
                onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">normal</option>
                <option value="italic">italic</option>
                <option value="oblique">oblique</option>
              </select>
            </div>
            
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-hall-500">Text Shadow</label>
              <input 
                type="text" 
                value={styles.textShadow || ''} 
                onChange={(e) => handleStyleChange('textShadow', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="e.g. 1px 1px 2px black"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Transform</label>
              <select 
                value={styles.textTransform || ''} 
                onChange={(e) => handleStyleChange('textTransform', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">none</option>
                <option value="uppercase">uppercase</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">capitalize</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Decoration</label>
              <select 
                value={styles.textDecoration || ''} 
                onChange={(e) => handleStyleChange('textDecoration', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">none</option>
                <option value="underline">underline</option>
                <option value="line-through">line-through</option>
                <option value="overline">overline</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Animations & Interactions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Animations
          </h4>
          <div className="flex items-center justify-between bg-hall-100 dark:bg-hall-900 p-3 rounded-xl mb-3">
            <label className="text-xs font-bold text-hall-700 dark:text-hall-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Animate on Scroll
            </label>
            <button
              onClick={() => onToggleClass && onToggleClass('animate-on-scroll', !selectedElement.className?.includes('animate-on-scroll'))}
              className={`w-8 h-4 rounded-full transition-colors relative ${selectedElement.className?.includes('animate-on-scroll') ? 'bg-amber-500' : 'bg-hall-300 dark:bg-hall-700'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${selectedElement.className?.includes('animate-on-scroll') ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['animate-pulse', 'animate-bounce', 'animate-spin', 'animate-ping'].map(anim => {
              const isActive = selectedElement.className?.includes(anim);
              return (
                <button
                  key={anim}
                  onClick={() => onToggleClass && onToggleClass(anim, !isActive)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between ${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}`}
                >
                  {anim.replace('animate-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
          
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Transitions</h4>
          <div className="grid grid-cols-2 gap-2">
            {['transition-all', 'transition-colors', 'transition-opacity', 'transition-transform'].map(trans => {
              const isActive = selectedElement.className?.includes(trans);
              return (
                <button
                  key={trans}
                  onClick={() => onToggleClass && onToggleClass(trans, !isActive)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between ${isActive ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}`}
                >
                  {trans.replace('transition-', '')}
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['duration-150', 'duration-300', 'duration-500', 'duration-700'].map(dur => {
              const isActive = selectedElement.className?.includes(dur);
              return (
                <button
                  key={dur}
                  onClick={() => onToggleClass && onToggleClass(dur, !isActive)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-between ${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-hall-100 dark:bg-hall-900 text-hall-600 dark:text-hall-400 hover:bg-hall-200 dark:hover:bg-hall-800'}`}
                >
                  {dur.replace('duration-', '')}ms
                  {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Background */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Background</h4>
          
          <div className="space-y-1">
            <label className="text-[10px] text-hall-500">Background Color</label>
            <input 
              type="text" 
              value={styles.backgroundColor || ''} 
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
              placeholder="transparent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-hall-500">Background Image/Gradient</label>
            <input 
              type="text" 
              value={styles.backgroundImage || ''} 
              onChange={(e) => handleStyleChange('backgroundImage', e.target.value)}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
              placeholder="linear-gradient(...)"
            />
          </div>

          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Background Clip</label>
            <select
              value={styles.backgroundClip || 'border-box'}
              onChange={(e) => {
                handleStyleChange('backgroundClip', e.target.value);
                if (e.target.value === 'text') {
                  handleStyleChange('-webkit-text-fill-color', 'transparent');
                } else {
                  handleStyleChange('-webkit-text-fill-color', '');
                }
              }}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
            >
              <option value="border-box">border-box</option>
              <option value="padding-box">padding-box</option>
              <option value="content-box">content-box</option>
              <option value="text">text (gradient text)</option>
            </select>
          </div>

          {styles.backgroundImage && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Size</label>
                <select
                  value={styles.backgroundSize || 'auto'}
                  onChange={(e) => handleStyleChange('backgroundSize', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="auto">auto</option>
                  <option value="cover">cover</option>
                  <option value="contain">contain</option>
                  <option value="100% 100%">100% 100%</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Position</label>
                <select
                  value={styles.backgroundPosition || '0% 0%'}
                  onChange={(e) => handleStyleChange('backgroundPosition', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="0% 0%">top left</option>
                  <option value="50% 50%">center</option>
                  <option value="100% 100%">bottom right</option>
                </select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-hall-500">Repeat</label>
                <select
                  value={styles.backgroundRepeat || 'repeat'}
                  onChange={(e) => handleStyleChange('backgroundRepeat', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="repeat">repeat</option>
                  <option value="no-repeat">no-repeat</option>
                  <option value="repeat-x">repeat-x</option>
                  <option value="repeat-y">repeat-y</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Effects & Borders */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Effects & Borders</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Border Radius</label>
              <input 
                type="text" 
                value={styles.borderRadius || ''} 
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="0px"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Box Shadow</label>
              <select
                value={['none', '0 1px 2px 0 rgb(0 0 0 / 0.05)', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', '0 25px 50px -12px rgb(0 0 0 / 0.25)'].includes(styles.boxShadow || 'none') ? (styles.boxShadow || 'none') : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    handleStyleChange('boxShadow', e.target.value);
                  }
                }}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink mb-1"
              >
                <option value="none">None</option>
                <option value="0 1px 2px 0 rgb(0 0 0 / 0.05)">sm</option>
                <option value="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)">DEFAULT</option>
                <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">md</option>
                <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">lg</option>
                <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">xl</option>
                <option value="0 25px 50px -12px rgb(0 0 0 / 0.25)">2xl</option>
                <option value="custom">Custom...</option>
              </select>
              <input 
                type="text" 
                value={styles.boxShadow || ''} 
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-xs text-hall-900 dark:text-ink"
                placeholder="Custom (e.g. 0 4px rgba(0,0,0,0.1))"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-hall-500 flex justify-between">
              <span>Opacity</span>
              <span className="text-hall-900 dark:text-ink font-mono text-[9px]">{styles.opacity || '1'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={styles.opacity !== undefined ? parseFloat(styles.opacity) : 1} 
                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                className="flex-1 accent-amber-500"
              />
              <input
                type="text"
                value={styles.opacity || ''}
                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                className="w-12 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink"
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-hall-500 flex justify-between">
              <span>Backdrop Blur</span>
              <span className="text-hall-900 dark:text-ink font-mono text-[9px]">
                {styles.backdropFilter ? styles.backdropFilter.replace('blur(', '').replace(')', '') : '0px'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max="64" 
                step="1"
                value={styles.backdropFilter ? parseInt(styles.backdropFilter.replace('blur(', '')) || 0 : 0} 
                onChange={(e) => handleStyleChange('backdropFilter', `blur(${e.target.value}px)`)}
                className="flex-1 accent-amber-500"
              />
              <input
                type="text"
                value={styles.backdropFilter ? styles.backdropFilter.replace('blur(', '').replace(')', '') : ''}
                onChange={(e) => handleStyleChange('backdropFilter', `blur(${e.target.value})`)}
                className="w-12 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-center text-hall-900 dark:text-ink"
                placeholder="0px"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">CSS Filter</label>
              <input 
                type="text" 
                value={styles.filter || ''} 
                onChange={(e) => handleStyleChange('filter', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. blur(2px) grayscale(100%)"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Blend Mode</label>
              <select
                value={styles.mixBlendMode || 'normal'}
                onChange={(e) => handleStyleChange('mixBlendMode', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="normal">normal</option>
                <option value="multiply">multiply</option>
                <option value="screen">screen</option>
                <option value="overlay">overlay</option>
                <option value="darken">darken</option>
                <option value="lighten">lighten</option>
                <option value="color-dodge">color-dodge</option>
                <option value="color-burn">color-burn</option>
                <option value="hard-light">hard-light</option>
                <option value="soft-light">soft-light</option>
                <option value="difference">difference</option>
                <option value="exclusion">exclusion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transform & Transition */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Transform & Transition</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Scale</label>
              <input 
                type="text" 
                value={styles.scale || ''} 
                onChange={(e) => handleStyleChange('scale', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 1.2 or 1.2 1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Rotate</label>
              <input 
                type="text" 
                value={styles.rotate || ''} 
                onChange={(e) => handleStyleChange('rotate', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 45deg"
              />
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <label className="text-[10px] text-hall-500">Translate (X Y)</label>
            <input 
              type="text" 
              value={styles.translate || ''} 
              onChange={(e) => handleStyleChange('translate', e.target.value)}
              className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              placeholder="e.g. 10px 20px"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Transition Duration</label>
              <input 
                type="text" 
                value={styles.transitionDuration || ''} 
                onChange={(e) => handleStyleChange('transitionDuration', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                placeholder="e.g. 300ms"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Timing Function</label>
              <select
                value={styles.transitionTimingFunction || ''}
                onChange={(e) => handleStyleChange('transitionTimingFunction', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="">Default</option>
                <option value="ease">ease</option>
                <option value="linear">linear</option>
                <option value="ease-in">ease-in</option>
                <option value="ease-out">ease-out</option>
                <option value="ease-in-out">ease-in-out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media & Interactions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Media & Interactions</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Opacity</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={styles.opacity !== undefined ? parseFloat(styles.opacity) : 1} 
                  onChange={(e) => handleStyleChange('opacity', e.target.value)}
                  className="flex-1 accent-amber-500"
                />
                <span className="text-[10px] text-hall-900 dark:text-ink w-6 text-right">
                  {styles.opacity !== undefined ? styles.opacity : '1'}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Cursor</label>
              <select
                value={styles.cursor || 'auto'}
                onChange={(e) => handleStyleChange('cursor', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="auto">auto</option>
                <option value="default">default</option>
                <option value="pointer">pointer</option>
                <option value="text">text</option>
                <option value="move">move</option>
                <option value="not-allowed">not-allowed</option>
                <option value="grab">grab</option>
                <option value="grabbing">grabbing</option>
                <option value="crosshair">crosshair</option>
                <option value="wait">wait</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-hall-500">Pointer Events</label>
              <select
                value={styles.pointerEvents || 'auto'}
                onChange={(e) => handleStyleChange('pointerEvents', e.target.value)}
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
              >
                <option value="auto">auto</option>
                <option value="none">none</option>
              </select>
            </div>
          </div>

          {(tagName.toLowerCase() === 'img' || tagName.toLowerCase() === 'video' || tagName.toLowerCase() === 'iframe') && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Object Fit</label>
                <select
                  value={styles.objectFit || 'fill'}
                  onChange={(e) => handleStyleChange('objectFit', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                >
                  <option value="fill">fill</option>
                  <option value="contain">contain</option>
                  <option value="cover">cover</option>
                  <option value="none">none</option>
                  <option value="scale-down">scale-down</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-hall-500">Object Position</label>
                <input 
                  type="text" 
                  value={styles.objectPosition || ''} 
                  onChange={(e) => handleStyleChange('objectPosition', e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1 text-[10px] text-hall-900 dark:text-ink"
                  placeholder="e.g. center"
                />
              </div>
            </div>
          )}
        </div>

        
        {/* Form Elements */}
        {['input', 'textarea', 'select', 'form', 'button'].includes(tagName.toLowerCase()) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1 mt-4">Form Properties</h4>
            
            {tagName.toLowerCase() === 'form' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Action URL</label>
                <input
                  type="text"
                  placeholder="/api/submit"
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                  value={selectedElement.attributes?.action || ''}
                  onChange={(e) => onUpdateAttribute?.('action', e.target.value)}
                />
                <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Method</label>
                <select
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                  value={selectedElement.attributes?.method || 'get'}
                  onChange={(e) => onUpdateAttribute?.('method', e.target.value)}
                >
                  <option value="get">GET</option>
                  <option value="post">POST</option>
                </select>
              </div>
            )}

            {['input', 'textarea', 'select'].includes(tagName.toLowerCase()) && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Name (Key)</label>
                  <input
                    type="text"
                    placeholder="e.g., email"
                    className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                    value={selectedElement.attributes?.name || ''}
                    onChange={(e) => onUpdateAttribute?.('name', e.target.value)}
                  />
                </div>
                
                {['input', 'textarea'].includes(tagName.toLowerCase()) && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Placeholder</label>
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                      value={selectedElement.attributes?.placeholder || ''}
                      onChange={(e) => onUpdateAttribute?.('placeholder', e.target.value)}
                    />
                  </div>
                )}

                {tagName.toLowerCase() === 'input' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Input Type</label>
                    <select
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                      value={selectedElement.attributes?.type || 'text'}
                      onChange={(e) => onUpdateAttribute?.('type', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="number">Number</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                      <option value="date">Date</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                )}

                {tagName.toLowerCase() === 'button' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Button Type</label>
                    <select
                      className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                      value={selectedElement.attributes?.type || 'button'}
                      onChange={(e) => onUpdateAttribute?.('type', e.target.value)}
                    >
                      <option value="button">Button</option>
                      <option value="submit">Submit</option>
                      <option value="reset">Reset</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="prop-required"
                    checked={selectedElement.attributes?.required !== undefined && selectedElement.attributes?.required !== null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateAttribute?.('required', 'true');
                      } else {
                        onUpdateAttribute?.('required', '');
                      }
                    }}
                    className="rounded border-hall-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="prop-required" className="text-xs font-medium text-hall-600 dark:text-hall-400">
                    Required Field
                  </label>
                </div>
              </>
            )}
          </div>
        )}


        {/* Link Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Navigation</h4>
          <div className="space-y-2">
            <label className="text-xs font-medium text-hall-600 dark:text-hall-400">Link to Page / URL</label>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink outline-none"
                value={selectedElement.attributes?.href || ''}
                onChange={(e) => onUpdateAttribute?.('href', e.target.value)}
              >
                <option value="">None</option>
                {pages?.map(page => (
                  <option key={page} value={`./${page}`}>{page}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or custom URL (https://...)"
                className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                value={selectedElement.attributes?.href || ''}
                onChange={(e) => onUpdateAttribute?.('href', e.target.value)}
              />
            </div>
            <p className="text-[10px] text-hall-500">Sets the `href` attribute for navigation.</p>
          </div>
        </div>

        {/* Events */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Events & Actions</h4>
          
          <div className="space-y-2">
            {['click', 'change', 'submit', 'mouseEnter', 'mouseLeave'].map(eventName => {
              const attrKey = `data-on-${eventName.toLowerCase()}`;
              const datasetKey = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
              const currentValue = selectedElement.dataset?.[datasetKey] || '';

              return (
                <div key={eventName} className="space-y-1 bg-hall-50 dark:bg-hall-900/30 p-2 rounded-lg border border-hall-200 dark:border-hall-800">
                  <label className="text-[10px] font-mono text-hall-600 dark:text-hall-400">on{eventName.charAt(0).toUpperCase() + eventName.slice(1)}</label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => onUpdateAttribute?.(attrKey, e.target.value)}
                    placeholder="e.g. setVariable:isOpen:true"
                    className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-xs text-hall-900 dark:text-ink focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-hall-500 leading-tight">
            Actions: <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">navigate:page</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">setVariable:k:v</code>, <code className="bg-hall-100 dark:bg-hall-900 px-1 py-0.5 rounded">toggleVariable:k</code>
          </p>
        </div>

        {/* Advanced Customizations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Advanced</h4>
          <div className="space-y-2">
            <label className="text-[10px] text-hall-500 font-bold flex items-center gap-1">
              Custom Classes
            </label>
            <textarea
              className="w-full h-20 text-xs bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-amber-500 font-mono resize-none"
              value={selectedElement.className || ''}
              onChange={(e) => onUpdateAttribute?.('class', e.target.value)}
              placeholder="e.g. hover:scale-105 sm:hidden"
            />
            <p className="text-[9px] text-hall-500 leading-tight">
              Add raw Tailwind utility classes or custom CSS classes directly to this element.
            </p>
          </div>
        </div>

        {/* Conditional Visibility */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-hall-900 dark:text-ink uppercase tracking-wider border-b border-hall-200 dark:border-hall-800 pb-1">Visibility</h4>
          <div className="space-y-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Render Condition
              </label>
            </div>
            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 leading-tight">Show this element only if a variable evaluates to true.</p>
            <select 
              className="w-full text-xs bg-white dark:bg-black border border-indigo-200 dark:border-indigo-800 rounded p-1.5 text-hall-900 dark:text-ink outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedElement.dataset?.if || selectedElement.dataset?.['data-if'] || ''}
              onChange={(e) => onUpdateAttribute?.('data-if', e.target.value)}
            >
              <option value="">Always Visible</option>
              {Object.keys(variables).map(key => (
                <option key={key} value={key}>If: {key} is true</option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyInspector;
