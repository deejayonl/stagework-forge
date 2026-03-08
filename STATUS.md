# ⚡️ Stagework Forge: 8-Hour Production Architecture Blueprint

**Goal:** Transform the app into a production-ready, End-to-End NoCode Editor with a Thin UI Shell and a Robust BFF (Backend-for-Frontend) Architecture. 
The entire journey (Script -> Studio -> Stage) must feel magical, fluid, and state-of-the-art.

**Rules of Engagement:**
- **Every 5 Commits:** The live deployment script will auto-trigger.
- **Architectural Purity:** The frontend is strictly a Thin UI Shell. ALL AI inference, generation loops, and state compilation MUST live inside the Node BFF API endpoints.
- **Sequential Execution:** Implement strictly one task at a time. Commit your changes, mark the task as `[x]`, and proceed. Do not jump ahead.
- **Mobile-First Responsiveness:** All UI shells, tabs, sidebars, and interactive elements must gracefully scale to support seamless mobile browsing.

---

## Phase 1: Thin Client & BFF Foundation
*Status: Complete*

- [x] **Task 1.1: BFF Scaffold & Routing** 
  - Construct the Express/Hono Node.js server in `server/src`.
  - Establish API routes: `/api/generate` (for blueprints), `/api/mutate` (for stage updates), and `/api/chat` (for studio tuning).
- [x] **Task 1.2: Inference Migration**
  - Migrate all Gemini AI logic (`geminiService.ts`, etc.) completely out of the React frontend into the BFF controllers. 
  - Ensure the frontend only dispatches `POST` requests and reads streaming JSON responses.
- [x] **Task 1.3: Global App Header UI**
  - Strip old titles ("Let's build something amazing").
  - Center the page header. Insert the text: `Working Directory: <path>` (Placeholder for now, representing where implementation is saved).
- [x] **Task 1.4: Global Input & Project Carousel UI**
  - Position the main input prompt directly below the global header.
  - Immediately above the input prompt, implement a sliding carousel of "Example Projects" (e.g., *SaaS Dashboard, Mobile Social App, E-Commerce Store*).
- [x] **Task 1.5: API Endpoint Migration**
  - Completely PURGE all references to `orch.onl` and `orchestrator` across the codebase.
  - Point all frontend API calls (e.g., `api-client.ts`) to `https://sgfbackend.deejay.onl`.

---

## Phase 2: The "Script" Tab (Ideation & Input)
*Status: Complete*
*Location: 1st tab in the Sidebar.*

- [x] **Task 2.1: Route & Shell Creation**
  - Create `ScriptView.tsx` and map it as the primary landing page (1st tab).
- [x] **Task 2.2: Typography & Slogan**
  - Add the central slogan: *"All great outputs start with intentional input."* (Make it visually striking, clean typography).
  - Add subtext instruction: *"Take 5 minutes to write your ideas out. We need to compact user ideas into executable plans."*
- [x] **Task 2.3: Device Target Sliding Window**
  - Implement a sliding window/carousel allowing users to select multiple deployment targets simultaneously.
  - **Targets to include:** Mobile App (Phone), Mobile App (Tablet), Web Portfolio, Business Landing Page, Internal SaaS Dashboard, MacOS Desktop App, Windows Desktop App.
- [x] **Task 2.4: Immersive Scripting Textarea**
  - Build a large, auto-expanding, deeply immersive text area below the sliders for the user to write their vision.
- [x] **Task 2.5: Submit & Compact Logic**
  - On "Submit", send the user's script and selected targets to the BFF endpoint (`/api/generate`) to compile the executable plan.
- [x] **Task 2.6: Theatrical Transition (Script -> Studio)**
  - Do not instantly route. Show a terminal-style loading screen.
  - Include creative dialect log outputs: *"> Prepping microphone... > Tuning acoustics... > Drafting setlist... > Compacting ideas..."*
  - Automatically route to the `Studio` tab upon BFF completion.

---

## Phase 3: The "Studio" Tab (Design & Blueprint)
*Status: Complete*
*Location: 2nd tab in the Sidebar. (Previously "Canvas")*

- [x] **Task 3.1: Rename Architecture**
  - Refactor existing `CanvasView.tsx` and routes to `StudioView.tsx`. Update the Sidebar icon/label to "Studio".
