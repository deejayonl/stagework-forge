import re

files = ['src/utils/fileUtils.ts', 'src/utils/injectEditorScript.ts']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # 1. Update tailwind config to include heading font
    content = re.sub(
        r"fontFamily:\s*{\s*sans:\s*\[`\"\$?{theme\.fontFamily\s*\|\|\s*'Inter'}\"`, 'sans-serif'\]\s*}",
        r"""fontFamily: {
                    sans: [`"${theme.fontFamily || 'Inter'}"`, 'sans-serif'],
                    heading: [`"${theme.headingFontFamily || theme.fontFamily || 'Inter'}"`, 'sans-serif']
                  }""",
        content
    )
    
    # 2. Update font link injection
    # In fileUtils.ts:
    # if (theme.fontFamily) {
    #   const formattedName = theme.fontFamily.replace(/ /g, '+');
    #   doc.head.insertAdjacentHTML('beforeend', `<link href="https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`);
    #   doc.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
    # }
    
    # In injectEditorScript.ts:
    # if (theme.fontFamily) {
    #   const formattedName = theme.fontFamily.replace(/ /g, '+');
    #   const fontLink = document.createElement('link');
    #   fontLink.rel = 'stylesheet';
    #   fontLink.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700&display=swap`;
    #   document.head.appendChild(fontLink);
    #   document.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
    # }
    
    # Let's just replace the whole if (theme.fontFamily) block up to the closing brace.
    if 'fileUtils' in file:
        pattern = r"if\s*\(theme\.fontFamily\)\s*{\s*const formattedName[^}]+}"
        replacement = """if (theme.fontFamily || theme.headingFontFamily) {
            const fonts = [];
            if (theme.fontFamily) fonts.push(theme.fontFamily.replace(/ /g, '+'));
            if (theme.headingFontFamily && theme.headingFontFamily !== theme.fontFamily) {
              fonts.push(theme.headingFontFamily.replace(/ /g, '+'));
            }
            if (fonts.length > 0) {
              const fontUrl = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}:wght@300;400;500;600;700`).join('&')}&display=swap`;
              doc.head.insertAdjacentHTML('beforeend', `<link href="${fontUrl}" rel="stylesheet">`);
            }
            if (theme.fontFamily) doc.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
          }"""
        content = re.sub(pattern, replacement, content)
    else:
        pattern = r"if\s*\(theme\.fontFamily\)\s*{\s*const formattedName[^}]+}"
        replacement = """if (theme.fontFamily || theme.headingFontFamily) {
              const fonts = [];
              if (theme.fontFamily) fonts.push(theme.fontFamily.replace(/ /g, '+'));
              if (theme.headingFontFamily && theme.headingFontFamily !== theme.fontFamily) {
                fonts.push(theme.headingFontFamily.replace(/ /g, '+'));
              }
              if (fonts.length > 0) {
                const fontUrl = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f}:wght@300;400;500;600;700`).join('&')}&display=swap`;
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.href = fontUrl;
                document.head.appendChild(fontLink);
              }
              if (theme.fontFamily) document.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
            }"""
        content = re.sub(pattern, replacement, content)

    with open(file, 'w') as f:
        f.write(content)

