#!/bin/bash
sed -i 's/export default Workspace;/const Workspace = (props: WorkspaceProps) => (\n  <WorkspaceProvider initialState={{ files: props.files, status: "idle" }}>\n    <WorkspaceInner {...props} \/>\n  <\/WorkspaceProvider>\n);\n\nexport default Workspace;/' src/components/Workspace.tsx
