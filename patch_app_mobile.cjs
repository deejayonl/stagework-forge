const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Hide sidebar on mobile
code = code.replace(
  '<div className="w-[68px] shrink-0 z-50 relative h-full">',
  '<div className="w-[68px] shrink-0 z-50 relative h-full hidden md:block">'
);

// 2. Add bottom navigation for mobile, and adjust main padding
const mainContentFind = '{/* Main content */}\n      <main className="flex-1 overflow-auto min-w-0 relative">';
const bottomNav = `
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-hall-950 border-t border-hall-800 z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              \`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 \${
                isActive ? 'text-indigo-400' : 'text-hall-500 hover:text-hall-300'
              }\`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0 relative pb-16 md:pb-0">
`;

code = code.replace(mainContentFind, bottomNav);

fs.writeFileSync(filePath, code);
console.log("Patched App.tsx for mobile navigation");
