const fs = require('fs');
const filePath = 'src/utils/injectEditorScript.ts';
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `            // Inject Google Font
            if (theme.fontFamily) {
              let fontLink = document.getElementById('forge-google-font');
              if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = 'forge-google-font';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
              }
              const formattedName = theme.fontFamily.replace(/ /g, '+');
              fontLink.href = \`https://fonts.googleapis.com/css2?family=\${formattedName}:wght@300;400;500;600;700&display=swap\`;
              
              // Apply globally
              document.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
            }`;

const newCode = `            // Inject Google Font
            if (theme.fontFamily || theme.headingFontFamily) {
              const fontsToLoad = new Set();
              if (theme.fontFamily) fontsToLoad.add(theme.fontFamily);
              if (theme.headingFontFamily) fontsToLoad.add(theme.headingFontFamily);
              
              const families = Array.from(fontsToLoad).map(f => f.replace(/ /g, '+') + ':wght@300;400;500;600;700').join('&family=');
              
              let fontLink = document.getElementById('forge-google-font');
              if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = 'forge-google-font';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
              }
              fontLink.href = \`https://fonts.googleapis.com/css2?family=\${families}&display=swap\`;
              
              // Apply globally
              if (theme.fontFamily) {
                document.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
              }
            }`;

console.log(content.includes(oldCode));
content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content);
