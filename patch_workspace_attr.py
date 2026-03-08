import re

with open('./src/components/Workspace.tsx', 'r') as f:
    content = f.read()

attr_logic = """
  const handleUpdateAttribute = (attr: string, value: string) => {
    if (!selectedElement) return;

    setSelectedElement((prev: any) => ({
      ...prev,
      dataset: {
        ...prev.dataset,
        [attr]: value
      }
    }));

    updateLocalHtml(selectedElement.path, (el) => {
      if (value) {
        el.setAttribute(attr, value);
        
        if (attr === 'data-keyframes') {
          const doc = el.ownerDocument;
          let styleBlock = doc.getElementById(`forge-keyframes-${selectedElement.id}`);
          if (!styleBlock) {
            styleBlock = doc.createElement('style');
            styleBlock.id = `forge-keyframes-${selectedElement.id}`;
            doc.head.appendChild(styleBlock);
          }
          styleBlock.textContent = value;
        }
      } else {
        el.removeAttribute(attr);
        
        if (attr === 'data-keyframes') {
          const doc = el.ownerDocument;
          const styleBlock = doc.getElementById(`forge-keyframes-${selectedElement.id}`);
          if (styleBlock) styleBlock.remove();
        }
      }
    }, false, `Update attribute ${attr}`);

    const iframe = document.querySelector('iframe[title="Preview"]') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'FORGE_RELOAD' }, '*');
    }
  };
"""

# Replace the existing handleUpdateAttribute
old_attr_func = """  const handleUpdateAttribute = (attr: string, value: string) => {
    if (!selectedElement) return;

    setSelectedElement((prev: any) => ({
      ...prev,
      dataset: {
        ...prev.dataset,
        [attr]: value
      }
    }));

    updateLocalHtml(selectedElement.path, (el) => {
      if (value) {
        el.setAttribute(attr, value);
      } else {
        el.removeAttribute(attr);
      }
    }, false, `Update attribute ${attr}`);
  };"""

content = content.replace(old_attr_func, attr_logic)

with open('./src/components/Workspace.tsx', 'w') as f:
    f.write(content)
