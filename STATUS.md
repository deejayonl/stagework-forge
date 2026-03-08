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

## Phase 5: Post-Launch & Polishing
*Status: Complete*

- [x] **Task 5.1: Review and Refine**
  - Verify all routing and transitions are smooth.
  - Review the BFF endpoints for error handling and edge cases.


## Phase 6: Project Persistence & Export
*Status: Complete*

- [x] **Task 6.1: BFF State Store**
  - Create a robust file-based JSON store in the BFF (`server/src/services/project-store.ts`) to save project states (Script, Blueprints, Mutations).
  - Add API routes: `GET /api/projects/:id` and `POST /api/projects` to load and save states.
- [x] **Task 6.2: Frontend State Sync**
  - Implement auto-saving in the frontend. When a user generates a script or mutates a stage, sync the project state to the BFF.
  - Add a "Save Project" / "Load Project" UI mechanism in the `WorkspaceLayout` or a settings modal.
- [x] **Task 6.3: Export to Code (ZIP)**
  - Create a BFF endpoint `GET /api/export/:id` that compiles the current project state into a valid React codebase and returns it as a ZIP file download.
  - Add an "Export Project" button to the Stage view.

## Phase 7: Advanced Studio Interactions (Drag & Drop)
*Status: Complete*

- [x] **Task 7.1: Image Asset Upload Support**
  - Allow users to drag-and-drop images onto the Studio Canvas.
  - Implement a visual dropzone indicator when dragging files over the canvas.
  - Base64 encode the dropped image and insert it as an "Image Node" into the canvas state.
- [x] **Task 7.2: Code Snippet Injection**
  - Allow users to paste or drop code files (.tsx, .css, .json) directly onto the canvas.
  - Render pasted code inside a syntax-highlighted "Code Node".
- [x] **Task 7.3: Node Grouping & Organization**
  - Implement a marquee selection tool (shift + drag) to select multiple nodes.
  - Add a "Group" button to combine selected nodes into a single movable block.

## Phase 8: NoCode Visual Editor Engine
*Status: Complete*

- [x] **Task 8.1: Component Property Inspector (Right Sidebar)**
  - Build a dynamic property panel that reads the selected node's schema.
  - Generate input fields for basic styling (text content, color, padding, margin).
- [x] **Task 8.2: Visual DOM Tree Explorer (Left Sidebar)**
  - Implement a hierarchical tree view of the generated components on the Stage.
  - Allow selection of elements from the tree to highlight them on the Stage.
- [x] **Task 8.3: Inline Text Editing**
  - Allow double-clicking any text element on the Stage to make it `contentEditable`.
  - Sync the mutated text back to the BFF state store.
- [x] **Task 8.4: Layout Controls (Flex/Grid)**
  - Add visual toggle buttons in the property inspector to switch between Flex and Grid layouts.
  - Include slider controls for gap, align-items, and justify-content.

## Phase 9: Advanced Editor Tools & Polish
*Status: Complete*

- [x] **Task 9.1: Component Duplication & Deletion**
  - Add keyboard shortcuts (Delete/Backspace to remove, Cmd+D to duplicate) for the selected element in the iframe.
  - Sync DOM structure mutations back to the BFF state store.
- [x] **Task 9.2: Asset Manager Integration**
  - Connect the ImageTool (Assets) panel directly to the Inspector. 
  - Allow users to select an image node and pick an uploaded asset to swap its `src`.
- [x] **Task 9.3: Undo/Redo Integration for Editor Mutations**
  - Ensure every style, text, and DOM change from the NoCode Editor pushes a new state to the `useProjects` history stack so `Cmd+Z` works seamlessly.
- [x] **Task 9.4: Responsive Breakpoint Toggles**
  - Add Desktop/Tablet/Mobile toggle buttons to the Stage toolbar to resize the iframe preview.
  - Apply media-query specific style updates when editing in different breakpoint views.

## Phase 10: Launch & Polish
*Status: Complete*

- [x] **Task 10.1: Empty State & Onboarding Polish**
  - Add a beautiful zero-state for new projects with starter templates (Landing Page, Dashboard, Portfolio).
  - Add tooltips to the NoCode Editor interface for new users.
- [x] **Task 10.2: Advanced Component Properties**
  - Add box-shadow, border-radius, and typography controls (font-family, font-weight) to the PropertyInspector.
  - Support background gradients and opacity sliders.
