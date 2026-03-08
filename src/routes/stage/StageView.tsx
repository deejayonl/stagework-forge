import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ForgeView from '../forge/ForgeView.tsx';
import { OrbCanvas } from './components/OrbCanvas.tsx';

export default function StageView() {
  const location = useLocation();
  const workspaces = location.state?.workspaces;
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className='relative w-full h-full bg-transparent overflow-hidden'>
      <OrbCanvas isRunning={isGenerating} isComplete={false} />
      <div className='relative z-10 w-full h-full'>
        <ForgeView onGeneratingChange={setIsGenerating} initialWorkspaces={workspaces} />
      </div>
    </div>
  );
}
