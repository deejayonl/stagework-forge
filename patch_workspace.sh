sed -i '/const handleUpdateAttribute/i \
  const handleChangeTag = (newTag: string) => {\
    if (!selectedElement) return;\
    setSelectedElement((prev: any) => ({\
      ...prev,\
      tagName: newTag.toLowerCase()\
    }));\
    updateLocalHtml(selectedElement.path, (el) => {\
      const newEl = el.ownerDocument.createElement(newTag);\
      while (el.firstChild) {\
        newEl.appendChild(el.firstChild);\
      }\
      Array.from(el.attributes).forEach(attr => {\
        newEl.setAttribute(attr.name, attr.value);\
      });\
      el.replaceWith(newEl);\
    }, false, `Change tag to ${newTag}`);\
  };\
' src/components/Workspace.tsx