- [x] **Task 10.3: Live Collaboration Preparation**
  - Refactor the state layer to support CRDTs (Yjs) or WebSocket syncing for multiplayer editing.
  - Show live cursors of other users on the canvas.

## Phase 11: Component Library & Advanced AI Features
*Status: Complete*

- [x] **Task 11.1: Component Library Panel**
  - Add a "Components" tab to the left sidebar (alongside DOM Tree Explorer).
  - Populate with pre-built Tailwind UI components (Buttons, Cards, Navbars, Footers).
  - Enable drag-and-drop from the Component Library onto the Stage iframe.
- [x] **Task 11.2: AI Auto-Fix & Accessibility**
  - Add an "AI Magic Fix" button to the Property Inspector.
  - When clicked, send the selected node's HTML to the BFF to automatically fix contrast, padding, and layout issues, returning the optimized HTML.
- [x] **Task 11.3: Advanced Code Export**
  - Expand the BFF export endpoint to support Next.js (App Router) and Vite (React) templates.
  - Add an export configuration modal in the UI to select the target framework.

---

## Phase 12: Deployment & Hosting Integrations
*Status: Complete*

- [x] **Task 12.1: Vercel Integration**
  - Add a "Deploy to Vercel" button in the Export modal.
  - Create a BFF endpoint `/api/deploy/vercel` to package the project and use the Vercel API to deploy it.
- [x] **Task 12.2: GitHub Integration**
  - Add a "Push to GitHub" button in the Export modal.
  - Create a BFF endpoint `/api/deploy/github` to create a new repo and push the project code to it.
- [x] **Task 12.3: Custom Domains**
  - Add a "Custom Domain" section to the project settings.
  - Create a BFF endpoint to manage custom domains for deployed projects.

## Phase 13: Security & Performance Enhancements
*Status: Complete*

- [x] **Task 13.1: API Rate Limiting**
  - Implement a basic rate limiting middleware in the BFF to protect the `/api/generate` and `/api/mutate` endpoints from abuse.
- [x] **Task 13.2: Request Validation Schema**
  - Add request validation structure to ensure payload integrity on POST endpoints.
- [x] **Task 13.3: Global Error Boundary**
  - Implement a React Error Boundary in the frontend to gracefully catch unhandled exceptions and display a fallback UI instead of crashing the app.

## Phase 14: Animation & Interaction Engine
*Status: Completed*

- [x] **Task 14.1: CSS Animation Classes**
  - Add simple toggle classes in the Property Inspector for standard animations (fade-in, slide-up, pulse, bounce).
  - Apply these classes to the active node on the Stage.
- [x] **Task 14.2: Hover States**
  - Add a "Hover State" toggle in the Property Inspector.
  - When active, styling changes (colors, transforms) apply only to the `:hover` pseudo-class of the selected node.
- [x] **Task 14.3: Scroll Triggers (Intersection Observer)**
  - Allow users to mark a component as "Animate on Scroll".
  - Inject an Intersection Observer script into the exported code/BFF state to trigger animations when the element enters the viewport.

## Phase 15: Data Binding & Variables
*Status: Complete*

- [x] **Task 15.1: Global Variables Store**
  - Create a Variables panel in the left sidebar (alongside DOM Tree Explorer and Components).
  - Allow users to define key-value pairs (e.g., `theme.primaryColor`, `user.name`, `app.title`).
  - Store these variables in the project state store.
- [x] **Task 15.2: Variable Binding UI**
  - In the Property Inspector, allow text and attributes (like image `src`) to be bound to a variable instead of static text.
- [x] **Task 15.3: Dynamic List Rendering**
  - Allow a component to be marked as a "List" and bound to an array variable, repeating its children.

## Phase 16: Logic & Event Handlers
*Status: Complete*

- [x] **Task 16.1: Event Listener UI**
  - Add an "Events" tab or section to the Property Inspector.
  - Allow users to attach standard DOM events (`onClick`, `onChange`, `onSubmit`) to the selected element.
- [x] **Task 16.2: Action Builder**
  - For a selected event, allow the user to define an action (e.g., "Set Variable", "Toggle Class", "Alert").
  - Save these event-action definitions in the element's dataset (e.g., `data-on-click="setVariable:modalOpen:true"`).
