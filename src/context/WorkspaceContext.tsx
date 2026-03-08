import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ProjectState, GeneratedFile } from '../types';

interface HistoryState {
  past: ProjectState[];
  present: ProjectState;
  future: ProjectState[];
}

interface WorkspaceContextType {
  history: HistoryState;
  pushState: (newState: Partial<ProjectState>) => void;
  replaceState: (newState: Partial<ProjectState>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider: React.FC<{ 
  children: ReactNode, 
  initialState?: ProjectState,
  onStateChange?: (state: ProjectState) => void
}> = ({ 
  children, 
  initialState = { files: [], status: 'idle' },
  onStateChange
}) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: []
  });

  const pushState = useCallback((newState: Partial<ProjectState>) => {
    setHistory(current => {
      const updatedPresent = { ...current.present, ...newState };
      
      const newPast = [...current.past, current.present];
      
      // Cap history at 50 to prevent memory leaks
      if (newPast.length > 50) {
        newPast.shift();
      }

      const nextState = {
        past: newPast,
        present: updatedPresent,
        future: [] // Clear future on new action
      };
      
      if (onStateChange) onStateChange(nextState.present);
      return nextState;
    });
  }, [onStateChange]);

  const replaceState = useCallback((newState: Partial<ProjectState>) => {
    setHistory(current => {
      const updatedPresent = { ...current.present, ...newState };
      const nextState = {
        ...current,
        present: updatedPresent
      };
      if (onStateChange) onStateChange(nextState.present);
      return nextState;
    });
  }, [onStateChange]);

  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);

      const nextState = {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future]
      };
      
      if (onStateChange) onStateChange(nextState.present);
      return nextState;
    });
  }, [onStateChange]);

  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      const nextState = {
        past: [...current.past, current.present],
        present: next,
        future: newFuture
      };
      
      if (onStateChange) onStateChange(nextState.present);
      return nextState;
    });
  }, [onStateChange]);

  // Keyboard listeners for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const value = {
    history,
    pushState,
    replaceState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
};
