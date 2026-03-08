
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BrainCircuit, Zap, Paperclip, X, Loader2, Cpu, ChevronDown } from 'lucide-react';
import { Attachment } from '../types';

interface PromptInputProps {
  onGenerate: (prompt: string, useThinking: boolean, attachments: Attachment[]) => void;
  isGenerating: boolean;
  compact?: boolean;
  suggestion?: string;
  onClearSuggestion?: () => void;
  onChange?: (prompt: string) => void;
}

const LOG_MESSAGES = [
  "Warming up my brain...",
  "Reading your instructions...",
  "Looking at your files...",
  "Thinking about the best layout...",
  "Building the skeleton...",
  "Adding some style...",
  "Making sure it looks good on mobile...",
  "Making it accessible for everyone...",
  "Checking my work...",
  "Almost done! Putting on the finishing touches..."
];

const THINKING_MESSAGES = [
  "Tweaking the logic...",
  "Making it look pretty...",
  "Adding some bounce...",
  "Testing on different screen sizes...",
  "Double checking the code...",
  "Adding some magic dust ✨..."
];

const PromptInput: React.FC<PromptInputProps> = ({ 
  onGenerate, 
  isGenerating, 
  compact = false,
  suggestion,
  onClearSuggestion,
  onChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState("Gemini 3.1 Flash");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notify parent of prompt changes
  useEffect(() => {
    if (onChange) {
      onChange(prompt);
    }
  }, [prompt, onChange]);

  // Handle incoming suggestions
  useEffect(() => {
    if (suggestion) {
      setPrompt(suggestion);
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Reset height immediately to fit new content
        setTimeout(() => {
             if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
             }
        }, 0);
      }
      if (onClearSuggestion) {
        onClearSuggestion();
      }
    }
  }, [suggestion, onClearSuggestion]);

  // Animation logic for the "Terminal"
  useEffect(() => {
    if (isGenerating) {
      setLogs([]);
      let step = 0;
      const interval = setInterval(() => {
        if (step < LOG_MESSAGES.length) {
          const newLog = `> ${LOG_MESSAGES[step]}`;
          setLogs(prev => [...prev.slice(-4), newLog]); // Keep last 5 logs
          step++;
        } else {
          // If we run out of initial logs, cycle through thinking messages to keep it alive
          const randomMsg = THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];
          setLogs(prev => [...prev.slice(-4), `> ${randomMsg}`]);
        }
      }, 1500); 
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [isGenerating]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      if (!prompt) {
        textareaRef.current.style.height = '';
        return;
      }
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = compact ? 150 : 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [prompt, compact]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substring(7),
          file,
          base64,
          mimeType: file.type
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent | any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, selectedModel === 'Gemini 3.1 Pro', attachments);
      
      // Always clear input after submit
      setPrompt(''); 
      setAttachments([]);
      
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = '';
      }
    }
  };

  // Determine current display mode
  const isTerminal = isGenerating && !compact;
  const isCompactGenerating = isGenerating && compact;

  // Dynamic Container Classes
  let containerClasses = "relative overflow-hidden border bg-hall-50 dark:bg-hall-900 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ";
  
  if (isTerminal) {
      // Full Terminal Mode (Initial Generation)
      containerClasses += "border-indigo-500/50 bg-black/95 dark:bg-black/95 shadow-[0_0_80px_-20px_rgba(99,102,241,0.5)] scale-[1.02] rounded-3xl ring-1 ring-indigo-500/30";
  } else if (isCompactGenerating) {
      // Compact Progress Mode (Follow-up)
      containerClasses += "border-indigo-500/50 bg-hall-50/95 dark:bg-hall-900/95 shadow-xl shadow-indigo-500/10 rounded-[32px] ring-1 ring-indigo-500/20 scale-100 hover:scale-[1.02]";
  } else {
      // Standard Input Mode
      containerClasses += `border-hall-200 dark:border-hall-800 bg-white/90 dark:bg-hall-900/90 shadow-2xl shadow-hall-200/50 dark:shadow-black/50 hover:scale-[1.01] hover:shadow-indigo-500/10 focus-within:scale-[1.02] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)] ${compact ? 'rounded-[32px]' : 'rounded-[32px]'}`;
  }

  return (
    <div className={`w-full max-w-5xl mx-auto relative z-20`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={containerClasses}>
          
          {/* 1. TERMINAL VIEW (Large, Center) */}
          {isTerminal && (
            <div className="h-[220px] md:h-[280px] font-mono text-sm flex flex-col relative overflow-hidden">
               {/* Scanline Effect */}
               <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_51%)] bg-[length:100%_4px]"></div>
               <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-transparent via-red-500/5 to-transparent animate-scanline"></div>

              {/* Terminal Header */}
              <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-indigo-900/30 bg-indigo-950/20 z-20">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/50"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="h-4 w-px bg-indigo-800/30 mx-0.5 md:mx-1"></div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                       <Cpu className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" />
                       <span className="opacity-80">Building</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-medium">
                    <span className="animate-pulse hidden sm:inline">PROCESSING</span>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                 </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 p-4 md:p-6 flex flex-col relative z-20 text-indigo-400/90 font-medium">
                  {/* Central Agent Logo/Spinner */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 opacity-20 pointer-events-none">
                    <div className="relative">
                       <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-40 animate-pulse"></div>
                       <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Logs Container */}
                  <div className="flex-1 flex flex-col justify-end text-xs md:text-sm">
                    {logs.map((log, i) => (
                        <div key={i} className="animate-in slide-in-from-left-2 fade-in duration-300 mb-1.5 md:mb-2 flex items-start">
                        <span className="text-indigo-700/70 mr-2 md:mr-3 text-[10px] md:text-xs pt-0.5 shrink-0 hidden sm:inline">{(new Date()).toLocaleTimeString().split(' ')[0]}</span>
                        <span className="break-words leading-snug">{log}</span>
                        </div>
                    ))}
                    <div className="mt-1.5 md:mt-2 flex items-center gap-2 pl-1">
                        <span className="w-2 h-4 bg-indigo-500 animate-pulse block"></span>
                    </div>
                  </div>
              </div>
              
              {/* Footer Progress */}
              <div className="h-1 w-full bg-indigo-900/30 overflow-hidden relative">
                 <div 
                   className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)] w-[200%]"
                   style={{ animation: 'shimmer 2s linear infinite', backgroundSize: '50% 100%' }} 
                 />
                 <style dangerouslySetInnerHTML={{__html: `
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                 `}} />
              </div>
            </div>
          )}

          {/* 2. COMPACT PROGRESS (Small, Bottom) */}
          {isCompactGenerating && (
             <div className="flex items-center gap-4 p-3 pr-6 h-[60px] relative overflow-hidden">
                 {/* Background Glow */}
                 <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                 
                 {/* Animated Bottom Border */}
                 <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-900/30">
                     <div 
                       className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.8),transparent)] w-[200%]"
                       style={{ animation: 'shimmer 2s linear infinite', backgroundSize: '50% 100%' }} 
                     />
                 </div>

                 <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 relative z-10">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                 </div>
                 
                 <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5 flex items-center gap-2">
                       <span>Agent Active</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                    <div className="text-sm font-mono text-indigo-100/80 truncate">
                       {/* Show only the latest log message, stripped of '> ' prefix */}
                       {logs[logs.length - 1]?.replace('> ', '') || "Processing..."}
                    </div>
                 </div>
             </div>
          )}

          {/* 3. INPUT VIEW (Idle State) */}
          {!isGenerating && (
            <>
               {/* Attachments Preview - Positioned at top for better visibility */}
               {attachments.length > 0 && (
                <div className={`flex gap-3 overflow-x-auto p-4 border-b border-hall-100 border-hall-800/50 ${compact ? 'px-4 py-3 bg-hall-50/50 bg-hall-800/20' : 'px-6 pt-4'}`}>
                  {attachments.map(att => (
                    <div key={att.id} className="relative group shrink-0 animate-in fade-in zoom-in duration-200">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border border-hall-700 overflow-hidden bg-hall-800">
                        <img src={att.base64} alt="upload" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="absolute -top-3 -right-3 p-2 bg-indigo-500 text-ink rounded-full shadow-sm hover:bg-indigo-600 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={`flex w-full transition-all duration-300 ${compact ? 'flex-row items-end p-2' : 'flex-col p-4 md:p-6 gap-1'}`}>
                 
                 {/* Compact Left Toolbar - Fixed Width to prevent shifts */}
                 {compact && (
                   <div className="flex items-center gap-1.5 pb-1 pr-2 shrink-0 border-r border-hall-200 dark:border-hall-800/50 mr-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-hall-100 hover:bg-hall-100 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.1] active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Attach Image"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          type="button"
                          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                          className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 bg-hall-100 dark:bg-hall-900/50 border border-hall-200 dark:border-hall-800 hover:bg-hall-200 hover:scale-[1.05] active:scale-95 dark:hover:bg-hall-800/80 dark:hover:border-hall-700 shadow-sm`}
                          title="Select AI Model"
                        >
                          {selectedModel === 'Gemini 3.1 Pro' ? <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" /> : <Zap className="w-3.5 h-3.5 text-indigo-500" />}
                          <span className="text-hall-700 dark:text-hall-300 font-bold">{selectedModel === 'Gemini 3.1 Pro' ? 'Pro' : 'Flash'}</span>
                          <ChevronDown className="w-3 h-3 text-hall-500" />
                        </button>

                        {isModelDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-3 w-52 bg-white dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                            <button
                              type="button"
                              onClick={() => { setSelectedModel('Gemini 3.1 Flash'); setIsModelDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-hall-50 dark:hover:bg-hall-800 transition-colors ${selectedModel === 'Gemini 3.1 Flash' ? 'bg-hall-50 dark:bg-hall-800/50' : ''}`}
                            >
                              <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <div className="text-hall-900 dark:text-hall-100 text-[13px] font-bold">Gemini 3.1 Flash</div>
                                <div className="text-hall-500 dark:text-hall-400 text-[11px] mt-0.5 font-medium">Fastest • Everyday tasks</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSelectedModel('Gemini 3.1 Pro'); setIsModelDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-hall-50 dark:hover:bg-hall-800 transition-colors ${selectedModel === 'Gemini 3.1 Pro' ? 'bg-hall-50 dark:bg-hall-800/50' : ''}`}
                            >
                              <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                                <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div>
                                <div className="text-hall-900 dark:text-hall-100 text-[13px] font-bold">Gemini 3.1 Pro</div>
                                <div className="text-hall-500 dark:text-hall-400 text-[11px] mt-0.5 font-medium">Reasoning • Complex tasks</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                   </div>
                 )}

                 {/* Text Area */}
                 <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={compact ? "How can we improve this?" : "Describe the app you want to build..."}
                    rows={1}
                    className={`bg-transparent resize-none focus:outline-none text-hall-950 dark:text-hall-100 placeholder-hall-400 dark:placeholder-hall-500 w-full transition-all ${
                        compact 
                            ? 'py-3 px-1 text-base max-h-[150px] min-h-[46px]' 
                            : 'text-base md:text-lg min-h-[80px] md:min-h-[120px]'
                    }`}
                  />

                  {/* Large Mode Bottom Toolbar */}
                  {!compact && (
                    <div className="w-full flex items-center justify-between pt-3 md:pt-4 mt-1 md:mt-2 border-t border-hall-100 border-hall-800/50">
                        <div className="flex items-center gap-1.5 md:gap-2">

                        <button
                          type="button"
                          className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 min-h-[44px] rounded-full text-hall-600 dark:text-hall-400 hover:text-hall-900 dark:hover:text-hall-100 hover:bg-hall-100 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] active:scale-95 text-xs md:text-sm font-bold focus:outline-none"
                          title="View Prompt Templates"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-template"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>
                          <span>Templates</span>
                        </button>

                           <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-hall-500 dark:text-hall-400 hover:text-hall-900 dark:hover:text-hall-200 hover:bg-hall-100 dark:hover:bg-hall-800 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.1] active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              title="Attach Image"
                            >
                              <Paperclip className="w-5 h-5" />
                            </button>
                            
                            <div className="h-4 w-px bg-hall-200 dark:bg-hall-800 mx-0.5 md:mx-1"></div>

                            <div className="relative" ref={dropdownRef}>
                              <button 
                                type="button"
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className={`flex items-center gap-1.5 md:gap-2 cursor-pointer px-3 py-2 min-h-[44px] rounded-full text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 bg-hall-100 dark:bg-hall-900/50 border border-hall-200 dark:border-hall-800 hover:bg-hall-200 hover:scale-[1.05] active:scale-95 dark:hover:bg-hall-800/80 dark:hover:border-hall-700 shadow-sm`}
                                title="Select AI Model"
                              >
                                {selectedModel === 'Gemini 3.1 Pro' ? <BrainCircuit className="w-4 h-4 text-indigo-500" /> : <Zap className="w-4 h-4 text-indigo-500" />}
                                <span className="text-hall-700 dark:text-hall-300">{selectedModel === 'Gemini 3.1 Pro' ? 'Pro' : 'Flash'}</span>
                                <ChevronDown className="w-3 h-3 ml-1 text-hall-500" />
                              </button>

                              {isModelDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-3 w-56 bg-white dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedModel('Gemini 3.1 Flash'); setIsModelDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-hall-50 dark:hover:bg-hall-800 transition-colors ${selectedModel === 'Gemini 3.1 Flash' ? 'bg-hall-50 dark:bg-hall-800/50' : ''}`}
                                  >
                                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                      <div className="text-hall-900 dark:text-hall-100 text-sm font-bold">Gemini 3.1 Flash</div>
                                      <div className="text-hall-500 dark:text-hall-400 text-xs mt-0.5 font-medium">Fastest • Everyday tasks</div>
                                    </div>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedModel('Gemini 3.1 Pro'); setIsModelDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-hall-50 dark:hover:bg-hall-800 transition-colors ${selectedModel === 'Gemini 3.1 Pro' ? 'bg-hall-50 dark:bg-hall-800/50' : ''}`}
                                  >
                                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-500/10">
                                      <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                      <div className="text-hall-900 dark:text-hall-100 text-sm font-bold">Gemini 3.1 Pro</div>
                                      <div className="text-hall-500 dark:text-hall-400 text-xs mt-0.5 font-medium">Reasoning • Complex tasks</div>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={!prompt.trim()}
                          className={`flex items-center gap-2 font-bold px-6 md:px-8 py-2.5 md:py-3 min-h-[44px] rounded-full bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.05] hover:-translate-y-0.5 active:scale-95 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-hall-900 ${!prompt.trim() ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : ''}`}
                        >
                          <span>Forge</span>
                          <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                  )}

                  {/* Compact Mode Submit Button */}
                  {compact && (
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className={`mb-1 p-3 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/20 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.1] active:scale-95 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-hall-900 ${!prompt.trim() ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : ''}`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
              </div>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </form>
    </div>
  );
};

export default PromptInput;
