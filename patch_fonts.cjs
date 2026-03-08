const fs = require('fs');

function patchFile(filePath, isFileUtil) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the block:
  // if (theme.fontFamily) {
  //   ...
  // }
  
  if (isFileUtil) {
    const pattern = /if\s*\(theme\.fontFamily\)\s*{\s*let fontLink[^}]+}[^}]+}/;
    const replacement = `if (theme.fontFamily || theme.headingFontFamily) {
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
    content = content.replace(pattern, replacement);
  } else {
    const pattern = /if\s*\(theme\.fontFamily\)\s*{\s*const formattedName[^}]+}/;
    const replacement = `if (theme.fontFamily || theme.headingFontFamily) {
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
              if (theme.fontFamily) document.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
            }`;
    content = content.replace(pattern, replacement);
  }
  
  fs.writeFileSync(filePath, content);
}

patchFile('src/utils/fileUtils.ts', true);
patchFile('src/utils/injectEditorScript.ts', false);
