import re

with open('STATUS.md', 'r') as f:
    content = f.read()

old_phase = """## Phase 61: Advanced Animation & Keyframes
*Status: Pending*

- [ ] **Task 61.1: Animation Duration & Delay**
  - Add specific inputs for `animation-duration` and `animation-delay` in the Property Inspector.
- [ ] **Task 61.2: Keyframe Builder UI**
  - Allow users to define custom CSS keyframes (from/to or percentages) and bind them to the selected element via `animation-name`.
- [ ] **Task 61.3: Easing Curves (Cubic Bezier)**
  - Add a dropdown for standard easing curves and an input for custom `cubic-bezier` values for `animation-timing-function`.
"""

new_phase = """## Phase 61: Advanced Animation & Keyframes
*Status: Complete*

- [x] **Task 61.1: Animation Duration & Delay**
  - Add specific inputs for `animation-duration` and `animation-delay` in the Property Inspector.
- [x] **Task 61.2: Keyframe Builder UI**
  - Allow users to define custom CSS keyframes (from/to or percentages) and bind them to the selected element via `animation-name`.
- [x] **Task 61.3: Easing Curves (Cubic Bezier)**
  - Add a dropdown for standard easing curves and an input for custom `cubic-bezier` values for `animation-timing-function`.
"""

content = content.replace(old_phase, new_phase)

with open('STATUS.md', 'w') as f:
    f.write(content)
