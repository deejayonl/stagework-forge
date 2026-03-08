import re

with open('./src/utils/injectEditorScript.ts', 'r') as f:
    content = f.read()

content = content.replace("c.startsWith(`forge-${state}-`)", "c.startsWith('forge-' + state + '-')")
content = content.replace("`forge-${state}-`", "'forge-' + state + '-'")
content = content.replace("`forge-${state}-styles`", "'forge-' + state + '-styles'")

with open('./src/utils/injectEditorScript.ts', 'w') as f:
    f.write(content)
