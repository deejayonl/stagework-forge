const fs = require('fs');
const path = './STATUS.md';

let content = fs.readFileSync(path, 'utf8');

const target = `## Phase 53: Visual Logic Builder & AI Actions
*Status: In Progress*

- [ ] **Task 53.1: Events & Actions UI**
  - Create a new "Interactions & Logic" tab in \`PropertyInspector.tsx\`.
  - Allow users to bind standard DOM events (Click, Hover, Submit) to elements.
- [ ] **Task 53.2: AI Action Generator Modal**
  - Build \`LogicGeneratorModal.tsx\` where users can type a natural language prompt (e.g., "When clicked, fetch weather data and update the text element below").
- [ ] **Task 53.3: BFF Route for Logic Generation**
  - Create \`/api/generate-logic\` in the Node.js BFF to process the prompt and return raw JavaScript logic.
- [ ] **Task 53.4: Logic Injection Engine**
  - Update \`fileUtils.ts\` and \`Workspace.tsx\` to safely inject the generated JavaScript into the project's global \`<script>\` execution context.`;

const replacement = `## Phase 53: Visual Logic Builder & AI Actions
*Status: Completed*

- [x] **Task 53.1: Events & Actions UI**
  - Create a new "Interactions & Logic" tab in \`PropertyInspector.tsx\`.
  - Allow users to bind standard DOM events (Click, Hover, Submit) to elements.
- [x] **Task 53.2: AI Action Generator Modal**
  - Build \`LogicGeneratorModal.tsx\` where users can type a natural language prompt (e.g., "When clicked, fetch weather data and update the text element below").
- [x] **Task 53.3: BFF Route for Logic Generation**
  - Create \`/api/generate-logic\` in the Node.js BFF to process the prompt and return raw JavaScript logic.
- [x] **Task 53.4: Logic Injection Engine**
  - Update \`fileUtils.ts\` and \`Workspace.tsx\` to safely inject the generated JavaScript into the project's global \`<script>\` execution context.`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Successfully updated STATUS.md");
} else {
  console.log("Could not find the target in STATUS.md");
}
