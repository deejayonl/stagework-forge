const fs = require('fs');
let content = fs.readFileSync('STATUS.md', 'utf8');

content = content.replace(
  "## Phase 37: External AI Models Config\n*Status: In Progress*\n\n- [ ] **Task 37.1: Anthropic & OpenAI Integration**\n  - Add Claude 3.5 Sonnet and GPT-4o configurations to `CloudConfig` component.\n  - Plumb selected model through to the `generateCode` service.\n- [ ] **Task 37.2: Custom API Key Storage**\n  - Save external API keys to `localStorage` securely.",
  "## Phase 37: External AI Models Config\n*Status: Complete*\n\n- [x] **Task 37.1: Anthropic & OpenAI Integration**\n  - Add Claude 3.5 Sonnet and GPT-4o configurations to `CloudConfig` component.\n  - Plumb selected model through to the `generateCode` service.\n- [x] **Task 37.2: Custom API Key Storage**\n  - Save external API keys to `localStorage` securely."
);

fs.writeFileSync('STATUS.md', content);
