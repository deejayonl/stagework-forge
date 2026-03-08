const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/injectEditorScript.ts');
let code = fs.readFileSync(filePath, 'utf8');

const target = `        document.body.appendChild(hoverBox);`;

const replacement = `        document.body.appendChild(hoverBox);

        // Animate on scroll logic for preview
        const scrollStyle = document.createElement('style');
        scrollStyle.id = 'forge-scroll-styles-preview';
        scrollStyle.textContent = \`
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
        document.head.appendChild(scrollStyle);

        const scrollObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            } else {
              // For preview, we might want to un-animate so they can test it again
              entry.target.classList.remove('is-visible');
            }
          });
        });

        const observeScrollElements = () => {
          document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));
        };
        observeScrollElements();
        
        // Re-observe when DOM updates
        const domObserver = new MutationObserver(() => observeScrollElements());
        domObserver.observe(document.body, { childList: true, subtree: true });`;

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code);
console.log('patched inject');