- [x] **Task 16.3: Runtime Event Engine**
  - Update `injectEditorScript.ts` to attach live event listeners based on the `data-on-*` attributes.
  - Execute the defined actions (e.g., mutating the global variables store and triggering a re-render) when events occur.

## Phase 17: Conditional Rendering
*Status: Complete*

- [x] **Task 17.1: Conditional Visibility UI**
  - Add a "Visibility" section to the Property Inspector.
  - Allow users to bind an element's visibility to a boolean variable using a `data-if` attribute.
- [x] **Task 17.2: Runtime Condition Engine**
  - Update `injectEditorScript.ts` to evaluate `data-if` attributes.
  - Show or hide elements dynamically when the bound variable changes (e.g., `data-if="modalOpen"`).

## Phase 18: Custom Components & Reusability
*Status: Complete*

- [x] **Task 18.1: Save as Component**
  - Add a "Save as Component" button in the Property Inspector.
  - When clicked, extract the selected node's HTML, prompt for a name, and save it to a `components` object in the BFF state store.
- [x] **Task 18.2: Components Library Sidebar**
  - Create a new left sidebar tab/panel called "Components".
  - Display the list of saved custom components.
- [x] **Task 18.3: Drag & Drop Instances**
  - Allow users to drag a saved component from the sidebar onto the Stage.
  - Insert it as an instance (e.g., `<div data-component="Card">...</div>`).

## Phase 19: Global Settings & Theme Management
*Status: Complete*

- [x] **Task 19.1: Global Theme Editor**
  - Add a "Theme" tab to the left sidebar.
  - Allow users to define global primary, secondary, and accent colors.
  - Automatically update the Tailwind configuration in the `useProjects` state to reflect these colors across the generated app.
- [x] **Task 19.2: Custom Font Integration**
  - Allow users to select Google Fonts in the Theme Editor.
  - Inject the selected font links into the generated HTML `<head>` and update the global CSS font-family.
- [x] **Task 19.3: SEO & Meta Settings**
  - Add an SEO section to the project settings modal.
  - Allow users to configure the page title, meta description, and Open Graph image.

## Phase 20: Multi-Page Application (Routing) Support
*Status: Complete*

- [x] **Task 20.1: Pages Manager Sidebar Panel**
  - Create a new "Pages" tab in the left sidebar.
  - Display a list of pages for the current project (defaulting to "Home").
  - Allow users to add, rename, and delete pages.
- [x] **Task 20.2: Page State Management**
  - Update `useProjects.ts` to support multiple pages within a single project state.
  - Ensure the Stage iframe updates to reflect the currently selected page.
- [x] **Task 20.3: Internal Link Binding**
  - Add a "Link" property to the Property Inspector for button and text nodes.
  - Allow users to select an internal page from a dropdown to set up routing navigation.

## Phase 21: Data Modeling & Collections (CMS)
*Status: Complete*

- [x] **Task 21.1: Data Collections Sidebar Panel**
  - Create a new "Database" or "CMS" tab in the left sidebar.
  - Allow users to create Collections (e.g., "Users", "Posts", "Products").
  - Allow users to define fields for each collection (Text, Number, Boolean, Image, Date).
- [x] **Task 21.2: BFF Schema Generation & Storage**
  - Create BFF endpoints (`/api/collections/:projectId`) to save and retrieve the database schemas.
  - Store the mock data for these collections in the project's state.
- [x] **Task 21.3: Data Binding to UI Components**
  - Update the Property Inspector to allow binding a component (like a List or Grid) to a specific Collection.
  - Map UI element fields (e.g., Image `src`, Text `content`) to the Collection's fields.

## Phase 22: External API Integration
*Status: Complete*

- [x] **Task 22.1: API Integrations Sidebar Panel**
  - Create a new "APIs" tab in the left sidebar.
  - Allow users to define external REST endpoints (URL, Method, Headers, Body).
- [x] **Task 22.2: BFF Proxy Endpoints**
  - Create a secure proxy in the BFF (`/api/proxy/:projectId`) to forward requests and avoid CORS issues for the generated app.
- [x] **Task 22.3: API Data Binding**
  - Update the Property Inspector and Data Binding UI to allow mapping API responses to UI elements (Lists, Text, Images).

## Phase 23: Application Deployment
*Status: Complete*

- [x] **Task 23.1: Deployment Provider Integration**
  - Add a "Deploy" tab in the left sidebar.
  - Allow users to configure deployment settings (e.g., Vercel or Netlify tokens).
