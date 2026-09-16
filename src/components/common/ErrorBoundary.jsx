import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // TODO: Send to Sentry/LogRocket in production
    console.error('[TravelEase Error Boundary]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
              We encountered an unexpected error. Our team has been notified.
              Please try refreshing the page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <FaRedo className="w-3.5 h-3.5" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-indigo-400 transition-all duration-200"
              >
                <FaHome className="w-3.5 h-3.5" />
                Go Home
              </button>
            </div>

            {/* Show error details in development only */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-xs font-mono text-slate-600 dark:text-slate-400 overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Error Details (Dev Only)
                </summary>
                <p className="text-red-600 dark:text-red-400 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap text-[10px] opacity-70">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
