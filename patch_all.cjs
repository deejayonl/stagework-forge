const fs = require('fs');

function patchFileUtils() {
  const path = 'src/utils/fileUtils.ts';
  let content = fs.readFileSync(path, 'utf8');

  const oldFontFamily = `fontFamily: {
                    sans: ['"\${theme.fontFamily || 'Inter'}"', 'sans-serif']
                  }`;
  const newFontFamily = `fontFamily: {
                    sans: ['"\${theme.fontFamily || 'Inter'}"', 'sans-serif'],
                    heading: ['"\${theme.headingFontFamily || theme.fontFamily || 'Inter'}"', 'sans-serif']
                  }`;
  content = content.replace(oldFontFamily, newFontFamily);

  const oldFontInject = `if (theme.fontFamily) {
            let fontLink = doc.getElementById('forge-google-font');
            if (!fontLink) {
              fontLink = doc.createElement('link');
              fontLink.id = 'forge-google-font';
              fontLink.rel = 'stylesheet';
              doc.head.appendChild(fontLink);
            }
            const formattedName = theme.fontFamily.replace(/ /g, '+');
            fontLink.href = \`https://fonts.googleapis.com/css2?family=\${formattedName}:wght@300;400;500;600;700&display=swap\`;
            
            // Apply globally
            doc.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
          }`;
  const newFontInject = `if (theme.fontFamily || theme.headingFontFamily) {
            const fonts = [];
            if (theme.fontFamily) fonts.push(theme.fontFamily.replace(/ /g, '+'));
            if (theme.headingFontFamily && theme.headingFontFamily !== theme.fontFamily) {
              fonts.push(theme.headingFontFamily.replace(/ /g, '+'));
            }
            if (fonts.length > 0) {
              const fontUrl = \`https://fonts.googleapis.com/css2?\${fonts.map(f => \`family=\${f}:wght@300;400;500;600;700\`).join('&')}&display=swap\`;
              let fontLink = doc.getElementById('forge-google-font');
              if (!fontLink) {
                fontLink = doc.createElement('link');
                fontLink.id = 'forge-google-font';
                fontLink.rel = 'stylesheet';
                doc.head.appendChild(fontLink);
              }
              fontLink.href = fontUrl;
            }
            if (theme.fontFamily) doc.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
          }`;
  content = content.replace(oldFontInject, newFontInject);

  fs.writeFileSync(path, content);
}

function patchInjectEditor() {
  const path = 'src/utils/injectEditorScript.ts';
  let content = fs.readFileSync(path, 'utf8');

  const oldFontFamily = `fontFamily: {
                      sans: ['"\\\${theme.fontFamily || 'Inter'}"', 'sans-serif']
                    }`;
  const newFontFamily = `fontFamily: {
                      sans: ['"\\\${theme.fontFamily || 'Inter'}"', 'sans-serif'],
                      heading: ['"\\\${theme.headingFontFamily || theme.fontFamily || 'Inter'}"', 'sans-serif']
                    }`;
  content = content.replace(oldFontFamily, newFontFamily);

  const oldFontInject = `if (theme.fontFamily) {
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
              document.body.style.fontFamily = \`"\\\${theme.fontFamily}", sans-serif\`;
            }`;
  const newFontInject = `if (theme.fontFamily || theme.headingFontFamily) {
              const fonts = [];
              if (theme.fontFamily) fonts.push(theme.fontFamily.replace(/ /g, '+'));
              if (theme.headingFontFamily && theme.headingFontFamily !== theme.fontFamily) {
                fonts.push(theme.headingFontFamily.replace(/ /g, '+'));
              }
              if (fonts.length > 0) {
                const fontUrl = \`https://fonts.googleapis.com/css2?\${fonts.map(f => \`family=\${f}:wght@300;400;500;600;700\`).join('&')}&display=swap\`;
                let fontLink = document.getElementById('forge-google-font');
                if (!fontLink) {
                  fontLink = document.createElement('link');
                  fontLink.id = 'forge-google-font';
                  fontLink.rel = 'stylesheet';
                  document.head.appendChild(fontLink);
                }
                fontLink.href = fontUrl;
              }
              if (theme.fontFamily) document.body.style.fontFamily = \`"\\\${theme.fontFamily}", sans-serif\`;
            }`;
  content = content.replace(oldFontInject, newFontInject);

  fs.writeFileSync(path, content);
}

patchFileUtils();
patchInjectEditor();
