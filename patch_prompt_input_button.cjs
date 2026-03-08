const fs = require('fs');
const path = './src/components/PromptInput.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update the compact mode Submit Button
content = content.replace(
  /className=\`mb-1 p-3 ml-2 min-w-\[44px\] min-h-\[44px\] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500\/20 shrink-0 transition-all duration-300 ease-\[cubic-bezier\(0\.34,1\.56,0\.64,1\)\] hover:scale-\[1\.1\] active:scale-95 hover:-translate-y-0\.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-hall-900 \$\{!prompt\.trim\(\) \? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : ''\}\`\n                    >\n                      <ArrowRight className="w-5 h-5" \/>/,
  () => "className={`mb-1 p-3 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${isGenerating ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 hover:scale-[1.1] active:scale-95 hover:-translate-y-0.5'} text-white shadow-md shadow-indigo-500/20 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-hall-900 ${!prompt.trim() && !isGenerating ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : ''}`}\n                    >\n                      {isGenerating ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : <ArrowRight className=\"w-5 h-5\" />}"
);

// Update disabled state
content = content.replace(
  /disabled=\{!prompt\.trim\(\)\}\n                      className=\`mb-1 p-3 ml-2 min-w-\[44px\]/,
  () => "disabled={!prompt.trim() || isGenerating}\n                      className={`mb-1 p-3 ml-2 min-w-[44px]"
);

// Update textarea styling
content = content.replace(
  /className=\`bg-transparent resize-none focus:outline-none text-hall-950 dark:text-hall-100 placeholder-hall-400 dark:placeholder-hall-500 w-full transition-all \$\{\n                        compact \n                            \? 'py-3 px-2 text-base max-h-\[150px\] min-h-\[46px\] self-center my-auto' \n                            : 'text-base md:text-lg min-h-\[80px\] md:min-h-\[120px\]'\n                    \}\`/,
  () => "className={`bg-transparent resize-none focus:outline-none text-hall-950 dark:text-hall-100 placeholder-hall-400 dark:placeholder-hall-500 w-full transition-all ${\n                        compact \n                            ? 'py-3 px-3 text-sm sm:text-base max-h-[150px] min-h-[46px] self-center my-auto' \n                            : 'text-base md:text-lg min-h-[80px] md:min-h-[120px]'\n                    }`}"
);

fs.writeFileSync(path, content);
console.log('PromptInput.tsx button patched');