- [x] **Task 23.2: 1-Click Deploy**
  - Implement a BFF endpoint that bundles the project (like the Export ZIP) and pushes it to the configured deployment provider.

## Phase 24: Context Menus & Advanced DOM Tree
*Status: Complete*

- [x] **Task 24.1: Stage Context Menu**
  - Implement a custom right-click context menu within the Stage iframe (`injectEditorScript.ts` and `StageView.tsx` or similar).
  - Include options: Duplicate, Delete, Copy HTML, Paste HTML, Save as Component.
- [x] **Task 24.2: DOM Tree Drag & Drop**
  - Add drag-and-drop support to the `DOMTreeExplorer` to allow reordering elements and changing parent-child relationships visually.
- [x] **Task 24.3: History Visualizer**
  - Add a "History" tab to the left sidebar to display the stack of mutations (Undo/Redo steps), allowing users to jump back to a specific state.

## Phase 25: Form Builder & Input Elements
*Status: Complete*

- [x] **Task 25.1: Form Element Support in Editor**
  - Add support for specific form elements in the property inspector (Input, Textarea, Select, Checkbox, Radio, Button).
  - Add properties for `placeholder`, `required`, `name`, `value`, and `type` (text, email, password, etc.).
- [x] **Task 25.2: Form Submission Handling**
  - Add a "Form Action" property to Form containers to define submission behavior (e.g., API call, Email, Custom Logic).
- [x] **Task 25.3: Input Validation UI**
  - Add visual cues for validation states (e.g., required fields, pattern matching) in the editor and properties for custom error messages.

## Phase 26: Final Polish & Deployment Trigger
*Status: Complete*

- [x] **Task 26.1: Trigger Final Deploy**
  - Update STATUS.md to indicate all phases are complete and trigger the final deployment script.

## Phase 27: Post-Deploy Verification
*Status: Complete*

- [x] **Task 27.1: Live Sanity Check**
  - Verify the deployed Thin Shell UI and BFF are communicating correctly in production.


## Phase 28: AI Content Generation & Asset Management
*Status: Complete*

- [x] **Task 28.1: AI Text Rewriter**
  - Implement a BFF endpoint `/api/rewrite` to handle tone/style adjustments for text elements.
  - Add a "Rewrite with AI" button next to text inputs in the Property Inspector.
- [x] **Task 28.2: AI Image Generation**
  - Implement a BFF endpoint `/api/generate-image` that calls the Gemini image model to generate base64/URL images.
  - Add a "Generate Image" tab to the `ImageTool.tsx` panel.
- [x] **Task 28.3: Asset Library Persistence**
  - Automatically save generated and uploaded images to the BFF project store.

## Phase 29: Dynamic Data Binding & Logic
*Status: Complete*

- [x] **Task 29.1: Variable Data Binding**
  - Allow text content and image URLs to be bound to project variables (e.g., `{{ myVar }}`).
  - Add a variable picker in the Property Inspector next to text/image inputs.
- [x] **Task 29.2: Conditional Rendering (Show/Hide)**
  - Add a "Visibility" section to the Property Inspector.
  - Allow binding visibility to a boolean variable or condition (e.g., `myVar === true`).
- [x] **Task 29.3: List Rendering (Repeater)**
  - Add a "Repeater" toggle to container nodes.
  - Allow binding the container to a collection/array, repeating its children for each item.

## Phase 30: Advanced Interactions & Animations
*Status: Complete*

- [x] **Task 30.1: Event Triggers (onClick)**
  - Add an "Interactions" tab to the Property Inspector.
  - Allow users to define an `onClick` event trigger for any selected node.
- [x] **Task 30.2: Action Definitions**
  - Implement a basic action payload structure (e.g., `{ type: 'NAVIGATE', target: 'page2' }` or `{ type: 'SET_VARIABLE', key: 'isOpen', value: true }`).
  - Wire up the `onClick` handler in `StageView.tsx` to execute these actions.
- [x] **Task 30.3: Basic CSS Transitions**
  - Add a "Transitions" section to the Style tab in the Property Inspector.
  - Allow setting `transition` properties (duration, easing) on elements.

## Phase 31: Theming & Global Styles
*Status: Complete*

- [x] **Task 31.1: Global Theme Variables**
  - Add a "Theme" panel to manage global CSS variables (colors, fonts, spacing).
  - Inject these variables into the canvas `<iframe>` root.
