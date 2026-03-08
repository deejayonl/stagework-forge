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
*Status: Pending*

- [x] **Task 5.1: Verify API Routes**
  - Ensure that the application correctly hits `https://sgfbackend.deejay.onl/api/generate` and `https://sgfbackend.deejay.onl/api/mutate`.
  - Validate that the responses are correctly parsed and rendered in the Studio and Stage tabs.
- [x] **Task 5.2: Verify State Transitions**
  - Test the flow from Script -> Studio -> Stage to ensure loading screens and routing work as expected.
