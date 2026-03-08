import sys
import re

with open('server/src/index.ts', 'r') as f:
    content = f.read()

# Replace the URL parsing logic
old_logic = """  if (url.pathname !== '/sync') {
    ws.close(1008, 'Invalid path');
    return;
  }

  const projectId = url.searchParams.get('projectId');
  if (!projectId) {
    ws.close(1008, 'Project ID is required');
    return;
  }"""

new_logic = """  if (!url.pathname.startsWith('/sync/')) {
    ws.close(1008, 'Invalid path');
    return;
  }

  const projectId = url.pathname.replace('/sync/', '');
  if (!projectId) {
    ws.close(1008, 'Project ID is required');
    return;
  }"""

content = content.replace(old_logic, new_logic)

with open('server/src/index.ts', 'w') as f:
    f.write(content)

