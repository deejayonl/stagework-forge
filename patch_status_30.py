import sys

with open('STATUS.md', 'r') as f:
    content = f.read()

new_phase = """## Phase 30: Live Sync & Collaboration Architecture
*Status: Complete*

- [x] **Task 30.1: Migrate Yjs WebSocket Provider**
  - Switch `useProjects.ts` from the demo server (`wss://demos.yjs.dev`) to the custom BFF WebSocket route (`wss://sgfbackend.deejay.onl/sync`).
- [x] **Task 30.2: Configure BFF WebSocket Server**
  - Update `server/src/index.ts` to properly handle WebSocket connections on `/sync/:projectId`.
  - Implement broadcasting of binary Yjs messages to all connected clients for a specific project.
"""

content += "\n" + new_phase

with open('STATUS.md', 'w') as f:
    f.write(content)

