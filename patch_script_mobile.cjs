const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/script/ScriptView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Adjust padding on main container
code = code.replace(
  'p-8 lg:p-12',
  'p-4 md:p-8 lg:p-12'
);

// Adjust h1 size and break
code = code.replace(
  'text-5xl md:text-6xl font-extrabold',
  'text-4xl md:text-5xl lg:text-6xl font-extrabold'
);

code = code.replace(
  'All great outputs start <br/> with intentional input.',
  'All great outputs start <br className="hidden md:block"/> with intentional input.'
);

// Adjust p size
code = code.replace(
  'text-lg md:text-xl text-hall-400',
  'text-base md:text-lg lg:text-xl text-hall-400'
);

// Adjust textarea
code = code.replace(
  'p-6 md:p-8 resize-none outline-none text-lg md:text-xl',
  'p-4 md:p-6 lg:p-8 resize-none outline-none text-base md:text-lg lg:text-xl'
);

fs.writeFileSync(filePath, code);
console.log("Patched ScriptView.tsx for mobile");
