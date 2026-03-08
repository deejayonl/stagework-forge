import React from 'react';
import { Project } from '../types';
import { Trash2, FolderGit2, Plus, Clock } from 'lucide-react';

interface ProjectSidebarProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
  onLoadFromBFF?: () => void;
  isSyncing?: boolean;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  projects, 
  currentProjectId, 
  onSelect, 
  onDelete, 
  onNew,
  isOpen,
  onClose,
  onLoadFromBFF,
  isSyncing
}) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] z-[55] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`absolute top-2 bottom-2 left-2 right-2 md:top-4 md:bottom-4 md:left-4 md:right-auto md:w-72 bg-hall-950 bg-hall-900/95 backdrop-blur-xl border border-hall-200 border-hall-800 rounded-2xl shadow-2xl transform transition-all duration-500 ease-spring z-[60] ${isOpen ? 'translate-x-0 md:translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-hall-200 border-hall-800 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-hall-900 text-hall-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5" />
              Your Projects
            </h2>
          </div>

          
          <div className="p-4 shrink-0 flex gap-2">
            <button
              onClick={() => { onNew(); if (window.innerWidth < 768) onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-hall-900 bg-hall-950 text-ink text-hall-950 rounded-2xl font-bold uppercase tracking-wider text-xs hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ease-spring"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
            {onLoadFromBFF && (
              <button
                onClick={() => { onLoadFromBFF(); }}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-500/20 transition-all duration-300 ease-spring disabled:opacity-50"
                title="Load from BFF State Store"
              >
                <FolderGit2 className="w-4 h-4" />
                {isSyncing ? 'Syncing...' : 'Load'}
              </button>
            )}
          </div>


          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-0">
            {projects.length === 0 ? (
              <div className="text-center text-hall-500 text-hall-500 text-sm py-10">
                No projects yet.<br/>Start building something!
              </div>
            ) : (
              projects.map(project => (
                <div 
                  key={project.id}
                  className={`group relative rounded-xl border transition-all duration-300 ease-spring hover:-translate-y-0.5 ${
                    currentProjectId === project.id
                      ? 'bg-hall-100 bg-hall-800 border-hall-300 border-hall-600 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-hall-50 hover:bg-hall-800/50 hover:border-hall-200 hover:border-hall-800'
                  }`}
                >
                  <button
                    onClick={() => { onSelect(project.id); onClose(); }}
                    className="w-full text-left p-3 pr-10"
                  >
                    <div className="font-medium text-sm text-hall-900 text-hall-100 truncate mb-1">
                      {project.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-hall-500">
                      <Clock className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-hall-400 hover:text-red-500 hover:bg-red-50 hover:bg-red-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectSidebar;