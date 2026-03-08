import re

with open('STATUS.md', 'r') as f:
    content = f.read()

content = content.replace('- [ ] **Task 5.2: Verify State Transitions**', '- [x] **Task 5.2: Verify State Transitions**')

with open('STATUS.md', 'w') as f:
    f.write(content)
