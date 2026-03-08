const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/components/ChatOverlay.tsx', 'utf8');

const regex = /className=\{\`\n\s*absolute top-20 right-4 bottom-32 z-\[80\] \n\s*w-\[calc\(100\%-2rem\)\] md:w-\[340px\]\n\s*transition-all duration-500 cubic-bezier\(0\.16, 1, 0\.3, 1\) \n\s*\$\{isOpen \? 'translate-x-0 opacity-100' \: 'translate-x-\[20px\] opacity-0 pointer-events-none'\}\n\s*\`\}/;

const replacement = `className={\`
            fixed md:absolute top-auto md:top-20 bottom-0 md:bottom-32 left-0 md:left-auto right-0 md:right-4 z-[100] md:z-[80] 
            w-full md:w-[340px] h-[75vh] md:h-auto
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            \${isOpen ? 'translate-y-0 md:translate-y-0 md:translate-x-0 opacity-100' : 'translate-y-full md:translate-y-0 md:translate-x-[20px] opacity-0 pointer-events-none'}
        \`}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    
    // Fix buttons
    code = code.replaceAll('w-8 h-8 rounded-full hover:bg-black/5', 'w-11 h-11 md:w-8 md:h-8 rounded-full hover:bg-black/5');
    
    // Fix rounded corners for bottom sheet
    code = code.replace('glass-panel h-full rounded-3xl', 'glass-panel h-full rounded-t-3xl md:rounded-3xl border-b-0 md:border-b');
    
    fs.writeFileSync('src/routes/studio/components/ChatOverlay.tsx', code);
    console.log("Patched ChatOverlay");
} else {
    console.log("Regex didn't match in ChatOverlay");
}
