const fs = require('fs');
let code = fs.readFileSync('server/src/routes/export.ts', 'utf8');

code = code.replace(
    `        devDependencies: {
          "tailwindcss": "^3.4.1",
          "postcss": "^8",
          "autoprefixer": "^10.0.1"
        }`,
    `        devDependencies: {
          "tailwindcss": "^3.4.1",
          "postcss": "^8",
          "autoprefixer": "^10.0.1",
          "typescript": "^5",
          "@types/node": "^20",
          "@types/react": "^18",
          "@types/react-dom": "^18"
        }`
);

const tsconfig = `
      archive.append(JSON.stringify({
        "compilerOptions": {
          "lib": ["dom", "dom.iterable", "esnext"],
          "allowJs": true,
          "skipLibCheck": true,
          "strict": true,
          "noEmit": true,
          "esModuleInterop": true,
          "module": "esnext",
          "moduleResolution": "bundler",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "incremental": true,
          "plugins": [
            {
              "name": "next"
            }
          ],
          "paths": {
            "@/*": ["./*"]
          }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
      }, null, 2), { name: 'tsconfig.json' });
`;

if (!code.includes('tsconfig.json')) {
    code = code.replace(
        `archive.append(\`/** @type {import('tailwindcss').Config} */`,
        tsconfig + `\n      archive.append(\`/** @type {import('tailwindcss').Config} */`
    );
}

fs.writeFileSync('server/src/routes/export.ts', code);
