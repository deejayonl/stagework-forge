import re

with open("server/src/services/project-store.ts", "r") as f:
    content = f.read()

content = content.replace(
    "customDomain?: string;",
    "customDomain?: string;\n  seo?: Record<string, string>;"
)

with open("server/src/services/project-store.ts", "w") as f:
    f.write(content)
