import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Sarthi ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-4">
            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-heading text-xl font-black text-navy-900">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1">
                {this.state.error?.message || 'An unexpected rendering error occurred. Please try reloading.'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="btn-primary text-xs font-bold py-2.5 px-4 flex-1 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-1.5"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

