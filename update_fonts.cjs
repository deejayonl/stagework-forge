const fs = require('fs');
const filePath = 'src/components/ThemeEditor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldFonts = `const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Poppins", "Playfair Display", "Merriweather", "Fira Code"
];`;

const newFonts = `const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Poppins", "Playfair Display", "Merriweather", "Fira Code",
  "Nunito", "Raleway", "Ubuntu", "Oswald", "Outfit",
  "Plus Jakarta Sans", "Work Sans", "Rubik", "Quicksand",
  "Lora", "PT Serif", "Noto Serif", "Crimson Pro", "Space Grotesk",
  "Space Mono", "JetBrains Mono", "DM Sans", "Manrope", "Syne",
  "Bebas Neue", "Anton", "Josefin Sans", "Cabin", "Karla"
].sort();`;

content = content.replace(oldFonts, newFonts);
fs.writeFileSync(filePath, content);
