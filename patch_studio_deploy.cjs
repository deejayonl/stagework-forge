const fs = require('fs');

const file = 'src/routes/studio/StudioView.tsx';
let content = fs.readFileSync(file, 'utf8');

const loaderCode = `
const DEPLOY_LOGS = [
  "> Dusting off drums...",
  "> Rigging stage lights...",
  "> Booting feedback loops..."
];

function DeployLoader() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev < DEPLOY_LOGS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-green-400 font-mono p-8 absolute inset-0 z-[100]">
      <div className="max-w-2xl w-full bg-gray-900/80 border border-gray-800 rounded-xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
          <i className="fa-solid fa-terminal text-gray-500"></i>
          <span className="text-gray-400 text-sm tracking-wider">STAGE.DEPLOYER</span>
        </div>
        <div className="space-y-3 min-h-[120px]">
          {DEPLOY_LOGS.slice(0, logIndex + 1).map((log, i) => (
            <div key={i} className="flex items-center gap-3 text-sm md:text-base">
              <span className="text-amber-500">{log.split(' ')[0]}</span>
              <span className="text-gray-300">{log.split(' ').slice(1).join(' ')}</span>
              {i === logIndex && (
                <span className="w-2 h-4 bg-green-400 animate-pulse inline-block ml-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudioView() {
`;

content = content.replace('export default function StudioView() {', loaderCode);

// Inject state
const stateCode = `  const [isDeploying, setIsDeploying] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);`;
content = content.replace('  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);', stateCode);

// Inject render
const renderCode = `  return (
    <div className="w-full h-full relative font-sans text-hall-50 selection:bg-hall-950 selection:text-hall-50 bg-transparent overflow-hidden">
        {isDeploying && <DeployLoader />}
`;
content = content.replace(`  return (
    <div className="w-full h-full relative font-sans text-hall-50 selection:bg-hall-950 selection:text-hall-50 bg-transparent overflow-hidden">`, renderCode);

// Inject handler
const handlerCode = `
  const handleDeployToStage = () => {
    setIsDeploying(true);
    setTimeout(() => {
      navigate('/stage', { state: { workspaces, activeWorkspaceId } });
    }, 4500);
  };

  const handleCreateWorkspace = () => {
`;
content = content.replace('  const handleCreateWorkspace = () => {', handlerCode);

// Inject button
const buttonCode = `            {/* Right Controls */}
            <div className="pointer-events-auto relative flex items-center gap-3">
                <button
                    onClick={handleDeployToStage}
                    className="px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>Deploy to Stage</span>
                    <i className="fa-solid fa-bolt"></i>
                </button>

                <button
                    onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}`;
content = content.replace(`            {/* Right Controls */}
            <div className="pointer-events-auto relative">
                <button
                    onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}`, buttonCode);

fs.writeFileSync(file, content);
console.log("Patched StudioView.tsx");
