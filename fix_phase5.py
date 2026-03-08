with open('STATUS.md', 'r') as f:
    content = f.read()

content = content.replace('## Phase 5: End-to-End Verification\n*Status: Pending*', '## Phase 5: End-to-End Verification\n*Status: Complete*')

with open('STATUS.md', 'w') as f:
    f.write(content)
