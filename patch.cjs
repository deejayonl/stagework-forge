const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    /fontFamily:\s*{\s*sans:\s*\['"\$\{theme\.fontFamily\s*\|\|\s*'Inter'\}"',\s*'sans-serif'\]\s*}/g,
    `fontFamily: {
                    sans: ['"\${theme.fontFamily || \\'Inter\\'}"', 'sans-serif'],
                    heading: ['"\${theme.headingFontFamily || theme.fontFamily || \\'Inter\\'}"', 'sans-serif']
                  }`
  );
  
  fs.writeFileSync(filePath, content);
}

patchFile('src/utils/fileUtils.ts');
patchFile('src/utils/injectEditorScript.ts');
