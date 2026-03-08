import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

# Add onInsertSkipLink to props
content = content.replace('onAutoFix?: (html: string) => void;', 'onAutoFix?: (html: string) => void;\n  onInsertSkipLink?: () => void;')
content = content.replace('onAutoFix,', 'onAutoFix,\n  onInsertSkipLink,')

# Add focus-visible to state toggles
content = content.replace("['none', 'hover', 'focus', 'active']", "['none', 'hover', 'focus', 'focus-visible', 'active']")

# Add "Insert Skip Link" button in Accessibility section
skip_link_btn = """
          <div className="flex items-center gap-2">
            <button
              onClick={onInsertSkipLink}
              className="w-full bg-hall-100 hover:bg-hall-200 dark:bg-hall-900 dark:hover:bg-hall-800 text-hall-900 dark:text-ink text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 border border-hall-200 dark:border-hall-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
              Insert Skip Link
            </button>
          </div>
"""

content = content.replace('          <div className="flex items-center gap-2">', skip_link_btn + '\n          <div className="flex items-center gap-2">', 1)

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
