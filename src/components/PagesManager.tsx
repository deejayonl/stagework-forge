import React, { useState } from 'react';
import { FileCode, Plus, Trash2, X, Check } from 'lucide-react';
import { GeneratedFile } from '../types';

interface PagesManagerProps {
  files: GeneratedFile[];
  currentPage: string;
  onPageChange: (name: string) => void;
  onAddPage: (name: string) => void;
  onDeletePage: (name: string) => void;
}

export const PagesManager: React.FC<PagesManagerProps> = ({
  files,
  currentPage,
  onPageChange,
  onAddPage,
  onDeletePage
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const htmlFiles = files.filter(f => f.name.endsWith('.html') || f.name === 'index.html');

  const handleAdd = () => {
    if (newPageName.trim()) {
      const formattedName = newPageName.trim().endsWith('.html') ? newPageName.trim() : `${newPageName.trim()}.html`;
      if (!files.find(f => f.name === formattedName)) {
        onAddPage(formattedName);
      }
      setNewPageName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-black border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl">
      <div className="p-4 border-b border-hall-200 dark:border-hall-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-hall-900 dark:text-ink flex items-center gap-2">
          <FileCode className="w-4 h-4 text-amber-500" />
          Pages
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 hover:bg-hall-100 dark:hover:bg-hall-800 rounded-md text-hall-500 dark:text-hall-400"
          title="Add Page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isAdding && (
          <div className="mb-2 p-2 bg-hall-50 dark:bg-hall-900/50 rounded-lg border border-hall-200 dark:border-hall-800 flex items-center gap-2">
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="about.html"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-hall-900 dark:text-ink p-0"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <button onClick={handleAdd} className="text-green-500 hover:text-green-600">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setIsAdding(false)} className="text-red-500 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-1">
          {htmlFiles.map(file => (
            <div
              key={file.name}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                currentPage === file.name
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'hover:bg-hall-100 dark:hover:bg-hall-800 text-hall-700 dark:text-hall-300'
              }`}
              onClick={() => onPageChange(file.name)}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 opacity-50" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              {file.name !== 'index.html' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(file.name);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};