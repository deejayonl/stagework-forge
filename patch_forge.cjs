const fs = require('fs');
let content = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

const regex = /className=\{\`absolute left-0 right-0 z-50 flex flex-col items-center justify-start px-3 md:px-4 transition-all duration-700 ease-\[cubic-bezier\(0\.16,1,0\.3,1\)\] \$\{\n\s*isInitialGen \n\s*\? 'top-\[15vh\]' \n\s*: 'top-\[80px\]' \n\s*\}\`\}/;

const replacement = `className={\`absolute left-0 right-0 z-50 flex flex-col items-center justify-start px-3 md:px-4 pb-[env(safe-area-inset-bottom)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] \${
            isInitialGen 
              ? 'top-[15vh]' 
              : hasProject ? 'bottom-0 md:bottom-6 md:top-auto' : 'top-[80px]' 
          }\`}`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/routes/forge/ForgeView.tsx', content);
    console.log("Successfully patched ForgeView.tsx");
} else {
    console.log("Regex did not match!");
}
