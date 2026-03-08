const fs = require('fs');
const STATUS_PATH = '/home/admin/.coder/workspace/projects/stagework-forge/STATUS.md';

let content = fs.readFileSync(STATUS_PATH, 'utf-8');
content = content.replace(/"All great outputs start with intentional input."/g, '"Great inputs make for even greater outputs."');
content = content.replace(/"Take 5 minutes to write your ideas out. We need to compact user ideas into executable plans."/g, '"Spend some time thinking about what it is you want to build. Jot down all your notes... etc"');

// also mark 51
content += `
## Phase 51: The Masterpiece Pipeline (Script -> Studio Organization)
*Status: Pending*

- [ ] **Task 51.1: Script Tab Open Canvas**
  - Redesign the Script tab to feel like an open, infinite notepad. Users should be able to type anywhere, jot down notes freely, and brainstorm without feeling confined to a small box.
- [ ] **Task 51.2: Studio Blueprint Organization**
  - Ensure that when the Script is processed, the transition to the Studio tab results in a highly organized visual map. It should look like an architectural blueprint (similar to WWDC mind-maps) where users can see all their disconnected notes compacted into a structured project plan.
- [ ] **Task 51.3: Target Selectors in Studio**
  - Move or mirror the platform/device target selection logic into the Studio tab, allowing users to dynamically add/remove targets (e.g., watchOS, macOS, iOS) directly from the visual blueprint before final generation.
- [ ] **Task 51.4: Masterpiece Stage Generation**
  - Ensure that the final transition from Studio to Stage consumes this organized blueprint and generates the complete, polished "masterpiece" application.
`;

fs.writeFileSync(STATUS_PATH, content);
