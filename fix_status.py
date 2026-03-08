import re

with open('STATUS.md', 'r') as f:
    text = f.read()

text = text.replace('- [x] **Task 52.2: ARIA Roles - [ ] **Task 52.2: ARIA Roles & Attributes** Attributes**', '- [x] **Task 52.2: ARIA Roles & Attributes**')
text = text.replace('- [x] **Task 52.3: Tab Index - [ ] **Task 52.3: Tab Index & SEO Alt Tags** SEO Alt Tags**', '- [x] **Task 52.3: Tab Index & SEO Alt Tags**')

with open('STATUS.md', 'w') as f:
    f.write(text)
