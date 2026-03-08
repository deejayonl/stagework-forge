import os

def replace_in_file(filepath, old_text, new_text):
    with open(filepath, 'r') as f:
        content = f.read()
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(filepath, 'w') as f:
            f.write(content)

base_dir = '/home/agent/workspace/projects/stagework-forge/src/'

files_to_fix = [
    ('routes/preview/PreviewView.tsx', "import.meta.env?.DEV ? 'http://localhost:3001/api/projects' : 'https://sgfbackend.deejay.onl/api/projects'", "'https://sgfbackend.deejay.onl/api/projects'"),
    ('routes/forge/ForgeView.tsx', "import.meta.env?.DEV ? 'http://localhost:3001/api/deploy' : 'https://sgfbackend.deejay.onl/api/deploy'", "'https://sgfbackend.deejay.onl/api/deploy'"),
    ('routes/forge/ForgeView.tsx', "import.meta.env?.DEV ? 'http://localhost:3001/api/export' : 'https://sgfbackend.deejay.onl/api/export'", "'https://sgfbackend.deejay.onl/api/export'"),
    ('components/ApiIntegrationsPanel.tsx', "import.meta.env?.DEV ? 'http://localhost:3001/api/proxy' : 'https://sgfbackend.deejay.onl/api/proxy'", "'https://sgfbackend.deejay.onl/api/proxy'"),
    ('components/DeployPanel.tsx', "import.meta.env?.DEV ? 'http://localhost:3001/api/deploy' : 'https://sgfbackend.deejay.onl/api/deploy'", "'https://sgfbackend.deejay.onl/api/deploy'"),
    ('hooks/useProjects.ts', "import.meta.env?.DEV ? 'http://localhost:3001/api/projects' : 'https://sgfbackend.deejay.onl/api/projects'", "'https://sgfbackend.deejay.onl/api/projects'"),
    ('services/geminiService.ts', "import.meta.env?.DEV ? 'http://localhost:3001/api/generate' : 'https://sgfbackend.deejay.onl/api/generate'", "'https://sgfbackend.deejay.onl/api/generate'"),
    ('services/geminiService.ts', "import.meta.env?.DEV ? 'http://localhost:3001/api/mutate' : 'https://sgfbackend.deejay.onl/api/mutate'", "'https://sgfbackend.deejay.onl/api/mutate'"),
    ('services/geminiService.ts', "import.meta.env?.DEV ? 'http://localhost:3001/api/autofix' : 'https://sgfbackend.deejay.onl/api/autofix'", "'https://sgfbackend.deejay.onl/api/autofix'"),
    ('services/geminiService.ts', "import.meta.env?.DEV ? 'http://localhost:3001/api/rewrite' : 'https://sgfbackend.deejay.onl/api/rewrite'", "'https://sgfbackend.deejay.onl/api/rewrite'")
]

for file_path, old, new in files_to_fix:
    full_path = os.path.join(base_dir, file_path)
    replace_in_file(full_path, old, new)
