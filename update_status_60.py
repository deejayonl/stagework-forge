with open("STATUS.md", "r") as f:
    content = f.read()

content = content.replace("- [ ] **Task 60.1", "- [x] **Task 60.1")
content = content.replace("- [ ] **Task 60.2", "- [x] **Task 60.2")

content = content.replace("## Phase 60: Stage View Global Input Polish\n*Status: In Progress*", "## Phase 60: Stage View Global Input Polish\n*Status: Complete*")

with open("STATUS.md", "w") as f:
    f.write(content)
