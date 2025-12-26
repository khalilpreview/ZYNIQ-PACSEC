import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry(): void {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-arcade text-center">
          <style>{`
            @keyframes glitch {
              0%, 100% { transform: translate(0); }
              20% { transform: translate(-2px, 2px); }
              40% { transform: translate(2px, -2px); }
              60% { transform: translate(-2px, -2px); }
              80% { transform: translate(2px, 2px); }
            }
          `}</style>
          
          {/* Glitch Effect Container */}
          <div className="relative mb-8" style={{ animation: 'glitch 0.3s infinite' }}>
            <h1 className="text-6xl md:text-8xl text-pac-ghostRed drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">
              ERROR
            </h1>
          </div>

          <div className="text-pac-yellow text-xl md:text-2xl mb-4 tracking-widest">
            SYSTEM MALFUNCTION
          </div>

          <p className="text-gray-500 text-xs md:text-sm max-w-md mb-8 font-mono">
            {this.state.error?.message || 'An unexpected error occurred. The security protocols have been compromised.'}
          </p>

          {/* Error Details (Collapsible) */}
          <details className="text-left max-w-lg w-full mb-8">
            <summary className="text-pac-ghostCyan text-xs cursor-pointer hover:text-white transition-colors">
              [SHOW STACK TRACE]
            </summary>
            <pre className="mt-4 p-4 bg-gray-900 rounded text-[10px] text-gray-400 overflow-auto max-h-40 font-mono">
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </details>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-pac-yellow text-black font-arcade text-sm tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(242,201,76,0.3)]"
            >
              RETRY
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border-2 border-pac-ghostCyan text-pac-ghostCyan font-arcade text-sm tracking-widest hover:bg-pac-ghostCyan hover:text-black transition-colors"
            >
              REBOOT
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 text-[8px] text-gray-600 font-mono">
            ERROR CODE: {Date.now().toString(16).toUpperCase()}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
