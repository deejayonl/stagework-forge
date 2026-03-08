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
    ('routes/preview/PreviewView.tsx', "'/api/projects'", "'https://sgfbackend.deejay.onl/api/projects'"),
    ('routes/forge/ForgeView.tsx', "'/api/deploy'", "'https://sgfbackend.deejay.onl/api/deploy'"),
    ('routes/forge/ForgeView.tsx', "'/api/export'", "'https://sgfbackend.deejay.onl/api/export'"),
    ('components/ApiIntegrationsPanel.tsx', "'/api/proxy'", "'https://sgfbackend.deejay.onl/api/proxy'"),
    ('components/DeployPanel.tsx', "'/api/deploy'", "'https://sgfbackend.deejay.onl/api/deploy'"),
    ('hooks/useProjects.ts', "'/api/projects'", "'https://sgfbackend.deejay.onl/api/projects'")
]

for file_path, old, new in files_to_fix:
    full_path = os.path.join(base_dir, file_path)
    replace_in_file(full_path, old, new)
