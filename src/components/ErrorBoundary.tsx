import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-hall-950 text-hall-100 p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-hall-900 border border-red-900/50 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-hall-50 mb-3">Something went wrong</h1>
            <p className="text-hall-400 text-sm mb-8 leading-relaxed">
              We encountered an unexpected error while rendering this view. Your project data is safe.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-hall-100 text-hall-950 hover:bg-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-black/20"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>

            {this.state.error && (
              <div className="mt-8 w-full text-left">
                <p className="text-xs font-mono text-red-400/80 bg-black/50 p-3 rounded-2xl overflow-x-auto">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
