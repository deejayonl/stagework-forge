const fs = require('fs');
const path = require('path');

const forgeViewPath = path.join(__dirname, 'src/routes/forge/ForgeView.tsx');
let code = fs.readFileSync(forgeViewPath, 'utf8');

const oldRender = `{hasProject && <Workspace 
               files={previewFiles || currentFiles} 
               onFileChange={(files) => {
                 // Only update the underlying project state if we are NOT currently previewing a draft
                 if (!previewFiles) {
                   updateCurrentVersion(files);
                 }
               }}
             />}`;

const newRender = `{hasProject && globalMode && !currentProject ? (
                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-8">
                  {projects.map(p => (
                    <div key={p.id} className="h-[60vh] md:h-full relative rounded-[32px] overflow-hidden border border-amber-500/20 shadow-lg" onClick={() => { setGlobalMode(false); selectProject(p.id); }}>
                       <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-md text-white text-xs font-bold py-2 px-4 z-20 flex justify-between items-center cursor-pointer hover:bg-black/80 transition-colors">
                          <span>{p.name}</span>
                          <span className="text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Select to Isolate</span>
                       </div>
                       <div className="w-full h-full pt-8 pointer-events-none">
                         <Workspace 
                           files={p.versions[p.currentVersionIndex].files} 
                           onFileChange={() => {}}
                         />
                       </div>
                    </div>
                  ))}
                </div>
             ) : (
                hasProject && <Workspace 
                 files={previewFiles || currentFiles} 
                 onFileChange={(files) => {
                   if (!previewFiles) {
                     updateCurrentVersion(files);
                   }
                 }}
               />
             )}`;

code = code.replace(oldRender, newRender);

fs.writeFileSync(forgeViewPath, code);
