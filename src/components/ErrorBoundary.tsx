import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  title?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full p-6 flex flex-col items-center justify-center bg-red-50/50 rounded-2xl border border-red-100 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <AlertTriangle className="w-7 h-7" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {this.props.title || 'Something went wrong'}
          </h2>
          
          <p className="text-sm text-gray-600 max-w-md mb-6">
            An unexpected error occurred while rendering this section. You can try refreshing or resetting this component.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg shadow transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium text-sm rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </a>
          </div>

          {this.state.error && (
            <div className="w-full max-w-xl text-left mt-4 border-t border-red-100 pt-4">
              <button
                onClick={this.toggleDetails}
                className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-700 py-1"
              >
                <span>Technical details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-gray-900 text-red-300 text-xs font-mono rounded-lg overflow-x-auto max-h-48 scrollbar-thin">
                  <p className="font-semibold text-white mb-1">{this.state.error.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-gray-400 text-[11px] whitespace-pre-wrap leading-relaxed">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
