const fs = require('fs');
const content = fs.readFileSync('src/routes/script/ScriptView.tsx', 'utf8');

const newCode = `      {/* Main Header / Typography - Hides when typing starts to create an immersive notepad */}
      <div className={\`w-full max-w-5xl mx-auto px-6 flex-shrink-0 transition-all duration-500 ease-in-out \${scriptText.trim().length > 0 ? 'opacity-0 h-0 overflow-hidden pt-0 pb-0' : 'opacity-100 pt-12 pb-4'}\`}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-hall-100 via-hall-300 to-hall-500 leading-tight">
          Great inputs make for even greater outputs.
        </h1>
        <p className="text-hall-400 mt-2 text-lg font-medium">
          Spend some time thinking about what it is you want to build. Jot down all your notes, features, and ideas.
        </p>
      </div>

      {/* Infinite Notepad Area */}
      <div className={\`flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col transition-all duration-500 \${scriptText.trim().length > 0 ? 'pt-12' : ''}\`}>
        {error && (`;

const oldCode = `      {/* Main Header / Typography */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-hall-100 via-hall-300 to-hall-500 leading-tight">
          Great inputs make for even greater outputs.
        </h1>
        <p className="text-hall-400 mt-2 text-lg font-medium">
          Spend some time thinking about what it is you want to build. Jot down all your notes, features, and ideas.
        </p>
      </div>

      {/* Infinite Notepad Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 pb-32 relative flex flex-col">
        {error && (`

const newFile = content.replace(oldCode, newCode);
fs.writeFileSync('src/routes/script/ScriptView.tsx', newFile);
