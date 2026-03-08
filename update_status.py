import re

with open('STATUS.md', 'r') as f:
    content = f.read()

content = content.replace('- [ ] **Task 5.1: Verify API Routes**', '- [x] **Task 5.1: Verify API Routes**')

with open('STATUS.md', 'w') as f:
    f.write(content)
