package main

import (
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"
)

func main() {
	dir := "/home/agent/workspace/projects/stagework-forge/src/components"
	files := []string{
		"CloudConfig.tsx",
		"Header.tsx",
		"ImageTool.tsx",
		"ProjectSidebar.tsx",
		"PromptInput.tsx",
		"Workspace.tsx",
		"CodeEditor.tsx",
	}

	for _, name := range files {
		file := filepath.Join(dir, name)
		content, err := ioutil.ReadFile(file)
		if err != nil {
			fmt.Println("Error reading:", file)
			continue
		}

		text := string(content)
		text = strings.ReplaceAll(text, "zinc-", "hall-")
		text = strings.ReplaceAll(text, "emerald-", "accent-")
		text = strings.ReplaceAll(text, "dark:", "")
		text = strings.ReplaceAll(text, "bg-white", "bg-hall-950")
		text = strings.ReplaceAll(text, "text-white", "text-ink")
		text = strings.ReplaceAll(text, "text-black", "text-hall-950")

		err = ioutil.WriteFile(file, []byte(text), 0644)
		if err != nil {
			fmt.Println("Error writing:", file)
		} else {
			fmt.Println("Updated:", file)
		}
	}
}
