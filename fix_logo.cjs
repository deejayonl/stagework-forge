const fs = require('fs');
const APP_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/src/App.tsx';

let content = fs.readFileSync(APP_PATH, 'utf-8');
content = content.replace(
  /<div className="w-9 h-9 min-w-\[36px\] min-h-\[36px\] mb-8 group-hover\/sidebar:mx-5 transition-all duration-500 ease-\[cubic-bezier\(0\.32,0\.72,0,1\)\]">\s*<img src="\/logo\.png" alt="Stagework" className="w-full h-full object-contain" \/>\s*<\/div>/,
  `<div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-8 shadow-lg shadow-red-500/20 group-hover/sidebar:mx-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] p-1">
            <img src="/logo.png" alt="Stagework" className="w-full h-full object-contain drop-shadow-md" />
          </div>`
);

fs.writeFileSync(APP_PATH, content);
