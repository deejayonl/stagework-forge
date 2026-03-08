const fs = require('fs');
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

if (!code.includes("{ id: 'vue'")) {
    code = code.replace(
        "{ id: 'nextjs', name: 'Next.js', icon: <FileJson className=\"w-5 h-5\" />, desc: 'Full-stack Next.js app router setup with Tailwind CSS.' },",
        "{ id: 'nextjs', name: 'Next.js', icon: <FileJson className=\"w-5 h-5\" />, desc: 'Full-stack Next.js app router setup with Tailwind CSS.' },\n  { id: 'vue', name: 'Vue 3', icon: <Code2 className=\"w-5 h-5\" />, desc: 'Vue 3 Single File Component setup with Tailwind CSS.' },"
    );
    fs.writeFileSync('src/components/ExportModal.tsx', code);
    console.log("Patched ExportModal.tsx");
} else {
    console.log("Already patched ExportModal.tsx");
}
