const fs = require('fs');
let content = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

// Remove malformed tag
content = content.replace(
  /\s*>\n\s*<Database className="w-4 h-4" \/>\n\s*<div className="absolute top-full mt-2 left-1\/2 -translate-x-1\/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-\[100\] shadow-lg">\n\s*Global Variables\n\s*<\/div>\n\s*<\/button>/,
  ""
);

content = content.replace(
  /\s*\{\/\* Theme Editor Panel \*\//,
  "\n        {/* Theme Editor Panel */"
);

fs.writeFileSync('src/components/Workspace.tsx', content);
