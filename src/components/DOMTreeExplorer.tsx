import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Monitor, Type, Layout, Image as ImageIcon, GripVertical } from 'lucide-react';

interface DOMNode {
  id: string;
  tagName: string;
  className?: string;
  children?: DOMNode[];
  type?: 'text';
  content?: string;
}

interface DOMTreeExplorerProps {
  tree: DOMNode | null;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode?: (id: string | null) => void;
  onClose: () => void;
  onMoveNode?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

const TreeNode: React.FC<{
  node: DOMNode;
  depth: number;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode?: (id: string | null) => void;
  onMoveNode?: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}> = ({ node, depth, selectedNodeId, onSelectNode, onHoverNode, onMoveNode }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [dragOverPos, setDragOverPos] = useState<'top' | 'bottom' | 'center' | null>(null);
  
  if (node.type === 'text') {
    return (
      <div 
        className="flex items-center gap-2 py-1 px-2 text-[10px] text-hall-500 truncate"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <Type className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">"{node.content}"</span>
      </div>
    );
  }

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  const getIcon = (tagName: string) => {
    switch(tagName) {
      case 'img': return <ImageIcon className="w-3 h-3" />;
      case 'div': case 'section': case 'main': case 'header': case 'footer': return <Layout className="w-3 h-3" />;
      case 'h1': case 'h2': case 'h3': case 'p': case 'span': case 'a': case 'button': return <Type className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  return (
    <div>
      <div 
        
      draggable={node.id ? true : false}
      onDragStart={(e) => {
        if (!node.id) return;
        e.dataTransfer.setData('text/plain', node.id);
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!node.id) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        if (y < rect.height * 0.25) setDragOverPos('top');
        else if (y > rect.height * 0.75) setDragOverPos('bottom');
        else setDragOverPos('center');
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        setDragOverPos(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== node.id && dragOverPos && onMoveNode) {
          onMoveNode(sourceId, node.id, dragOverPos === 'top' ? 'before' : dragOverPos === 'bottom' ? 'after' : 'inside');
        }
        setDragOverPos(null);
      }}
      className={`flex items-center gap-1 py-1 px-2 cursor-pointer transition-colors ${dragOverPos === 'top' ? 'border-t-2 border-amber-500' : dragOverPos === 'bottom' ? 'border-b-2 border-amber-500' : dragOverPos === 'center' ? 'bg-amber-500/30' : ''} ${
          isSelected 
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold' 
            : 'text-hall-700 dark:text-hall-300 hover:bg-hall-100 dark:hover:bg-hall-800'
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode(node.id);
        }}
        onMouseEnter={() => onHoverNode && onHoverNode(node.id)}
        onMouseLeave={() => onHoverNode && onHoverNode(null)}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3 text-hall-500" /> : <ChevronRight className="w-3 h-3 text-hall-500" />
          ) : (
            <div className="w-3 h-3" />
          )}
        </div>
        
        <div className="w-3 h-3 text-hall-400 hover:text-hall-600 cursor-grab active:cursor-grabbing flex-shrink-0" title="Drag to reorder">
          <GripVertical className="w-3 h-3" />
        </div>

        {getIcon(node.tagName)}
        
        <span className="text-[11px] font-mono">{node.tagName}</span>
        {node.className && (
          <span className="text-[10px] text-hall-400 dark:text-hall-500 truncate max-w-[100px]">
            .{node.className.split(' ')[0]}
          </span>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, idx) => (
            <TreeNode 
              key={child.id || idx} 
              node={child} 
              depth={depth + 1} 
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onHoverNode={onHoverNode}
              onMoveNode={onMoveNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DOMTreeExplorer: React.FC<DOMTreeExplorerProps> = ({ 
  tree, 
  selectedNodeId, 
  onSelectNode,
  onHoverNode,
  onMoveNode,
  onClose
}) => {
  return (
    <div className="w-64 h-full bg-hall-50/95 dark:bg-hall-950/95 backdrop-blur-xl border-r border-hall-200 dark:border-hall-800 flex flex-col shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-hall-200 dark:border-hall-800 shrink-0">
        <h3 className="text-sm font-bold text-hall-900 dark:text-ink flex items-center gap-2">
          <Layout className="w-4 h-4" />
          DOM Tree
        </h3>
        <button onClick={onClose} className="text-hall-500 hover:text-hall-900 dark:hover:text-ink">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {tree ? (
          <TreeNode 
            node={tree} 
            depth={0} 
            selectedNodeId={selectedNodeId} 
            onSelectNode={onSelectNode} 
            onHoverNode={onHoverNode}
            onMoveNode={onMoveNode}
          />
        ) : (
          <div className="p-4 text-xs text-hall-500 text-center">
            Loading DOM Tree...
          </div>
        )}
      </div>
    </div>
  );
};

export default DOMTreeExplorer;
