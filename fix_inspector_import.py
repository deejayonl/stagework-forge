import re

with open('./src/components/PropertyInspector.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Sparkles } from 'lucide-react';", "import { Sparkles, Library } from 'lucide-react';")

with open('./src/components/PropertyInspector.tsx', 'w') as f:
    f.write(content)