- [x] **Task 3.2: Base Design Render Engine**
  - The Studio must render the base UI designs compiled from the Script tab's chosen project types. 
  - Display the wireframes/blueprints across the infinite canvas.
- [x] **Task 3.3: Contextual Tuning Chat**
  - Implement a floating chat interface that appears when a user selects a specific project design on the canvas.
  - This chat hits the BFF (`/api/chat`) to refine and tune the selected draft/design.
- [x] **Task 3.4: Theatrical Transition (Studio -> Stage)**
  - On user confirmation of the design, trigger another terminal-style loading screen.
  - Log outputs: *"> Dusting off drums... > Rigging stage lights... > Booting feedback loops..."*
  - Automatically route to the `Stage` tab.

---

## Phase 4: The "Stage" Tab (Real-time Mutation)
*Status: Complete*
*Location: 3rd tab in the Sidebar. (Previously "Studio")*

- [x] **Task 4.1: Rename Architecture**
  - Refactor existing `StudioView.tsx` to `StageView.tsx`. Update Sidebar label to "Stage".
- [x] **Task 4.2: Real-Time Mutation Engine** 
  - The Stage displays the live, interactive final product.
  - Hook it up to the Global Input Prompt (from Task 1.4). When the user types in the global prompt, hit the BFF (`/api/mutate`) and stream the live DOM updates to the Stage.
- [x] **Task 4.3: Intelligent Targeting Logic**
  - **Global Mode:** If no specific product/device is selected on the Stage, the global prompt mutation applies to ALL products generated from Phase 2.
  - **Isolated Mode:** If the user clicks/selects a specific product on the Stage, the global input prompt mutates ONLY the selected product.

---
*Architect's Note to Coder: Stay highly disciplined. Do not merge Phase tasks. The Thin UI/BFF split is paramount for system stability.*

## Phase 4.5: Mobile Responsiveness Sweep
*Status: Complete*

- [x] **Task 4.5.1: Global Mobile Navigation**
  - Ensure the sidebar collapses into a hamburger menu or bottom tab bar on mobile screens.
- [x] **Task 4.5.2: Responsive Script Tab**
  - Ensure the device sliders and intentional input area scale gracefully on `sm:` and `md:` breakpoints.
- [x] **Task 4.5.3: Responsive Studio & Stage**
  - Ensure the Canvas (Studio) and Live Render (Stage) are usable on mobile devices, preventing horizontal overflow where unintended and scaling down UI overlays.

## Phase 5: End-to-End Verification
*Status: Complete*

- [x] **Task 5.1: Verify API Routes**
  - Ensure that the application correctly hits `https://sgfbackend.deejay.onl/api/generate` and `https://sgfbackend.deejay.onl/api/mutate`.
  - Validate that the responses are correctly parsed and rendered in the Studio and Stage tabs.
- [x] **Task 5.2: Verify State Transitions**
  - Test the flow from Script -> Studio -> Stage to ensure loading screens and routing work as expected.


## Phase 6: Production Deployment
*Status: Complete*

- [x] **Task 6.1: Finalize Build & Trigger Deploy**
  - Ensure all prior phases are committed and push to trigger the final deployment loop.
- [x] **Task 6.2: Configure Remote Upstream**
  - Run `git push --set-upstream origin main` to resolve missing upstream tracking.
- [x] **Task 6.3: Export to Code**
  - Ensure the `ExportModal` syncs with the BFF `export.ts` API by supporting Vite, Next.js, and HTML formats.

## Phase 7: Post-Deployment 
*Status: Skipped/Resolved by Host*

- [x] **Task 7.1: Resolve Git Credentials**
  - Git push is failing due to an invalid GitHub token. The deployment script `deploy-sgf.sh` has been updated by the host to trigger locally regardless of push status.

---

## Phase 8: Advanced NoCode Editor Features
*Status: Complete*

- [x] **Task 8.1: Component Sidebar Integration**
  - Integrate `ComponentLibrary.tsx` into `ForgeView.tsx` so users have a palette of UI elements available on the Stage.
