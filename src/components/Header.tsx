
import React from 'react';
import { Menu, Undo2, Redo2, Image as ImageIcon, Download, Settings } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  projectName?: string;
  onOpenAssets: () => void;
  onExport?: () => void;
  onOpenSettings?: () => void;
  activeUsers?: any[];
}

const Header: React.FC<HeaderProps> = ({ 
  toggleSidebar, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo,
  projectName,
  onOpenAssets,
  onExport,
  onOpenSettings,
  activeUsers = []
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-4 py-3 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left Side: Menu */}
        <div className="pointer-events-auto bg-hall-950/80 bg-hall-900/80 backdrop-blur-xl border border-hall-200 border-hall-800 p-1.5 rounded-full shadow-lg shadow-hall-200/50 shadow-black/50 flex items-center gap-1">
          <button
            onClick={toggleSidebar}
            className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-hall-100 hover:bg-hall-800 rounded-full transition-colors text-hall-600 text-hall-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            title="Projects"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Workspace Controls (Visible only when project active) */}
        {projectName && (
           <div className="pointer-events-auto flex items-center gap-1 bg-hall-950/80 bg-hall-900/80 backdrop-blur-xl border border-hall-200 border-hall-800 p-1.5 rounded-full shadow-lg shadow-hall-200/50 shadow-black/50 animate-in fade-in slide-in-from-top-4">
             <button
               onClick={onUndo}
               disabled={!canUndo}
               className="group relative p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-hall-100 hover:bg-hall-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-hall-600 text-hall-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
               aria-label="Undo"
             >
               <Undo2 className="w-4 h-4" />
               <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                 Undo (Cmd+Z)
               </div>
             </button>
             <div className="px-3 text-xs font-medium text-hall-500 text-hall-400 max-w-[100px] sm:max-w-[200px] truncate flex items-center gap-2">
               Working Directory: {projectName}
             </div>
             <button
               onClick={onRedo}
               disabled={!canRedo}
               className="group relative p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-hall-100 hover:bg-hall-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-hall-600 text-hall-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
               aria-label="Redo"
             >
               <Redo2 className="w-4 h-4" />
               <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                 Redo (Cmd+Shift+Z)
               </div>
             </button>
             
             {/* Active Users */}
             {activeUsers.length > 0 && (
               <div className="flex items-center pl-2 ml-2 border-l border-hall-200 dark:border-hall-800">
                 <div className="flex -space-x-2">
                   {activeUsers.slice(0, 3).map((u: any, i: number) => (
                     <div 
                       key={u.id || i}
                       className="w-6 h-6 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                       style={{ backgroundColor: u.user?.color || '#3b82f6' }}
                       title={u.user?.name || 'Collaborator'}
                     >
                       {(u.user?.name || 'C').charAt(0).toUpperCase()}
                     </div>
                   ))}
                   {activeUsers.length > 3 && (
                     <div className="w-6 h-6 rounded-full border-2 border-white dark:border-black bg-hall-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                       +{activeUsers.length - 3}
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>
        )}

        {/* Right Side: Tools & Theme */}
        <div className="flex items-center gap-2 pointer-events-auto bg-hall-950/80 bg-hall-900/80 backdrop-blur-xl border border-hall-200 border-hall-800 p-1.5 rounded-full shadow-lg shadow-hall-200/50 shadow-black/50">

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="group relative p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-hall-100 hover:bg-hall-800 transition-colors text-hall-600 text-hall-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Project Settings"
            >
              <Settings className="w-4 h-4" />
              <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Project Settings
              </div>
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="group relative p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-hall-100 hover:bg-hall-800 transition-colors text-hall-600 text-hall-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Export Project"
            >
              <Download className="w-4 h-4" />
              <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                Export Project (ZIP)
              </div>
            </button>
          )}
          <button
            onClick={onOpenAssets}
            className="group relative p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-hall-100 hover:bg-hall-800 transition-colors text-hall-600 text-hall-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Generate Assets"
          >
            <ImageIcon className="w-4 h-4" />
            <div className="absolute top-full mt-2 right-0 md:left-1/2 md:-translate-x-1/2 px-2 py-1 bg-hall-900 dark:bg-black text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
              Asset Manager
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
