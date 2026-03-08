import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

# Fix the misplaced />
bad_html = """                      placeholder="e.g. 1fr 1fr or repeat(3, 1fr)"

                    <div className="flex gap-1 mt-1">"""

good_html = """                      placeholder="e.g. 1fr 1fr or repeat(3, 1fr)"
                    />
                    <div className="flex gap-1 mt-1">"""

content = content.replace(bad_html, good_html)
content = content.replace("""                    </div>
                    />
                  </div>""", """                    </div>
                  </div>""")

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
