const fs = require('fs');
const path = './src/utils/injectEditorScript.ts';

let content = fs.readFileSync(path, 'utf8');

const target = `      <script>
        // Store selected element
        let selectedElement = null;
        let highlightBox = null;`;

const replacement = `      <script>
        // Global Auth State
        window.forgeAuth = {
          currentUser: null,
          provider: 'none',
          login: function(user) {
            this.currentUser = user;
            window.parent.postMessage({ type: 'FORGE_AUTH_STATE_CHANGED', user: this.currentUser }, '*');
            // Trigger a custom event for logic builders
            document.dispatchEvent(new CustomEvent('forgeAuthChanged', { detail: { user: this.currentUser } }));
          },
          logout: function() {
            this.currentUser = null;
            window.parent.postMessage({ type: 'FORGE_AUTH_STATE_CHANGED', user: null }, '*');
            document.dispatchEvent(new CustomEvent('forgeAuthChanged', { detail: { user: null } }));
          }
        };

        // Store selected element
        let selectedElement = null;
        let highlightBox = null;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully patched injectEditorScript.ts (forgeAuth)");
} else {
  console.log("Could not find the target in injectEditorScript.ts");
}
