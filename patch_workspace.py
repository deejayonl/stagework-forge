import re

with open('./src/components/Workspace.tsx', 'r') as f:
    content = f.read()

# Add handleInsertSkipLink before return statement
skip_link_func = """
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

  return (
"""

content = content.replace('  return (', skip_link_func, 1)

# Add onInsertSkipLink to PropertyInspector props
content = content.replace('onAutoFix={handleAutoFix}', 'onAutoFix={handleAutoFix}\n            onInsertSkipLink={handleInsertSkipLink}')

# Update handleUpdateStyle to include focus-visible
content = content.replace("['hover', 'focus', 'active']", "['hover', 'focus', 'active', 'focus-visible']")

with open('./src/components/Workspace.tsx', 'w') as f:
    f.write(content)
