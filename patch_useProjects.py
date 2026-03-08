import sys

with open('src/hooks/useProjects.ts', 'r') as f:
    content = f.read()

content = content.replace("'wss://demos.yjs.dev', `forge-project-${currentProjectId}`", "`wss://sgfbackend.deejay.onl/sync?projectId=${currentProjectId}`, `${currentProjectId}`")

with open('src/hooks/useProjects.ts', 'w') as f:
    f.write(content)

