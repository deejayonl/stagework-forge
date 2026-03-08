const fs = require('fs');
const path = './server/src/routes/logic.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `Example input: "Fetch weather for London and alert it"
Example output: fetch('https://wttr.in/London?format=3').then(r => r.text()).then(t => alert(t));\`;`;

const replacement = `Example input: "Fetch weather for London and alert it"
Example output: fetch('https://wttr.in/London?format=3').then(r => r.text()).then(t => alert(t));

You have access to a global authentication object: \`window.forgeAuth\`.
It has properties:
- \`window.forgeAuth.currentUser\` (object or null)
- \`window.forgeAuth.login(userObj)\`
- \`window.forgeAuth.logout()\`

If the prompt mentions logging in, use \`window.forgeAuth.login({ email: 'user@example.com', name: 'User' })\` (or extract details from the prompt).
If it mentions logging out, use \`window.forgeAuth.logout()\`.
If it mentions showing/hiding elements based on auth, check \`window.forgeAuth.currentUser\`.\`;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched logic.ts (auth prompt)");
} else {
  console.log("Could not find the target in logic.ts");
}