- [x] **Task 31.2: Typography Management**
  - Allow adding custom Google Fonts to the project.
  - Automatically inject `<link href="...fonts.googleapis...">` into the generated HTML `<head>`.
- [x] **Task 31.3: Component Library (Symbols)**
  - Allow saving a selected node as a reusable "Component".
  - Add a "Components" tab to drag-and-drop saved symbols back onto the canvas.

## Phase 32: Undo/Redo System & History
*Status: Complete*

- [x] **Task 32.1: History Stack Implementation**
  - Create a state management slice or context for an undo/redo stack.
  - Push a snapshot of the `files` array (or just the active HTML) onto the stack before any mutation (style change, text edit, drag/drop).
- [x] **Task 32.2: Undo/Redo Controls**
  - Add Undo (`Ctrl+Z`) and Redo (`Ctrl+Shift+Z`) keyboard shortcuts.
  - Add visual undo/redo buttons to the Workspace toolbar.
- [x] **Task 32.3: State Restoration**
  - Implement functions to pop from the stack and restore the `files` state, triggering a re-render of the canvas.

## Phase 33: Context Menu Enhancements & Copy/Paste
*Status: Complete*

- [x] **Task 33.1: Context Menu Polish**
  - Add more actions to the right-click context menu (e.g., Wrap in Container, Extract as Component).
- [x] **Task 33.2: Copy/Paste Across Elements**
  - Implement Copy/Paste of elements via Context Menu.
  - Add `Ctrl+C` and `Ctrl+V` keyboard shortcuts for copying and pasting selected elements.
- [x] **Task 33.3: Copy/Paste Styles**
  - Add "Copy Styles" and "Paste Styles" options to Context Menu.

## Phase 34: Advanced DOM Tree & Drag-and-Drop
*Status: Complete*

- [x] **Task 34.1: DOM Tree Refactoring**
  - Make DOM tree items collapsible/expandable.
  - Show visual indicators for element types (e.g., icons for div, span, img).
- [x] **Task 34.2: Drag-and-Drop in DOM Tree**
  - Allow dragging nodes within the DOM tree panel to reorder them or move them inside other elements.
- [x] **Task 34.3: DOM Tree Highlighting**
  - Hovering over a node in the DOM tree should highlight the corresponding element on the canvas.
## Phase 35: Media Manager & Asset Uploading
*Status: Complete*

- [x] **Task 35.1: Media Manager Component**
  - Create a new `MediaManager` UI panel to view uploaded assets.
- [x] **Task 35.2: Image Upload Handling**
  - Allow users to upload images (drag-and-drop or file select).
  - Store assets locally using `FileReader` (Base64) or `URL.createObjectURL` for the preview session.
- [x] **Task 35.3: Asset Integration**
  - Allow inserting uploaded images directly onto the canvas or as background images.
## Phase 36: Mobile Live Preview & Sync Enhancements
*Status: Complete*

- [x] **Task 36.1: QR Code Generation**
  - Add a QR code button to the Stage view header.
  - Generate a QR code pointing to a live preview URL (e.g., `/preview/:projectId`) so users can scan and view the active project on their mobile device.
- [x] **Task 36.2: WebSocket Live Sync (Preview)**
  - Implement a WebSocket connection in the BFF to push live DOM/style mutations from the main editor directly to any connected mobile preview clients.
- [x] **Task 36.3: Mobile Device Frame Wrap**
  - In the Stage view, when the "Mobile" breakpoint is selected, wrap the iframe in a visually distinct, realistic mobile device frame (e.g., an iPhone bezel) for better presentation.

## Phase 37: External AI Models Config
*Status: Complete*

- [x] **Task 37.1: Anthropic & OpenAI Integration**
  - Add Claude 3.5 Sonnet and GPT-4o configurations to `CloudConfig` component.
  - Plumb selected model through to the `generateCode` service.
- [x] **Task 37.2: Custom API Key Storage**
  - Save external API keys to `localStorage` securely.


## Phase 38: CI/CD Deployment Trigger
*Status: Complete*

- [x] **Task 38.1: Trigger Final Deploy**
  - Verify all 37 phases are complete.
  - Commit to trigger the 5-commit auto-deploy cycle.

## Phase 39: App Monitoring & Telemetry
*Status: Complete*

- [x] **Task 39.1: Health Check Endpoints**
  - Verify `/api/health` endpoint is responding properly for the BFF.
  - Commit to continue the CI/CD deploy cycle.

