const fs = require('fs');
const path = './src/components/PromptInput.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the compact container class to be more elegant and floating
content = content.replace(
  /containerClasses \+= \`border-hall-200 dark:border-hall-800 bg-white\/90 dark:bg-hall-900\/90 shadow-2xl shadow-hall-200\/50 dark:shadow-black\/50 hover:scale-\[1\.01\] hover:shadow-indigo-500\/10 focus-within:scale-\[1\.02\] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:shadow-\[0_0_20px_-3px_rgba\(99,102,241,0\.3\)\] \$\{compact \? 'rounded-\[32px\]' : 'rounded-\[32px\]'\}\`;/,
  () => "containerClasses += `border-hall-200 dark:border-hall-800 bg-white/90 dark:bg-hall-900/90 shadow-2xl shadow-hall-200/50 dark:shadow-black/50 hover:scale-[1.01] hover:shadow-indigo-500/10 focus-within:scale-[1.02] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)] ${compact ? 'rounded-[32px] sm:rounded-full mx-4 sm:mx-0 sm:max-w-2xl sm:ml-auto sm:mr-auto' : 'rounded-[32px]'}`;"
);

// 2. Update the compact loading state to have a subtle pulsing glow
content = content.replace(
  /containerClasses \+= "border-indigo-500\/50 bg-hall-50\/95 dark:bg-hall-900\/95 shadow-xl shadow-indigo-500\/10 rounded-\[32px\] ring-1 ring-indigo-500\/20 scale-100 hover:scale-\[1\.02\]";/,
  () => "containerClasses += \"border-indigo-500/50 bg-hall-50/95 dark:bg-hall-900/95 shadow-xl shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-[32px] sm:rounded-full mx-4 sm:mx-0 sm:max-w-2xl sm:ml-auto sm:mr-auto ring-1 ring-indigo-500/30 animate-pulse scale-100 hover:scale-[1.02]\";"
);

// 3. Update the text area to look better in compact mode and show loading state
content = content.replace(
  /placeholder=\{compact \? "How can we improve this\?" : "Describe the app you want to build\.\.\."\}/,
  () => "placeholder={compact ? (isGenerating ? \"Forging changes...\" : \"How can we improve this?\") : \"Describe the app you want to build...\"}"
);

// 4. Update the compact mode Submit Button
content = content.replace(
  /\{isGenerating \? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" \/> : <ArrowRight className="w-5 h-5" \/>\}/,
  () => "{isGenerating ? <Loader2 className=\"w-5 h-5 animate-spin text-white\" /> : <ArrowRight className=\"w-5 h-5\" />}"
);

// 5. Adjust the compact text area styling.
content = content.replace(
  /className=\`bg-transparent resize-none focus:outline-none text-hall-950 dark:text-hall-100 placeholder-hall-400 dark:placeholder-hall-500 w-full transition-all \$\{\n                        compact \n                            \? 'py-3 px-2 text-base max-h-\[150px\] min-h-\[46px\] self-center my-auto' \n                            : 'text-base md:text-lg min-h-\[80px\] md:min-h-\[120px\]'\n                    \}\`/,
  () => "className={`bg-transparent resize-none focus:outline-none text-hall-950 dark:text-hall-100 placeholder-hall-400 dark:placeholder-hall-500 w-full transition-all ${\n                        compact \n                            ? 'py-3 px-3 text-sm sm:text-base max-h-[150px] min-h-[46px] self-center my-auto' \n                            : 'text-base md:text-lg min-h-[80px] md:min-h-[120px]'\n                    }`}"
);

fs.writeFileSync(path, content);
console.log('PromptInput.tsx patched correctly (new regex)');