- [x] **Task 8.2: Live DOM Tree Explorer**
  - Integrate `DOMTreeExplorer.tsx` into the Stage sidebar to show the actual structure of the generated application.
- [x] **Task 8.3: Property Inspector**
  - Integrate `PropertyInspector.tsx` so users can click elements on the Stage and edit their Tailwind classes, text content, and properties.

---

## Phase 9: Component Library Expansion
*Status: Complete*

- [x] **Task 9.1: Rich UI Components Data**
  - Expand `ComponentLibrary.tsx` to include Hero Sections, Feature Grids, Pricing Tables, and Testimonial blocks.
- [x] **Task 9.2: Component Library UI Enhancements**
  - Improve the visual presentation of the component library sidebar (e.g., better categorization, hover states).

---

## Phase 10: Theme & Styling Enhancements
*Status: Complete*

- [x] **Task 10.1: Color Palette Generator**
  - Add a feature in `ThemeEditor.tsx` to automatically generate complementary color palettes based on a single primary color input.
- [x] **Task 10.2: Typography Presets**
  - Add font pairing presets (e.g., Inter + Merriweather, Roboto + Open Sans) to the Theme Editor for quick brand styling.

## Phase 11: Export & Deployment Polish
*Status: Complete*

- [x] **Task 11.1: Refactor Export Modal UI**
  - Update `ExportModal.tsx` to include a proper body with framework selection (React/Vite, HTML/Tailwind, Vue) instead of cramming buttons into the header.
  - Separate the "Download ZIP" and "Deploy" actions into distinct, visually appealing sections.

## Phase 12: Application State Cleanups
*Status: Complete*

- [x] **Task 12.1: Types definitions fix**
  - Fix duplicate `apis` property in `src/types.ts`.

## Phase 13: Live Cursors & Collaboration Fixes
*Status: Complete*

- [x] **Task 13.1: Live Cursors prop fix**
  - Fix unused `provider` prop in `src/components/LiveCursors.tsx` and ensure it's properly typed and integrated or removed if unnecessary.

## Phase 14: Unused Imports Cleanup
*Status: Complete*

- [x] **Task 14.1: Clean up unused react imports**
  - Fix unused `isComponentsOpen` in `Workspace.tsx`.
  - Fix unused `bootstrapProgress` in `ForgeView.tsx`.

## Phase 15: Workspace Component TypeScript Fixes
*Status: Complete*

- [x] **Task 15.1: Fix missing versions array reference**
  - Fix undefined `versions` and missing variables in `Workspace.tsx` around line 1312 and 1315.

## Phase 16: TypeScript Strict Mode Fixes
*Status: Complete*

- [x] **Task 16.1: Fix missing type parameters**
  - Add missing type parameters in `Workspace.tsx` around line 1312 and 1315.
  - Fix missing `currentVersionIndex` in `Workspace.tsx`.

## Phase 17: Host Intervention Required
*Status: Skipped/Resolved by Host*

- [x] **Task 17.1: Await Git Credential Resolution**
  - The development loop was stalled. The host has resolved the issue by modifying `deploy-sgf.sh` to trigger locally regardless of push status.


## Phase 18: TypeScript Strict Mode Fixes (Round 2)
*Status: Complete*

- [x] **Task 18.1: Fix unused imports and variables across components**
  - Clean up unused variables in `CloudConfig.tsx`, `ComponentLibrary.tsx`, `ExportModal.tsx`, `Header.tsx`, `ImageTool.tsx`, etc.
- [x] **Task 18.2: Fix typing errors in StudioView and InfiniteCanvas**
  - Resolve missing properties and undefined variables in `StudioView.tsx` and `InfiniteCanvas.tsx`.
- [x] **Task 18.3: Resolve type mismatches in API hooks and utility files**
  - Fix missing properties on HTMLElements and undefined types in `PreviewView.tsx` and `fileUtils.ts`.

## Phase 19: Thin UI Architecture Refinement
*Status: Complete*

- [x] **Task 19.1: Review Thin UI Architecture**
  - Ensure the frontend remains a strict thin client and does not contain heavy business logic that should be in the BFF. Confirmed AI inference requests are offloaded to `sgfbackend.deejay.onl`.
