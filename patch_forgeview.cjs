const fs = require('fs');

const path = './src/routes/forge/ForgeView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Hide the carousel when hasProject is true
content = content.replace(
  /\{\/\* Carousel immediately above the input prompt \*\/\}\n             <div className="w-full pointer-events-auto overflow-x-auto scrollbar-hide md:mask-gradient md:overflow-hidden pb-4">/,
  "{!hasProject && (\n               <>\n                 {/* Carousel immediately above the input prompt */}\n                 <div className=\"w-full pointer-events-auto overflow-x-auto scrollbar-hide md:mask-gradient md:overflow-hidden pb-4\">"
);

content = content.replace(
  /                  \}\)\}\n                <\/div>\n             <\/div>/,
  "                  })}\n                </div>\n             </div>\n               </>\n             )}"
);

fs.writeFileSync(path, content);
console.log('ForgeView.tsx patched');
