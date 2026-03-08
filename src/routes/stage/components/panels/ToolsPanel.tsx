import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, Check, Zap } from 'lucide-react';

interface ToolsPanelProps {
  tools: string[];
  activeTool: string | null;
  toolsUsed: string[];
}

export function ToolsPanel({ tools, activeTool, toolsUsed }: ToolsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (tools.length === 0) return null;

  return (
    <div className='rounded-xl bg-ink/[0.03] border border-ink/[0.06] overflow-hidden'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='w-full flex items-center justify-between px-4 py-3 hover:bg-ink/[0.02] transition-colors'
      >
        <div className='flex items-center gap-2'>
          <Wrench size={12} className='text-ink/25' />
          <h3 className='text-[12px] font-semibold text-ink/40 uppercase tracking-wider'>Tools</h3>
          <span className='text-[11px] text-ink/20 bg-ink/[0.04] px-1.5 py-0.5 rounded-full'>{tools.length}</span>
        </div>
        {expanded ? (
          <ChevronDown size={12} className='text-ink/25' />
        ) : (
          <ChevronRight size={12} className='text-ink/25' />
        )}
      </button>

      {expanded && (
        <div className='px-4 pb-3 space-y-0.5 max-h-[300px] overflow-y-auto'>
          {tools.sort().map((tool) => {
            const isActive = tool === activeTool;
            const wasUsed = toolsUsed.includes(tool);
            return (
              <div
                key={tool}
                className={`flex items-center gap-2 px-2 py-1 rounded-xl text-[12px] font-mono ${
                  isActive
                    ? 'bg-verdict-pass/[0.06] text-verdict-pass/70'
                    : wasUsed
                      ? 'text-ink/40'
                      : 'text-ink/20'
                }`}
              >
                {isActive ? (
                  <Zap size={10} className='text-verdict-pass/60 shrink-0' />
                ) : wasUsed ? (
                  <Check size={10} className='text-ink/30 shrink-0' />
                ) : (
                  <span className='w-[10px] shrink-0' />
                )}
                {tool}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
