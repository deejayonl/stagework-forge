import React, { Suspense } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { Theater, Palette, Settings, Loader2, Sun, Moon, Edit3 } from 'lucide-react'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load route components with retry logic for chunk loading errors (Connection lost / Load failed)
const lazyRetry = function(componentImport: () => Promise<any>) {
  return new Promise((resolve, reject) => {
    // Check if we've already tried to refresh for this module
    const hasRefreshed = JSON.parse(
      window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    );
    
    componentImport()
      .then((component) => {
        // Success! Reset the flag
        window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
        resolve(component);
      })
      .catch((error) => {
        const errorMsg = error?.message || error?.toString() || '';
        const isChunkLoadError = 
          errorMsg.includes('Failed to fetch dynamically imported module') ||
          errorMsg.includes('Load failed') ||
          errorMsg.includes('Connection lost') ||
          errorMsg.includes('Importing a module script failed') ||
          errorMsg.includes('NetworkError');

        // Only retry once per session to avoid infinite reload loops
        if (!hasRefreshed && isChunkLoadError) {
          console.warn('Chunk load error detected. Reloading page...', error);
          window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
          // Reload the page to get the latest chunks
          window.location.reload();
        } else {
          // If we already refreshed or it's a different error, fail normally
          reject(error);
        }
      });
  });
};

const ScriptView = React.lazy(() => lazyRetry(() => import('./routes/script/ScriptView')) as Promise<any>);
const StudioView = React.lazy(() => lazyRetry(() => import('./routes/studio/StudioView')) as Promise<any>);
const StageView = React.lazy(() => lazyRetry(() => import('./routes/stage/StageView')) as Promise<any>);
const AdminView = React.lazy(() => lazyRetry(() => import('./routes/admin/AdminView')) as Promise<any>);
const PreviewView = React.lazy(() => lazyRetry(() => import('./routes/preview/PreviewView')) as Promise<any>);

const NAV_ITEMS = [
  { to: '/script', icon: Edit3, label: 'Script' },
  { to: '/studio', icon: Palette, label: 'Studio' },
  { to: '/stage', icon: Theater, label: 'Stage' },
  { to: '/admin', icon: Settings, label: 'Admin' },
] as const

// Loading fallback for Suspense
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-full w-full bg-hall-950">
    <div className="flex flex-col items-center gap-4 text-hall-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <span className="text-sm font-medium tracking-widest uppercase">Loading Module</span>
    </div>
  </div>
);

export default function App() {
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/preview');
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themechange'));
  }, [theme]);

  React.useEffect(() => {
    const handleThemeChange = () => {
        setTheme((localStorage.getItem('theme') as 'dark' | 'light') || 'dark');
    };
    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transition');
    setTheme(t => t === 'dark' ? 'light' : 'dark');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
  };

  return (
    <div className="flex h-[100dvh] bg-transparent text-ink relative">
      {!isPreview && (
        <>
          {/* Sidebar wrapper to prevent layout shift */}
          <div className="w-[68px] shrink-0 z-50 relative h-full hidden md:block">
        <aside className="absolute top-0 left-0 h-full w-[68px] hover:w-[180px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-hall-950 border-r border-hall-700/50 flex flex-col items-center hover:items-start py-5 gap-1.5 z-50 group/sidebar overflow-hidden shadow-[4px_0_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[12px_0_32px_-12px_rgba(0,0,0,0.6)]">
          {/* Logo mark */}
          <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-hall-950 font-bold text-sm mb-8 shadow-lg shadow-indigo-500/20 group-hover/sidebar:mx-5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            S
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 w-full px-2">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `bouncy-click group relative flex items-center py-2.5 px-3.5 rounded-xl text-[12px] font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive
                      ? 'bg-hall-750 text-hall-100 shadow-sm'
                      : 'text-hall-500 hover:text-hall-300 hover:bg-hall-800/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500 transition-all duration-300" />
                    )}
                    <div className="flex flex-col items-center justify-center group-hover/sidebar:flex-row group-hover/sidebar:justify-start w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="shrink-0 group-hover/sidebar:mr-3 transition-all duration-300" />
                      <span className="mt-1 text-[10px] group-hover/sidebar:hidden transition-all duration-200"></span>
                      <span className="hidden group-hover/sidebar:inline whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 delay-100">{label}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 w-full px-2 items-center group-hover/sidebar:items-start transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group/theme relative flex items-center py-2.5 px-3.5 rounded-xl text-[12px] font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-hall-500 hover:text-hall-300 hover:bg-hall-800/50 w-full justify-center group-hover/sidebar:justify-start"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} className="shrink-0 group-hover/sidebar:mr-3 transition-all duration-300" /> : <Moon size={18} strokeWidth={1.5} className="shrink-0 group-hover/sidebar:mr-3 transition-all duration-300" />}
              <span className="hidden group-hover/sidebar:inline whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 delay-100">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Bottom indicator */}
            <div className="group-hover/sidebar:px-3 mb-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] w-full flex justify-center group-hover/sidebar:justify-start">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Server connected" />
            </div>
          </div>
        </aside>
      </div>
        </>
      )}

      
      {!isPreview && (
        <>
          {/* Mobile Bottom Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 min-h-[4rem] bg-surface/90 backdrop-blur-md border-t border-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                isActive ? 'text-indigo-400' : 'text-hall-500 hover:text-hall-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0 relative pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">

        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/script" replace />} />
              <Route path="/script/*" element={<ScriptView />} />
              <Route path="/studio/*" element={<StudioView />} />
              <Route path="/stage/*" element={<StageView />} />
              <Route path="/admin/*" element={<AdminView />} />
              <Route path="/preview/:projectId" element={<PreviewView />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