## Phase 40: Advanced CSS Grid Controls
*Status: Complete*

- [x] **Task 40.1: Grid Template Builder UI**
  - Add visual inputs in PropertyInspector for `grid-template-columns` and `grid-template-rows`.
- [x] **Task 40.2: Grid Item Controls**
  - Add inputs for `grid-column` and `grid-row` to allow elements to span multiple tracks.
- [x] **Task 40.3: Grid Gap Linking**
  - Add independent row-gap and column-gap controls.

## Phase 41: Advanced Background & Overlay Controls
*Status: Complete*

- [x] **Task 41.1: Background Image Adjustments**
  - Add inputs for `background-size` (cover, contain), `background-position`, and `background-repeat` in PropertyInspector.
- [x] **Task 41.2: Backdrop Filters (Blur)**
  - Add a slider for `backdrop-filter: blur()` to create glassmorphism effects.
- [x] **Task 41.3: Box Shadow Builder**
  - Enhance the existing box-shadow dropdown with custom inputs for X, Y, Blur, Spread, and Color.

## Phase 42: Text Shadow & Typography Enhancements
*Status: Complete*

- [x] **Task 42.1: Text Shadow Controls**
  - Add inputs for `text-shadow` in the PropertyInspector (X, Y, Blur, Color).
- [x] **Task 42.2: Line Height & Letter Spacing**
  - Add sliders/inputs for `line-height` and `letter-spacing` to improve typography control.
- [x] **Task 42.3: Text Transform & Decoration**
  - Add toggles for `text-transform` (uppercase, lowercase, capitalize) and `text-decoration` (underline, line-through).

## Phase 43: Advanced Layout & Positioning Controls
*Status: Complete*

- [x] **Task 43.1: Position Type & Z-Index**
  - Add a dropdown for `position` (static, relative, absolute, fixed, sticky) and an input for `z-index`.
- [x] **Task 43.2: Directional Offsets**
  - Add inputs for `top`, `right`, `bottom`, and `left` properties (only show when position is not static).
- [x] **Task 43.3: Overflow Controls**
  - Add toggles/dropdowns for `overflow-x` and `overflow-y` (visible, hidden, scroll, auto).

## Phase 44: Transform & Transition Controls
*Status: Complete*

- [x] **Task 44.1: Transform Scale & Rotate**
  - Add inputs for `scale` (X and Y) and `rotate` (degrees) to `PropertyInspector.tsx`.
- [x] **Task 44.2: Transform Translate**
  - Add inputs for `translate` (X and Y).
- [x] **Task 44.3: Custom Transition Settings**
  - Add inputs for `transition-duration` and `transition-timing-function` (ease, linear, ease-in, ease-out, ease-in-out).
## Phase 45: Advanced Customizations & Animations
*Status: Complete*

- [x] **Task 45.1: CSS Filters**
  - Add input for `filter` (blur, brightness, contrast, grayscale, etc.) in the Effects & Borders section.
- [x] **Task 45.2: Mix Blend Mode**
  - Add a dropdown for `mix-blend-mode` (normal, multiply, screen, overlay, darken, lighten, etc.).
- [x] **Task 45.3: Custom Tailwind Classes Input**
  - Add a raw text area field to allow power users to append or edit custom utility classes directly to the element's `className`.
## Phase 46: Flex & Grid Item Controls
*Status: Complete*

- [x] **Task 46.1: Flex Sizing**
  - Add inputs for `flex-grow`, `flex-shrink`, and `flex-basis` in the Layout section.
- [x] **Task 46.2: Alignment Overrides**
  - Add dropdowns for `align-self` and `justify-self`.
- [x] **Task 46.3: Item Ordering**
  - Add an input for `order` to control the visual order of flex/grid items.
## Phase 47: Image & Interaction Polish
*Status: Complete*

- [x] **Task 47.1: Object Fit & Position**
  - Add dropdowns for `object-fit` and `object-position` (useful for `<img>` and `<video>` tags).
- [x] **Task 47.2: Opacity & Cursor Controls**
  - Add a slider/input for `opacity` (0 to 1).
  - Add a dropdown for `cursor` (auto, pointer, not-allowed, grab, etc.).
- [x] **Task 47.3: Pointer Events**
  - Add a toggle for `pointer-events` (auto, none) to control interaction flow.