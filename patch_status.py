import re

with open('STATUS.md', 'r') as f:
    content = f.read()

# Replace the old Phase 60 with the blocked status
new_phase_60 = """## Phase 60: Keyboard Accessibility & Focus Outlines
*Status: BLOCKED (Git Push Failure)*

- [ ] **Task 60.1: Focus Ring Customization** (ACTIVE - BLOCKED)
  - Add inputs to control `outline-color`, `outline-width`, and `outline-offset` specifically for the `:focus-visible` pseudo-class.
  - *Blocker:* Git push is failing due to invalid credentials. Cannot trigger the 5-commit auto-deploy cycle. Waiting for operator to manually push.
- [ ] **Task 60.2: Outline Style Toggles**
  - Add a dropdown to set `outline-style` (solid, dashed, dotted, none).
- [ ] **Task 60.3: Skip Links Support**
  - Allow users to easily add a "Skip to Main Content" visually hidden link that becomes visible on focus, managing `tabindex` and absolute positioning dynamically.
"""

content = re.sub(r"## Phase 60: Keyboard Accessibility & Focus Outlines\n\*Status: In Progress\*\n\n- \[ \] \*\*Task 60\.1: Focus Ring Customization\*\*\n  - Add inputs to control `outline-color`, `outline-width`, and `outline-offset` specifically for the `:focus-visible` pseudo-class\.\n- \[ \] \*\*Task 60\.2: Outline Style Toggles\*\*\n  - Add a dropdown to set `outline-style` \(solid, dashed, dotted, none\)\.\n- \[ \] \*\*Task 60\.3: Skip Links Support\*\*\n  - Allow users to easily add a \"Skip to Main Content\" visually hidden link that becomes visible on focus, managing `tabindex` and absolute positioning dynamically\.", new_phase_60, content)

with open('STATUS.md', 'w') as f:
    f.write(content)
