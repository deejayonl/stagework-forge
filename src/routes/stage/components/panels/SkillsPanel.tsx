import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface SkillsPanelProps {
  skills: { total: number; available: number; names: string[] };
}

export function SkillsPanel({ skills }: SkillsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (skills.total === 0 && skills.names.length === 0) return null;

  return (
    <div className='rounded-xl bg-ink/[0.03] border border-ink/[0.06] overflow-hidden'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='w-full flex items-center justify-between px-4 py-3 hover:bg-ink/[0.02] transition-colors'
      >
        <div className='flex items-center gap-2'>
          <Sparkles size={12} className='text-ink/25' />
          <h3 className='text-[12px] font-semibold text-ink/40 uppercase tracking-wider'>Skills</h3>
          <span className='text-[11px] text-ink/20 bg-ink/[0.04] px-1.5 py-0.5 rounded-full'>
            {skills.available}/{skills.total}
          </span>
        </div>
        {expanded ? (
          <ChevronDown size={12} className='text-ink/25' />
        ) : (
          <ChevronRight size={12} className='text-ink/25' />
        )}
      </button>

      {expanded && (
        <div className='px-4 pb-3 space-y-0.5 max-h-[200px] overflow-y-auto'>
          {skills.names.map((skill) => (
            <div key={skill} className='flex items-center gap-2 px-2 py-1 text-[12px] font-mono text-ink/30'>
              <Sparkles size={10} className='text-ink/15 shrink-0' />
              {skill}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
