import re

with open('./src/components/Workspace.tsx', 'r') as f:
    content = f.read()

# First, remove the bad insertion
bad_code = """  const handleInsertSkipLink = () => {
    updateLocalHtml([], (body) => {
      if (body.querySelector('.forge-skip-link')) return;

      const skipLink = body.ownerDocument.createElement('a');
      skipLink.className = 'forge-skip-link sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0';
      skipLink.href = '#main';
      skipLink.textContent = 'Skip to Main Content';
      skipLink.tabIndex = 0;
      
      body.insertBefore(skipLink, body.firstChild);
    }, false, 'Insert Skip Link');

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FORGE_RELOAD' }, '*');
    }
  };

  return ("""

content = content.replace(bad_code, "  return (")

# Now add it right before `return (` at line 854 (which is after `if (!localFiles || localFiles.length === 0) { ... }`)
good_code = """
  const handleInsertSkipLink = () => {
    updateLocalHtml([], (body) => {
      if (body.querySelector('.forge-skip-link')) return;

      const skipLink = body.ownerDocument.createElement('a');
      skipLink.className = 'forge-skip-link sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:top-0 focus:left-0';
      skipLink.href = '#main';
      skipLink.textContent = 'Skip to Main Content';
      skipLink.tabIndex = 0;
      
      body.insertBefore(skipLink, body.firstChild);
    }, false, 'Insert Skip Link');

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FORGE_RELOAD' }, '*');
    }
  };

  return ("""

# Replace the specific return
content = content.replace("  }\n\n  return (", "  }\n" + good_code)

with open('./src/components/Workspace.tsx', 'w') as f:
    f.write(content)
