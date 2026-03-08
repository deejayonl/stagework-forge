const fs = require('fs');
let code = fs.readFileSync('server/src/routes/export.ts', 'utf8');

const vueBlock = `
    } else if (framework === 'vue') {
      archive.append(JSON.stringify({
        name: project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
        version: "0.0.0",
        private: true,
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "vue": "^3.4.29",
          "lucide-vue-next": "^0.400.0"
        },
        devDependencies: {
          "@vitejs/plugin-vue": "^5.0.5",
          "vite": "^5.3.1",
          "tailwindcss": "^3.4.4",
          "postcss": "^8.4.38",
          "autoprefixer": "^10.4.19"
        }
      }, null, 2), { name: 'package.json' });

      archive.append(\`import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})\`, { name: 'vite.config.js' });

      archive.append(\`/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}\`, { name: 'tailwind.config.js' });

      archive.append(\`@tailwind base;
@tailwind components;
@tailwind utilities;\`, { name: 'src/style.css' });

      archive.append(\`import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')\`, { name: 'src/main.js' });

      let mainHtml = filesToExport.find((f) => f.name === 'index.html' || f.name.endsWith('.html'));
      if (mainHtml) {
        const bodyMatch = mainHtml.content.match(/<body[^>]*>([\\s\\S]*)<\\/body>/i);
        let content = bodyMatch ? bodyMatch[1] : mainHtml.content;
        
        archive.append(\`<template>
\${content}
</template>

<script setup>
</script>\`, { name: 'src/App.vue' });
      }

      archive.append(\`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\${seoTitle}</title>
    <meta name="description" content="\${seoDescription}" />\${seoFavicon}\${seoOgImage}\${seoCustomMeta}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>\`, { name: 'index.html' });
`;

if (!code.includes("framework === 'vue'")) {
    code = code.replace("} else {", vueBlock + "\n    } else {");
    fs.writeFileSync('server/src/routes/export.ts', code);
    console.log("Patched server/src/routes/export.ts");
} else {
    console.log("Already patched server/src/routes/export.ts");
}
