import React from 'react';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { Clock, RotateCcw, ChevronRight } from 'lucide-react';

export const HistoryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { history, replaceState } = useWorkspaceContext();

  const allSnapshots = [
    ...history.past,
    history.present,
    ...history.future
  ].filter(state => state && state.timestamp);

  // Sort by timestamp descending (newest first)
  const sortedSnapshots = [...allSnapshots].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-hall-950 border-l border-hall-200 dark:border-hall-800 w-80 shadow-2xl absolute right-0 top-0 bottom-0 z-50 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 bg-hall-50 dark:bg-hall-900/50">
        <div className="flex items-center gap-2 text-hall-900 dark:text-ink">
          <Clock className="w-5 h-5" />
          <h2 className="font-semibold text-sm">Version History</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-hall-500 hover:bg-hall-200 dark:hover:bg-hall-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedSnapshots.length === 0 ? (
          <div className="text-center text-hall-500 dark:text-hall-400 text-sm py-8">
            No history yet. Start editing to create snapshots.
          </div>
        ) : (
          sortedSnapshots.map((snapshot, index) => {
            const isCurrent = snapshot.timestamp === history.present.timestamp;
            const date = new Date(snapshot.timestamp || Date.now());
            
            return (
              <div 
                key={snapshot.timestamp || index}
                className={`relative pl-6 pb-4 last:pb-0 border-l-2 ${isCurrent ? 'border-amber-500' : 'border-hall-200 dark:border-hall-800'}`}
              >
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isCurrent ? 'bg-amber-500 border-amber-200 dark:border-amber-900/50' : 'bg-hall-200 dark:bg-hall-800 border-white dark:border-hall-950'}`} />
                
                <div className={`p-3 rounded-lg border transition-all ${isCurrent ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-white dark:bg-hall-900 border-hall-200 dark:border-hall-800 hover:border-hall-300 dark:hover:border-hall-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm font-medium ${isCurrent ? 'text-amber-700 dark:text-amber-400' : 'text-hall-900 dark:text-ink'}`}>
                        {snapshot.description || 'Auto Snapshot'}
                      </h4>
                      <p className="text-xs text-hall-500 dark:text-hall-400 mt-1">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                    
                    {!isCurrent && (
                      <button
                        onClick={() => replaceState(snapshot)}
                        className="p-1.5 text-hall-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded">
                      Current Version
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
