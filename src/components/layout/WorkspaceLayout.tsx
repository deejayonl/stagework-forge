import React from 'react';

interface WorkspaceLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  workspace?: React.ReactNode;
}

export function WorkspaceLayout({ sidebar, header, workspace }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-full w-full text-ink overflow-hidden relative">
      {/* Optional Secondary Sidebar (Project Sidebar from forge-dev) */}
      {sidebar && (
        <aside className="w-64 border-r border-hall-800 bg-hall-900/30 flex-shrink-0">
          {sidebar}
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        {header && (
          <header className="h-14 border-b border-hall-800 bg-hall-900/50 flex items-center px-4 flex-shrink-0">
            {header}
          </header>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 relative overflow-hidden">
          {workspace}
        </main>
      </div>
    </div>
  );
}
