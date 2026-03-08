import { Loader2, Check, Zap } from 'lucide-react';

interface ActivityPanelProps {
  activeTool: string | null;
  toolsUsed: string[];
  elapsed: number;
  promptPreview?: string;
  isRunning: boolean;
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function ActivityPanel({ activeTool, toolsUsed, elapsed, promptPreview, isRunning }: ActivityPanelProps) {
  if (!isRunning && toolsUsed.length === 0) {
    return (
      <div className='rounded-xl bg-ink/[0.03] border border-ink/[0.06] p-4 flex flex-col items-center justify-center text-center space-y-2'>
        <Zap size={16} className='text-ink/20 mb-1' />
        <h3 className='text-[12px] font-medium text-ink/40'>No Activity</h3>
        <p className='text-[11px] text-ink/30 max-w-[200px]'>Start a task to see the agent's progress here.</p>
      </div>
    );
  }

  return (
    <div className='rounded-xl bg-ink/[0.03] border border-ink/[0.06] p-4 space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-[12px] font-semibold text-ink/40 uppercase tracking-wider'>Activity</h3>
        {isRunning && (
          <span className='text-[11px] text-ink/30 tabular-nums'>{formatElapsed(elapsed)}</span>
        )}
      </div>

      {/* Prompt preview */}
      {promptPreview && (
        <p className='text-[12px] text-ink/30 truncate'>{promptPreview}</p>
      )}

      {/* Active tool */}
      {activeTool && isRunning && (
        <div className='flex items-center gap-2 px-3 py-2 rounded-2xl bg-verdict-pass/[0.06] border border-verdict-pass/10'>
          <span className='relative flex h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-verdict-pass/60 opacity-75' />
            <span className='relative inline-flex rounded-full h-2 w-2 bg-verdict-pass/80' />
          </span>
          <Zap size={12} className='text-verdict-pass/60' />
          <span className='text-[13px] text-verdict-pass/70 font-mono'>{activeTool}</span>
        </div>
      )}

      {/* Tools used */}
      {toolsUsed.length > 0 && (
        <div className='space-y-1'>
          {toolsUsed.map((tool, i) => {
            const isCurrent = tool === activeTool && isRunning && i === toolsUsed.length - 1;
            return (
              <div key={`${tool}-${i}`} className='flex items-center gap-2 text-[12px]'>
                {isCurrent ? (
                  <Loader2 size={11} className='text-verdict-pass/50 animate-spin shrink-0' />
                ) : (
                  <Check size={11} className='text-ink/20 shrink-0' />
                )}
                <span className={`font-mono ${isCurrent ? 'text-ink/50' : 'text-ink/25'}`}>{tool}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Running but no tools yet */}
      {isRunning && toolsUsed.length === 0 && !activeTool && (
        <div className='flex items-center gap-2'>
          <Loader2 size={12} className='text-accent/50 animate-spin' />
          <span className='text-[12px] text-ink/30'>Thinking...</span>
        </div>
      )}
    </div>
  );
}
