import sys

with open('src/components/PropertyInspector.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "const [activeState, setActiveState] = useState<string>('none');" in line:
        start_idx = i
        break

if start_idx != -1:
    block = """  const [activeState, setActiveState] = useState<string>('none');
"""
    lines[start_idx] = block
    print("Found activeState")

# We need to add focus-visible to activeState options
options_idx = -1
for i, line in enumerate(lines):
    if "<option value=\"none\">Normal</option>" in line:
        options_idx = i
        break

if options_idx != -1:
    block = """                <option value="none">Normal</option>
                <option value="hover">Hover</option>
                <option value="focus">Focus</option>
                <option value="focus-visible">Focus Visible</option>
                <option value="active">Active</option>
"""
    # Replace the options block
    lines[options_idx:options_idx+4] = [block]
    with open('src/components/PropertyInspector.tsx', 'w') as f:
        f.writelines(lines)
    print("Inserted focus-visible option successfully")
else:
    print("Could not find options point")
