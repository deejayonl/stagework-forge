const fs = require('fs');
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

const regex = /<div className=\{\`absolute top-0 bottom-0 right-0 z-30 transition-transform duration-300 \$\{isInspectorOpen && activeTab === 'preview' \? 'translate-x-0' \: 'translate-x-full'\}\`\}>/;
const replacement = `<div className={\`fixed md:absolute bottom-0 md:top-0 md:bottom-0 left-0 right-0 md:left-auto z-[100] md:z-30 h-[70vh] md:h-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] \${isInspectorOpen && activeTab === 'preview' ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}\`}>`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/Workspace.tsx', code);
    console.log("Patched Workspace inspector wrapper");
} else {
    console.log("Workspace inspector wrapper not found");
}
