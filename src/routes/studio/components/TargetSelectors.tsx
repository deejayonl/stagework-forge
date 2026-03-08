import React from 'react';
import { Smartphone, Tablet, Monitor, Globe, LayoutDashboard, Terminal, Watch } from 'lucide-react';

export const TARGETS = [
  { id: 'web-landing', label: 'Web Landing Page', icon: Monitor },
  { id: 'saas-dashboard', label: 'SaaS Dashboard', icon: LayoutDashboard },
  { id: 'mobile-phone', label: 'Mobile App (Phone)', icon: Smartphone },
  { id: 'mobile-tablet', label: 'Mobile App (Tablet)', icon: Tablet },
  { id: 'watchos', label: 'watchOS App', icon: Watch },
  { id: 'macos-desktop', label: 'macOS App', icon: Terminal },
];

interface TargetSelectorsProps {
  selectedTargetIds: string[];
  onToggleTarget: (id: string, label: string) => void;
}

export default function TargetSelectors({ selectedTargetIds, onToggleTarget }: TargetSelectorsProps) {
  return (
    <div className="absolute top-24 left-4 md:left-6 z-40 bg-hall-900/80 backdrop-blur-xl border border-hall-800 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 pointer-events-auto">
      <div className="text-xs font-bold text-hall-400 uppercase tracking-widest mb-1 px-1">
        Deployment Targets
      </div>
      <div className="flex flex-col gap-1.5">
        {TARGETS.map(({ id, label, icon: Icon }) => {
          const isSelected = selectedTargetIds.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggleTarget(id, label)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isSelected 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]' 
                  : 'bg-transparent text-hall-500 hover:bg-hall-800 hover:text-hall-300 border border-transparent'
              }`}
            >
              <Icon size={16} className={isSelected ? 'text-indigo-400' : 'text-hall-500'} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
