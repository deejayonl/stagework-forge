const fs = require('fs');

const fileUtilsPath = 'src/utils/fileUtils.ts';
let content = fs.readFileSync(fileUtilsPath, 'utf8');

// Update tailwind config injection
content = content.replace(
  /fontFamily:\s*{\s*sans:\s*\[`"\$\{theme\.fontFamily \|\| 'Inter'\}"`, 'sans-serif'\]\s*}/g,
  `fontFamily: {
                    sans: [\`"\${theme.fontFamily || 'Inter'}"\`, 'sans-serif'],
                    heading: [\`"\${theme.headingFontFamily || theme.fontFamily || 'Inter'}"\`, 'sans-serif']
                  }`
);

// Update font link injection
content = content.replace(
  /if \(theme\.fontFamily\) {[\s\S]*?const formattedName = theme\.fontFamily\.replace\(\/ \/g, '\+'\);[\s\S]*?}/g,
  `if (theme.fontFamily || theme.headingFontFamily) {
            const fonts = [];
            if (theme.fontFamily) fonts.push(theme.fontFamily.replace(/ /g, '+'));
            if (theme.headingFontFamily && theme.headingFontFamily !== theme.fontFamily) {
              fonts.push(theme.headingFontFamily.replace(/ /g, '+'));
            }
            if (fonts.length > 0) {
              const fontUrl = \`https://fonts.googleapis.com/css2?\${fonts.map(f => \`family=\${f}:wght@300;400;500;600;700\`).join('&')}&display=swap\`;
              const fontLink = doc.createElement('link');
              fontLink.rel = 'stylesheet';
              fontLink.href = fontUrl;
              doc.head.appendChild(fontLink);
            }
            if (theme.fontFamily) doc.body.style.fontFamily = \`"\${theme.fontFamily}", sans-serif\`;
          }`
);

fs.writeFileSync(fileUtilsPath, content);
