const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Workspace.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    updateLocalHtml(selectedElement.path, (el) => {
      if (toggle) el.classList.add(className);
      else el.classList.remove(className);
    }, true, \`Toggle class \${className}\`);`;

const replacement = `    updateLocalHtml(selectedElement.path, (el) => {
      if (toggle) el.classList.add(className);
      else el.classList.remove(className);

      if (className === 'animate-on-scroll' && toggle) {
         const doc = el.ownerDocument;
         let scriptBlock = doc.getElementById('forge-scroll-observer');
         if (!scriptBlock) {
            scriptBlock = doc.createElement('script');
            scriptBlock.id = 'forge-scroll-observer';
            scriptBlock.textContent = \`
              document.addEventListener('DOMContentLoaded', () => {
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('is-visible');
                      observer.unobserve(entry.target);
                    }
                  });
                });
                document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
              });
            \`;
            doc.body.appendChild(scriptBlock);
         }
         
         let styleBlock = doc.getElementById('forge-scroll-styles');
         if (!styleBlock) {
            styleBlock = doc.createElement('style');
            styleBlock.id = 'forge-scroll-styles';
            styleBlock.textContent = \`
              .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
              }
              .animate-on-scroll.is-visible {
                opacity: 1;
                transform: translateY(0);
              }
            \`;
            doc.head.appendChild(styleBlock);
         }
      }
    }, true, \`Toggle class \${className}\`);`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched Workspace');