- [x] **Task 19.2: Resolve any remaining UI/UX issues**
  - Checked for visual bugs, layout shifts, or missing states across the Script, Studio, and Stage views. Fixed the Stage transition missing `workspaces` state bug.

## Phase 20: BFF Server TypeScript Strict Mode Fixes
*Status: Complete*

- [x] **Task 20.1: Fix missing types and unused variables in BFF**
  - Resolve TS errors in `server/src/routes/autofix.ts`, `generate.ts`, `mutate.ts`, and `rewrite.ts`.
## Phase 21: Final Codebase Polish and Deployment Stabilization
*Status: Complete*

- [x] **Task 21.1: Fix missing upstream branch tracking**
  - Ensure the repository can push to `origin main` to keep the deployment script functional.
- [x] **Task 21.2: Remove unused dependencies**
  - Audit `package.json` for unused dependencies and clean them up if necessary.
- [x] **Task 21.3: Verify final build process**
  - Run `npm run build:all` to ensure both the BFF and the frontend build perfectly.
## Phase 22: Codebase Cleanup and Component Audit
*Status: Complete*

- [x] **Task 22.1: Audit unused files**
  - Checked for unused components, routes, and utilities. Removed `replace.go` script. `ForgeView` and `Workspace` are still used by `StageView` as the core mutation engine.
- [x] **Task 22.2: Ensure all UI states are handled**
  - Verified that the Stage and Studio tabs handle empty states gracefully without crashing.
## Phase 23: Complete Execution and Review
*Status: Complete*

- [x] **Task 23.1: Final status check**
  - Ensure all objectives from the 8-Hour Production Architecture Blueprint have been successfully met.
  - The application is a fully functional Thin UI Shell powered by the BFF Architecture.
## Phase 24: Codebase Clean-up (Console Logs)
*Status: Complete*

- [x] **Task 24.1: Remove stray console.logs**
  - Clean up debug console.log statements across frontend and BFF codebase to ensure production readiness.
## Phase 25: Performance & Bundle Size Optimizations
*Status: Complete*

- [x] **Task 25.1: Dynamic Imports for heavy components**
  - Ensure heavy elements like Monaco Editor are lazily loaded. (Removed unused `@monaco-editor/react` dependency instead as it was no longer used).
- [x] **Task 25.2: CSS Purging and Optimization**
  - Verify Tailwind CSS is properly minified and purging unused styles in production build.
## Phase 26: Core Editor Experience (Undo/Redo & Shortcuts)
*Status: Complete*

- [x] **Task 26.1: Implement Undo/Redo History Stack**
  - Create a history state management system (e.g., using a custom hook or Zustand) to track changes to the `workspaces` and `elements` state.
  - Implement `undo` and `redo` functions that restore previous states.
- [x] **Task 26.2: Add Keyboard Shortcuts**
  - Bind `Ctrl+Z` / `Cmd+Z` to Undo.
  - Bind `Ctrl+Shift+Z` / `Cmd+Shift+Z` to Redo.
  - Bind `Delete` / `Backspace` to remove the currently selected element.
- [x] **Task 26.3: Add Undo/Redo UI Controls**
  - Add visible Undo and Redo buttons to the Global Header or Stage Toolbar for accessibility.

## Phase 27: Drag & Drop Element Reordering
*Status: Complete*

- [x] **Task 27.1: Implement Drag Handles in DOM Explorer**
  - Add draggable attributes and visual handles to the nodes inside `DOMTreeExplorer.tsx`.
- [x] **Task 27.2: Handle Drop Events & Reorder Logic**
  - Listen for drop events and calculate the new position of the element.
  - Update the `localFiles` or `workspaces` state to reflect the new DOM structure.
- [x] **Task 27.3: Visual Drop Indicators**
  - Show a blue line or highlight indicating where the element will be placed when dropped.


## Phase 28: Global Project Settings & Metadata
*Status: Complete*

- [x] **Task 28.1: Global Settings Modal UI**
  - Create a `SettingsModal.tsx` accessible from the global header.
  - Add inputs for Project Title, Description, Favicon URL, and Meta Tags.
- [x] **Task 28.2: Metadata State Management**
  - Update the `workspaces` state to include global metadata.
  - Inject metadata into the exported HTML `<head>`.
