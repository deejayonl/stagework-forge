import { FolderOpen } from 'lucide-react';

interface WorkspacePanelProps {
  workspace: string | null;
}

export function WorkspacePanel({ workspace }: WorkspacePanelProps) {
  if (!workspace) return null;

  return (
    <div className='rounded-xl bg-ink/[0.03] border border-ink/[0.06] px-4 py-3'>
      <div className='flex items-center gap-2'>
        <FolderOpen size={12} className='text-ink/25 shrink-0' />
        <h3 className='text-[12px] font-semibold text-ink/40 uppercase tracking-wider'>Workspace</h3>
      </div>
      <p className='mt-1.5 text-[12px] font-mono text-ink/30 truncate' title={workspace}>
        {workspace}
      </p>
    </div>
  );
}
