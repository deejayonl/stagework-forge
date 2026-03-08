const fs = require('fs');
const path = './src/utils/injectEditorScript.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `      (function() {
        let selectedElement = null;`;

const replacement = `      (function() {
        // Global Auth State
        window.forgeAuth = {
          currentUser: null,
          provider: 'none',
          login: function(user) {
            this.currentUser = user;
            window.parent.postMessage({ type: 'FORGE_AUTH_STATE_CHANGED', user: this.currentUser }, '*');
            document.dispatchEvent(new CustomEvent('forgeAuthChanged', { detail: { user: this.currentUser } }));
          },
          logout: function() {
            this.currentUser = null;
            window.parent.postMessage({ type: 'FORGE_AUTH_STATE_CHANGED', user: null }, '*');
            document.dispatchEvent(new CustomEvent('forgeAuthChanged', { detail: { user: null } }));
          }
        };

        let selectedElement = null;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched injectEditorScript.ts (forgeAuth)");
} else {
  console.log("Could not find the target in injectEditorScript.ts");
}
