const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Workspace.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    updateLocalHtml(selectedElement.path, (el) => {
       const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
       
       if (breakpoint === 'desktop') {
         el.style.setProperty(kebabProp, value);
       } else {`;
       
const replacement = `    updateLocalHtml(selectedElement.path, (el) => {
       const kebabProp = property.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
       
       if (state === 'hover') {
         let uniqueClass = Array.from(el.classList).find(c => c.startsWith('forge-hover-'));
         if (!uniqueClass) {
           uniqueClass = 'forge-hover-' + Math.random().toString(36).substring(2, 9);
           el.classList.add(uniqueClass);
         }
         
         const doc = el.ownerDocument;
         let styleBlock = doc.getElementById('forge-hover-styles');
         if (!styleBlock) {
           styleBlock = doc.createElement('style');
           styleBlock.id = 'forge-hover-styles';
           doc.head.appendChild(styleBlock);
         }
         
         styleBlock.textContent += \`\\n.\${uniqueClass}:hover { \${kebabProp}: \${value} !important; }\`;
       } else if (breakpoint === 'desktop') {
         el.style.setProperty(kebabProp, value);
       } else {`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched');
