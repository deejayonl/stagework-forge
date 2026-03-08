const fs = require('fs');
const content = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

const oldCode = `             {/* Carousel immediately above the input prompt */}
             {hasProject && (
               <div className="w-full flex justify-center mb-3 sm:mb-4 px-2 overflow-x-auto scrollbar-hide">
                 <div className="flex gap-2 sm:gap-3 px-1">
                   {EXAMPLE_PROJECTS.map((proj, i) => (
                     <button
                       key={i}
                       onClick={() => setPrompt(proj.prompt)}
                       className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 dark:bg-hall-900/40 backdrop-blur-md border border-hall-200 dark:border-hall-800 text-xs sm:text-sm text-hall-600 dark:text-hall-400 font-medium hover:bg-white/20 dark:hover:bg-hall-800/60 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300 flex-shrink-0"
                     >
                       {proj.label}
                     </button>
                   ))}
                 </div>
               </div>
             )}

            <div className={\`group relative w-full flex flex-col bg-white/95 dark:bg-[#111] backdrop-blur-3xl border border-hall-200 dark:border-[#333] shadow-2xl transition-all duration-500 ease-out z-50 \${
              isFocused || prompt ? 'rounded-[1.5rem] shadow-amber-500/10' : 'rounded-[2rem] hover:rounded-[1.75rem]'
            }\`}>
              <div className="relative flex items-end min-h-[56px] p-1">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      const el = e.target;
                      el.style.height = 'auto';
                      el.style.height = \`\${Math.min(el.scrollHeight, 200)}px\`;
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) handleGenerate(prompt);
                      }
                    }}
                    placeholder={hasProject ? "Update the design..." : "Describe your project..."}
                    className="w-full bg-transparent text-hall-900 dark:text-ink placeholder:text-hall-400 dark:placeholder:text-[#666] resize-none outline-none text-[16px] sm:text-lg py-3 sm:py-3.5 px-4 sm:px-5 custom-scrollbar min-h-[44px] sm:min-h-[52px] leading-relaxed transition-all"
                    style={{ height: 'auto', maxHeight: '200px' }}
                  />
                </div>
                
                <div className="shrink-0 p-1.5 sm:p-2">
                  <button
                    onClick={() => prompt.trim() && handleGenerate(prompt)}
                    disabled={!prompt.trim() || isGenerating}
                    className={\`w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] flex items-center justify-center transition-all duration-300 ease-out \${
                      prompt.trim() && !isGenerating
                        ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95'
                        : 'bg-hall-100 dark:bg-[#222] text-hall-400 dark:text-[#555] cursor-not-allowed'
                    }\`}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>`;

const newCode = `             {/* Carousel immediately above the input prompt */}
             {hasProject && (
               <div className="w-full flex justify-center mb-3 sm:mb-4 px-2 overflow-x-auto scrollbar-hide">
                 <div className="flex gap-2 sm:gap-3 px-1">
                   {EXAMPLE_PROJECTS.map((proj, i) => (
                     <button
                       key={i}
                       onClick={() => setPrompt(proj.prompt)}
                       className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 dark:bg-hall-900/40 backdrop-blur-md border border-hall-200 dark:border-hall-800 text-xs sm:text-sm text-hall-600 dark:text-hall-400 font-medium hover:bg-white/20 dark:hover:bg-hall-800/60 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300 flex-shrink-0"
                     >
                       {proj.label}
                     </button>
                   ))}
                 </div>
               </div>
             )}

            <div className={\`group relative w-full flex flex-col bg-white/95 dark:bg-[#111]/80 backdrop-blur-xl border \${isGenerating ? 'border-amber-500/50 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]' : 'border-hall-200 dark:border-[#333] shadow-2xl'} transition-all duration-500 ease-out z-50 \${
              isFocused || prompt ? 'rounded-[1.5rem] shadow-amber-500/10 scale-[1.02]' : 'rounded-[2rem] hover:rounded-[1.75rem]'
            }\`}>
              <div className="relative flex items-end min-h-[56px] p-1">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      const el = e.target;
                      el.style.height = 'auto';
                      el.style.height = \`\${Math.min(el.scrollHeight, 200)}px\`;
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) handleGenerate(prompt);
                      }
                    }}
                    placeholder={hasProject ? (isGenerating ? "Mutating DOM..." : "Update the design...") : "Describe your project..."}
                    className={\`w-full bg-transparent \${isGenerating ? 'text-amber-500 animate-pulse' : 'text-hall-900 dark:text-ink'} placeholder:text-hall-400 dark:placeholder:text-[#666] resize-none outline-none text-[16px] sm:text-lg py-3 sm:py-3.5 px-4 sm:px-5 custom-scrollbar min-h-[44px] sm:min-h-[52px] leading-relaxed transition-colors\`}
                    style={{ height: 'auto', maxHeight: '200px' }}
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="shrink-0 p-1.5 sm:p-2">
                  <button
                    onClick={() => prompt.trim() && handleGenerate(prompt)}
                    disabled={!prompt.trim() || isGenerating}
                    className={\`w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] flex items-center justify-center transition-all duration-300 ease-out \${
                      prompt.trim() && !isGenerating
                        ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95'
                        : isGenerating 
                          ? 'bg-amber-500/20 text-amber-500' 
                          : 'bg-hall-100 dark:bg-[#222] text-hall-400 dark:text-[#555] cursor-not-allowed'
                    }\`}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>`;

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/forge/ForgeView.tsx', newFile);
