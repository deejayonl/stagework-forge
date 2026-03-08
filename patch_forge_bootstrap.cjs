const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

// Insert bootstrapping logic right after `const [isDark, setIsDark] = useState(true);`
const insertPoint = code.indexOf('const [isDark, setIsDark] = useState(true);');

const bootstrapCode = `
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapProgress, setBootstrapProgress] = useState('');
  const [globalMode, setGlobalMode] = useState(true);

  useEffect(() => {
    if (initialWorkspaces && initialWorkspaces.length > 0 && projects.length === 0 && !isBootstrapping) {
      const activeWorkspace = initialWorkspaces[0];
      const blueprintNodes = activeWorkspace.nodes.filter(n => n.id.startsWith('blueprint-'));
      
      if (blueprintNodes.length > 0) {
        bootstrapBlueprints(blueprintNodes);
      }
    }
  }, [initialWorkspaces, projects.length]);

  const bootstrapBlueprints = async (nodes: any[]) => {
    setIsBootstrapping(true);
    setGlobalMode(true);
    for (const node of nodes) {
       setBootstrapProgress(\`Generating \${node.title}...\`);
       try {
           const prompt = \`Generate a complete frontend for this blueprint:\\n\${node.title}\\n\\n\${node.content}\`;
           const finalFiles = await generateCode(prompt, false, [], []);
           createProject(finalFiles, node.title);
       } catch (err) {
           console.error("Failed to bootstrap", node.title, err);
       }
    }
    setIsBootstrapping(false);
    startNewProject(); // Clear current project to enter global mode
  };
`;

code = code.substring(0, insertPoint) + bootstrapCode + '\n' + code.substring(insertPoint);

fs.writeFileSync(forgeViewPath, code);