## Phase 29: Variable Binding & API Testing UI
*Status: Complete*

- [x] **Task 29.1: API Integrations Panel UI**
  - Refine `ApiIntegrationsPanel.tsx` to allow adding custom API endpoints (GET, POST, PUT, DELETE) with headers and body.
  - Implement a "Test Request" button that executes the fetch and stores the response JSON in the project state.
- [x] **Task 29.2: Variable Binding in Property Inspector**
  - Add a dedicated section in `PropertyInspector.tsx` to allow binding elements (like text or image source) to specific keys from the tested API response or Collections.

## Phase 30: Live Sync & Collaboration Architecture
*Status: Complete*

- [x] **Task 30.1: Migrate Yjs WebSocket Provider**
  - Switch `useProjects.ts` from the demo server (`wss://demos.yjs.dev`) to the custom BFF WebSocket route (`wss://sgfbackend.deejay.onl/sync`).
- [x] **Task 30.2: Configure BFF WebSocket Server**
  - Update `server/src/index.ts` to properly handle WebSocket connections on `/sync/:projectId`.
  - Implement broadcasting of binary Yjs messages to all connected clients for a specific project.

## Phase 31: Host Intervention Required
*Status: Complete*

- [x] **Task 31.1: Verify Git Credentials**
  - Git push is still failing due to an invalid GitHub token. 
  - The host provided a workaround: bypass `git push` and rely solely on local `git add` and `git commit` to trigger the `deploy-sgf.sh` loop.

## Phase 32: Complete BFF Logic Migration (Task 1.2 Revision)
*Status: Complete*

- [x] **Task 32.1: Server-Side AI Provider Authentication**
  - Refactored `getProviderConfig` in all BFF routes (`generate.ts`, `mutate.ts`, `autofix.ts`, `rewrite.ts`) to securely fall back to `process.env` (e.g., `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) if no authorization header is provided by the client.
  - This ensures true BFF architecture where the frontend client is not required to handle API keys.
- [x] **Task 32.2: Frontend Inference Migration Cleanup**
  - Removed all `throw new Error` blocks in `src/services/geminiService.ts` that strictly enforced API key presence on the client side.
  - The frontend now conditionally appends the `Authorization` header only if the user has provided a custom key, otherwise delegating authentication to the BFF backend.

## Phase 33: Visual Animation Builder
*Status: Complete*

- [x] **Task 33.1: Animation UI Panel**
  - Add a new section in `PropertyInspector.tsx` for Animations (Entrance, Hover, Scroll).
  - Support configuring animation type (fade, slide, scale), duration, and delay.

## Phase 34: Global Custom Code Injection
*Status: Complete*

- [x] **Task 34.1: Custom Code Modal UI**
  - Extend `ProjectSettingsModal.tsx` to include an "Advanced" tab or section for Custom Head Code and Custom Body Code.
  - Add textareas for injecting raw `<style>` and `<script>` tags.
- [x] **Task 34.2: Code Injection Logic**
  - Update `seo` state to include `customHead` and `customBody` fields.
  - Inject these fields into the `PreviewView` iframe HTML generation.

## Phase 35: Multi-page Architecture & Routing
*Status: Complete*

- [x] **Task 35.1: File Explorer UI**
  - Create a new sidebar panel for managing multiple HTML pages (e.g., `index.html`, `about.html`, `contact.html`).
  - Allow users to create, rename, and delete pages within the project.
- [x] **Task 35.2: Page Routing Logic**
  - Update `Workspace.tsx` to switch between active pages.
  - Ensure the Stage preview updates to reflect the currently selected HTML file.

## Phase 36: Cloud Integrations & Deployments
*Status: Pending*

- [ ] **Task 36.1: Vercel Integration BFF Route**
  - Implement `/api/deploy/vercel/:projectId` in the Node.js BFF to receive the Vercel Personal Access Token, package the project files into a Vercel-compatible format, and deploy using the Vercel REST API.
- [ ] **Task 36.2: Netlify Integration BFF Route**
  - Implement `/api/deploy/netlify/:projectId` in the Node.js BFF to receive the Netlify PAT, package the project files as a static site, and deploy using the Netlify REST API.
