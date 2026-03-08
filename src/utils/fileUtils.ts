import { injectEditorScript } from './injectEditorScript';

import JSZip from 'jszip';
import { GeneratedFile, DetectedAsset } from '../types';

/**
 * Creates a downloadable ZIP file from the generated artifacts.
 */
export const createZipDownload = async (
  files: GeneratedFile[], 
  projectName: string = 'gemini-project',
  theme?: Record<string, string>,
  seo?: Record<string, string>,
  customFonts?: string[]
) => {
  const zip = new JSZip();

  files.forEach(file => {
    // Check if it's an image (base64)
    if (file.content.startsWith('data:image')) {
      const base64Data = file.content.split(',')[1];
      zip.file(file.name, base64Data, { base64: true });
    } else {
      let finalContent = file.content;
      
      if (file.name.endsWith('.html') || file.name === 'index.html') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(finalContent, 'text/html');
        let needsUpdate = false;

        if (seo) {
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
        }

        if (theme) {
          let twConfigScript = doc.getElementById('forge-tw-config');
          if (!twConfigScript) {
            twConfigScript = doc.createElement('script');
            twConfigScript.id = 'forge-tw-config';
            doc.head.appendChild(twConfigScript);
          }
          twConfigScript.textContent = `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: '${theme.primary || '#3b82f6'}',
                    secondary: '${theme.secondary || '#64748b'}',
                    accent: '${theme.accent || '#8b5cf6'}'
                  },
                  fontFamily: {
                    sans: ['"${theme.fontFamily || 'Inter'}"', 'sans-serif'],
                    heading: ['"${theme.headingFontFamily || theme.fontFamily || 'Inter'}"', 'sans-serif']
                  }
                }
              }
            }
          `;
          needsUpdate = true;
          
          if (theme.fontFamily || theme.headingFontFamily || (customFonts && customFonts.length > 0)) {
            let fontLink = doc.getElementById("forge-google-font") as HTMLLinkElement;
            if (!fontLink) {
              fontLink = doc.createElement("link") as HTMLLinkElement;
              fontLink.id = "forge-google-font";
              fontLink.rel = "stylesheet";
              doc.head.appendChild(fontLink);
            }
            const fontsToLoad = new Set<string>();
            if (theme.fontFamily) fontsToLoad.add(theme.fontFamily);
            if (theme.headingFontFamily) fontsToLoad.add(theme.headingFontFamily);
            if (customFonts) {
              customFonts.forEach(f => fontsToLoad.add(f));
            }
            if (fontsToLoad.size > 0) {
              const families = Array.from(fontsToLoad).map(f => f.replace(/ /g, "+") + ":wght@300;400;500;600;700").join("&family=");
              fontLink.setAttribute("href", `https://fonts.googleapis.com/css2?family=${families}&display=swap`);
            }
            if (theme.fontFamily) {
              doc.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
            }
          }
        }

        if (needsUpdate) {
          finalContent = '<!DOCTYPE html>\\n' + doc.documentElement.outerHTML;
        }
      }

      zip.file(file.name, finalContent);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Flattens multiple files into a single HTML string for previewing in an iframe.
 * Handles CSS/JS injection and local asset (image) replacement.
 */
export const flattenFilesForPreview = (
  files: GeneratedFile[], 
  targetPage: string = 'index.html', 
  seo?: Record<string, string>,
  theme?: Record<string, string>,
  customFonts?: string[]
): string => {
  const indexFile = files.find(f => f.name === targetPage) || files.find(f => f.name.endsWith('.html') || f.name === 'index.html');
  
  if (!indexFile) return '<h1>Error: No index.html found</h1>';

  let htmlContent = indexFile.content;

  files.forEach(file => {
    if (file.name === indexFile.name) return;

    // Handle CSS Injection
    if (file.type === 'css' || file.name.endsWith('.css')) {
      const regex = new RegExp(`<link[^>]*href=["'](./)?${file.name}["'][^>]*>`, 'g');
      htmlContent = htmlContent.replace(regex, `<style>\n${file.content}\n</style>`);
    }

    // Handle JS Injection
    if (file.type === 'js' || file.name.endsWith('.js')) {
      const regex = new RegExp(`<script[^>]*src=["'](./)?${file.name}["'][^>]*><\/script>`, 'g');
      htmlContent = htmlContent.replace(regex, `<script>\n${file.content}\n</script>`);
    }

    // Handle Image/Asset Injection (Virtual File System)
    // We look for src="assets/filename.png" or url('assets/filename.png') and replace with base64
    if (file.type === 'image' || file.content.startsWith('data:image')) {
      const fileName = file.name;
      // Escape special characters for regex
      const escapedName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Match: src="assets/foo.png", href="...", url("..."), srcset="..."
      // We look for the filename appearing in common attribute patterns
      // Support for: src="assets/img.png", url('assets/img.png'), url(assets/img.png)
      const assetRegex = new RegExp(`(src|href|url|srcset)\\s*(=|\\()\\s*["']?([^"'>\\)]*${escapedName})[^"'>\\)]*["']?`, 'g');
      
      htmlContent = htmlContent.replace(assetRegex, (_match, attr, separator, _path) => {
        // If it's a url(), preserve the structure
        if (attr === 'url') {
           return `url("${file.content}")`;
        }
        // For src/href/srcset, just replace the value
        return `${attr}${separator}"${file.content}"`;
      });
    }
  });

  // Inject SEO and Custom Code
  if (seo || theme) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    let needsUpdate = false;

    if (seo) {
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
    }

    if (theme) {
      let twConfigScript = doc.getElementById('forge-tw-config');
      if (!twConfigScript) {
        twConfigScript = doc.createElement('script');
        twConfigScript.id = 'forge-tw-config';
        doc.head.appendChild(twConfigScript);
      }
      twConfigScript.textContent = `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: '${theme.primary || '#3b82f6'}',
                secondary: '${theme.secondary || '#64748b'}',
                accent: '${theme.accent || '#8b5cf6'}'
              },
              fontFamily: {
                sans: ['"${theme.fontFamily || 'Inter'}"', 'sans-serif'],
                heading: ['"${theme.headingFontFamily || theme.fontFamily || 'Inter'}"', 'sans-serif']
              }
            }
          }
        }
      `;
      needsUpdate = true;
      
      if (theme.fontFamily || theme.headingFontFamily || (customFonts && customFonts.length > 0)) {
        let fontLink = doc.getElementById("forge-google-font") as HTMLLinkElement;
        if (!fontLink) {
          fontLink = doc.createElement("link") as HTMLLinkElement;
          fontLink.id = "forge-google-font";
          fontLink.rel = "stylesheet";
          doc.head.appendChild(fontLink);
        }
        const fontsToLoad = new Set<string>();
        if (theme.fontFamily) fontsToLoad.add(theme.fontFamily);
        if (theme.headingFontFamily) fontsToLoad.add(theme.headingFontFamily);
        if (customFonts) {
          customFonts.forEach(f => fontsToLoad.add(f));
        }
        if (fontsToLoad.size > 0) {
          const families = Array.from(fontsToLoad).map(f => f.replace(/ /g, "+") + ":wght@300;400;500;600;700").join("&family=");
          fontLink.setAttribute("href", `https://fonts.googleapis.com/css2?family=${families}&display=swap`);
        }
        if (theme.fontFamily) {
          doc.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
        }
      }
    }

    if (needsUpdate) {
      htmlContent = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    }
  }

  return injectEditorScript(htmlContent);

};

/**
 * Scans the provided files for asset references (images in HTML, URLs in CSS).
 */
export const findAssets = (files: GeneratedFile[]): DetectedAsset[] => {
  const assets: DetectedAsset[] = [];
  const processedUrls = new Set<string>();

  files.forEach(file => {
    if (file.type === 'html') {
       // Find <img src="...">
       // Very basic regex, might miss complex cases but good enough for templates
       const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
       let match;
       while ((match = imgRegex.exec(file.content)) !== null) {
         const url = match[1];
         // Ignore data URIs as they are likely already processed or inlined
         if (!processedUrls.has(url) && !url.startsWith('data:') && url.length < 500) {
           processedUrls.add(url);
           assets.push({
             id: `img-${assets.length}`,
             url,
             type: 'img-tag',
             location: file.name,
             context: match[0].substring(0, 100)
           });
         }
       }
       
       // Find inline styles with url(...)
       const styleRegex = /url\(["']?([^"'\)]+)["']?\)/g;
       while ((match = styleRegex.exec(file.content)) !== null) {
          const url = match[1];
          if (!processedUrls.has(url) && !url.startsWith('data:') && url.length < 500) {
            processedUrls.add(url);
            assets.push({
                id: `css-inline-${assets.length}`,
                url,
                type: 'css-url',
                location: file.name,
                context: 'Inline Style'
            });
          }
       }
    }
    
    if (file.type === 'css') {
        const cssRegex = /url\(["']?([^"'\)]+)["']?\)/g;
        let match;
        while ((match = cssRegex.exec(file.content)) !== null) {
            const url = match[1];
            if (!processedUrls.has(url) && !url.startsWith('data:') && url.length < 500) {
                processedUrls.add(url);
                assets.push({
                    id: `css-rule-${assets.length}`,
                    url,
                    type: 'css-url',
                    location: file.name,
                    context: 'CSS Rule'
                });
            }
        }
    }
  });
  
  return assets;
};
