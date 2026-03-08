import React, { useEffect, useRef, useState } from 'react';
import { Copy, Scissors, ClipboardPaste, Trash2, Edit2, Box, ArrowUp, ArrowDown } from 'lucide-react';

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  shortcut?: string;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 10;
      }
      if (y + rect.height > viewportHeight) {
        newY = viewportHeight - rect.height - 10;
      }

      setPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div 
      ref={menuRef}
      style={menuStyle}
      className="z-[9999] w-56 bg-white dark:bg-hall-900 border border-hall-200 dark:border-hall-800 rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in duration-150"
      onContextMenu={(e) => e.preventDefault()}
    >
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              onClose();
            }}
            className="w-full text-left px-3 py-2 text-sm text-hall-700 dark:text-hall-300 hover:bg-hall-100 dark:hover:bg-hall-800 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-hall-400 group-hover:text-hall-600 dark:group-hover:text-hall-200">
                {action.icon}
              </span>
              {action.label}
            </div>
            {action.shortcut && (
              <span className="text-xs text-hall-400 font-mono">
                {action.shortcut}
              </span>
            )}
          </button>
          {action.divider && index < actions.length - 1 && <div className="h-px bg-hall-200 dark:bg-hall-800 my-1 mx-2" />}
        </React.Fragment>
      ))}
    </div>
  );
};
