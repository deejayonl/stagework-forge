import sys

with open('STATUS.md', 'r') as f:
    content = f.read()

content = content.replace("## Phase 30: Live Sync & Collaboration Architecture\n*Status: Complete*", "## Phase 30: Live Sync & Collaboration Architecture\n*Status: Complete*")

new_phase = """\n## Phase 31: Host Intervention Required
*Status: Pending*

- [ ] **Task 31.1: Resolve Git Credentials**
  - Git push is failing due to an invalid GitHub token or missing upstream branch configuration. 
  - The development loop is stalled until the host resolves the authentication issue.
"""

content += new_phase

with open('STATUS.md', 'w') as f:
    f.write(content)

