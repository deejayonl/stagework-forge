const fs = require('fs');
let content = fs.readFileSync('src/routes/forge/ForgeView.tsx', 'utf8');

const regex = /hasProject \? 'bottom-0 md:bottom-6 md:top-auto' : 'top-\[80px\]'/;

const replacement = `hasProject ? 'bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-6 md:top-auto' : 'top-[80px]'`;

if (content.match(regex)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/routes/forge/ForgeView.tsx', content);
    console.log("Successfully patched ForgeView.tsx");
} else {
    console.log("Regex did not match!");
}
