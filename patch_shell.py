import sys

with open("src/pkg/tools/shell.go", "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "if t.restrictToWorkspace {" in line:
        start_idx = i
    if "return \"\"" in line and start_idx != -1 and i > start_idx + 60:
        # The end of guardCommand
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    new_code = """	if t.restrictToWorkspace {
		baseWorkspace := filepath.Clean(t.workingDir)

		parser := syntax.NewParser()
		f, err := parser.Parse(strings.NewReader(cmd), "")
		if err != nil {
			return fmt.Sprintf("Command blocked by safety guard (syntax error: %v)", err)
		}

		cfg := &expand.Config{
			Env: expand.ListEnviron(append(os.Environ(), "IFS= \t\n")...),
		}

		var hasForbidden bool
		syntax.Walk(f, func(node syntax.Node) bool {
			switch node.(type) {
			case *syntax.CmdSubst, *syntax.ParamExp, *syntax.ArithmExp, *syntax.ProcSubst, *syntax.ExtGlob:
				hasForbidden = true
				return false
			}
			return true
		})

		if hasForbidden {
			return "Command blocked by safety guard (forbidden shell expansion or substitution)"
		}

		_, err = evaluatePath(f, cwd, baseWorkspace, cfg)
		if err != nil {
			return fmt.Sprintf("Command blocked by safety guard (%v)", err)
		}
	}
"""
    with open("src/pkg/tools/shell.go", "w") as f:
        f.writelines(lines[:start_idx])
        f.write(new_code)
        f.writelines(lines[end_idx:])
    print("Patched successfully")
else:
    print(f"Failed to find indices. start={start_idx}, end={end_idx}")
