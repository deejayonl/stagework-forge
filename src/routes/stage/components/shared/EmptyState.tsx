import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='mb-5 text-hall-600 opacity-60'>{icon}</div>
      <h3 className='text-sm font-medium text-hall-400 mb-1'>{title}</h3>
      <p className='text-xs text-hall-500 max-w-xs'>{description}</p>
    </div>
  );
}
