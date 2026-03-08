const fs = require('fs');
const content = fs.readFileSync('src/utils/fileUtils.ts', 'utf8');

const oldFunc = `export const flattenFilesForPreview = (files: GeneratedFile[], targetPage: string = 'index.html'): string => {
  const indexFile = files.find(f => f.name === targetPage) || files.find(f => f.name.endsWith('.html') || f.name === 'index.html');
  
  if (!indexFile) return '<h1>Error: No index.html found</h1>';

  let htmlContent = indexFile.content;

  files.forEach(file => {
    if (file.name === indexFile.name) return;

    // Handle CSS Injection
    if (file.type === 'css' || file.name.endsWith('.css')) {
      const regex = new RegExp(\`<link[^>]*href=["'](./)?\${file.name}["'][^>]*>\`, 'g');
      htmlContent = htmlContent.replace(regex, \`<style>\\n\${file.content}\\n</style>\`);
    }

    // Handle JS Injection
    if (file.type === 'js' || file.name.endsWith('.js')) {
      const regex = new RegExp(\`<script[^>]*src=["'](./)?\${file.name}["'][^>]*></script>\`, 'g');
      htmlContent = htmlContent.replace(regex, \`<script>\\n\${file.content}\\n</script>\`);
    }

    // Handle Image/Asset Injection (Virtual File System)
    // We look for src="assets/filename.png" or url('assets/filename.png') and replace with base64
    if (file.type === 'image' || file.content.startsWith('data:image')) {
      const fileName = file.name;
      // Escape special characters for regex
      const escapedName = fileName.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
      
      // Match: src="assets/foo.png", href="...", url("..."), srcset="..."
      // We look for the filename appearing in common attribute patterns
      // Support for: src="assets/img.png", url('assets/img.png'), url(assets/img.png)
      const assetRegex = new RegExp(\`(src|href|url|srcset)\\\\s*(=|\\\\()\\\\s*["']?([^"'>\\\\)]*\${escapedName})[^"'>\\\\)]*["']?\`, 'g');
      
      htmlContent = htmlContent.replace(assetRegex, (_match, attr, separator, _path) => {
        // If it's a url(), preserve the structure
        if (attr === 'url') {
           return \`url("\${file.content}")\`;
        }
        // For src/href/srcset, just replace the value
        return \`\${attr}\${separator}"\${file.content}"\`;
      });
    }
  });

  return injectEditorScript(htmlContent);
};`;

const newFunc = `export const flattenFilesForPreview = (files: GeneratedFile[], targetPage: string = 'index.html', seo?: Record<string, string>): string => {
  const indexFile = files.find(f => f.name === targetPage) || files.find(f => f.name.endsWith('.html') || f.name === 'index.html');
  
  if (!indexFile) return '<h1>Error: No index.html found</h1>';

  let htmlContent = indexFile.content;

  files.forEach(file => {
    if (file.name === indexFile.name) return;

    // Handle CSS Injection
    if (file.type === 'css' || file.name.endsWith('.css')) {
      const regex = new RegExp(\`<link[^>]*href=["'](./)?\${file.name}["'][^>]*>\`, 'g');
      htmlContent = htmlContent.replace(regex, \`<style>\\n\${file.content}\\n</style>\`);
    }

    // Handle JS Injection
    if (file.type === 'js' || file.name.endsWith('.js')) {
      const regex = new RegExp(\`<script[^>]*src=["'](./)?\${file.name}["'][^>]*></script>\`, 'g');
      htmlContent = htmlContent.replace(regex, \`<script>\\n\${file.content}\\n</script>\`);
    }

    // Handle Image/Asset Injection (Virtual File System)
    if (file.type === 'image' || file.content.startsWith('data:image')) {
      const fileName = file.name;
      const escapedName = fileName.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
      const assetRegex = new RegExp(\`(src|href|url|srcset)\\\\s*(=|\\\\()\\\\s*["']?([^"'>\\\\)]*\${escapedName})[^"'>\\\\)]*["']?\`, 'g');
      
      htmlContent = htmlContent.replace(assetRegex, (_match, attr, separator, _path) => {
        if (attr === 'url') {
           return \`url("\${file.content}")\`;
        }
        return \`\${attr}\${separator}"\${file.content}"\`;
      });
    }
  });

  // Inject SEO and Custom Code
  if (seo) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    let needsUpdate = false;

    if (seo.title) {
      doc.title = seo.title;
      needsUpdate = true;
    }
    if (seo.description) {
      let metaDesc = doc.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = doc.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        doc.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', seo.description);
      needsUpdate = true;
    }
    if (seo.ogImage) {
      let metaOgImage = doc.querySelector('meta[property="og:image"]');
      if (!metaOgImage) {
        metaOgImage = doc.createElement('meta');
        metaOgImage.setAttribute('property', 'og:image');
        doc.head.appendChild(metaOgImage);
      }
      metaOgImage.setAttribute('content', seo.ogImage);
      needsUpdate = true;
    }
    if (seo.customHead) {
      doc.head.insertAdjacentHTML('beforeend', seo.customHead);
      needsUpdate = true;
    }
    if (seo.customBody) {
      doc.body.insertAdjacentHTML('beforeend', seo.customBody);
      needsUpdate = true;
    }

    if (needsUpdate) {
      htmlContent = '<!DOCTYPE html>\\n' + doc.documentElement.outerHTML;
    }
  }

  return injectEditorScript(htmlContent);
};`;

const updatedContent = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/utils/fileUtils.ts', updatedContent);
console.log('Replaced successfully');
