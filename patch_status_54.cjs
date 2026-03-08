const fs = require('fs');
const path = './STATUS.md';

let content = fs.readFileSync(path, 'utf8');

const target = `## Phase 54: Authentication Integrations (Supabase/Firebase)
*Status: Pending*

- [ ] **Task 54.1: Auth Integrations UI**
  - Create an "Authentication" panel in the global settings to configure Supabase URL/Key or Firebase Config.
- [ ] **Task 54.2: Auth State Management**
  - Inject a global \`window.forgeAuth\` object into the iframe preview to manage \`currentUser\` state.
- [ ] **Task 54.3: Auth AI Logic Actions**
  - Update the Logic Generator to understand auth context (e.g., "Log in user with email and password", "Sign out", "Show element only if logged in").`;

const replacement = `## Phase 54: Authentication Integrations (Supabase/Firebase)
*Status: Completed*

- [x] **Task 54.1: Auth Integrations UI**
  - Create an "Authentication" panel in the global settings to configure Supabase URL/Key or Firebase Config.
- [x] **Task 54.2: Auth State Management**
  - Inject a global \`window.forgeAuth\` object into the iframe preview to manage \`currentUser\` state.
- [x] **Task 54.3: Auth AI Logic Actions**
  - Update the Logic Generator to understand auth context (e.g., "Log in user with email and password", "Sign out", "Show element only if logged in").`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully updated STATUS.md");
} else {
  console.log("Could not find the target in STATUS.md");
}
