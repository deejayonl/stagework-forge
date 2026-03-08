import React, { useState } from 'react';
import { X, Plus, Trash2, Database } from 'lucide-react';

interface VariablesPanelProps {
  variables: Record<string, string>;
  onUpdateVariables: (variables: Record<string, string>) => void;
  onClose: () => void;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  onUpdateVariables,
  onClose
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddVariable = () => {
    if (!newKey.trim()) return;
    
    // Ensure key is valid format (alphanumeric and dots/underscores)
    const cleanKey = newKey.trim().replace(/[^a-zA-Z0-9_.]/g, '');
    if (!cleanKey) return;

    onUpdateVariables({
      ...variables,
      [cleanKey]: newValue
    });
    
    setNewKey('');
    setNewValue('');
  };

  const handleDeleteVariable = (keyToDelete: string) => {
    const updated = { ...variables };
    delete updated[keyToDelete];
    onUpdateVariables(updated);
  };

  const handleUpdateValue = (key: string, val: string) => {
    onUpdateVariables({
      ...variables,
      [key]: val
    });
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-hall-950 border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl backdrop-blur-xl z-50">
      <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex items-center justify-between bg-hall-50/50 dark:bg-hall-900/50">
        <h3 className="font-semibold text-hall-900 dark:text-hall-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500" />
          Global Variables
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-hall-500 hover:text-hall-900 dark:hover:text-hall-100 hover:bg-hall-200 dark:hover:bg-hall-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-400">
          Define global variables to use in your components. Bind them in the Property Inspector.
        </div>

        <div className="space-y-3">
          {Object.entries(variables).length === 0 ? (
            <div className="text-center py-6 text-sm text-hall-500 dark:text-hall-400">
              No variables defined yet.
            </div>
          ) : (
            Object.entries(variables).map(([key, value]) => (
              <div key={key} className="group relative border border-hall-200 dark:border-hall-800 rounded-lg p-3 bg-hall-50 dark:bg-hall-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-semibold text-hall-900 dark:text-hall-100 bg-hall-200 dark:bg-hall-800 px-2 py-0.5 rounded">
                    {key}
                  </span>
                  <button
                    onClick={() => handleDeleteVariable(key)}
                    className="text-hall-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateValue(key, e.target.value)}
                  className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded px-2 py-1 text-sm text-hall-900 dark:text-hall-100 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Value..."
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-hall-200 dark:border-hall-800 bg-hall-50/50 dark:bg-hall-900/50 space-y-3">
        <div className="space-y-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-hall-100 focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Variable name (e.g. theme.color)"
            onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full bg-white dark:bg-black border border-hall-200 dark:border-hall-800 rounded-lg px-3 py-2 text-sm text-hall-900 dark:text-hall-100 focus:outline-none focus:border-amber-500 transition-colors"
            placeholder="Value..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
          />
        </div>
        <button
          onClick={handleAddVariable}
          disabled={!newKey.trim()}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-hall-300 dark:disabled:bg-hall-800 disabled:text-hall-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>
    </div>
  );
};
