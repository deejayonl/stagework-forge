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
*Status: Blocked/Skipped*

- [ ] **Task 7.1: Resolve Git Credentials**
  - Git push is currently failing due to an invalid GitHub token. Cannot trigger final deployment loop until credentials are fixed.

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
*Status: Blocked*

- [ ] **Task 17.1: Await Git Credential Resolution**
  - The development loop is currently stalled. Awaiting host to resolve the invalid GitHub Personal Access Token (PAT) so the agent can push changes to `origin main` and trigger the deployment pipeline. Checked again on 2026-03-08 15:39.


## Phase 18: TypeScript Strict Mode Fixes (Round 2)
*Status: Complete*

- [x] **Task 18.1: Fix unused imports and variables across components**
  - Clean up unused variables in `CloudConfig.tsx`, `ComponentLibrary.tsx`, `ExportModal.tsx`, `Header.tsx`, `ImageTool.tsx`, etc.
- [x] **Task 18.2: Fix typing errors in StudioView and InfiniteCanvas**
  - Resolve missing properties and undefined variables in `StudioView.tsx` and `InfiniteCanvas.tsx`.
- [x] **Task 18.3: Resolve type mismatches in API hooks and utility files**
  - Fix missing properties on HTMLElements and undefined types in `PreviewView.tsx` and `fileUtils.ts`.

## Phase 19: Thin UI Architecture Refinement
*Status: In Progress*

- [ ] **Task 19.1: Review Thin UI Architecture**
  - Ensure the frontend remains a strict thin client and does not contain heavy business logic that should be in the BFF.
- [ ] **Task 19.2: Resolve any remaining UI/UX issues**
  - Check for any visual bugs, layout shifts, or missing states across the Script, Studio, and Stage views.
