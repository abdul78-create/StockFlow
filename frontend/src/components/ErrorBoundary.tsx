import * as React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this would send to an error tracking service (Sentry, etc.)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Our team has been notified. Please reload the application to continue.
          </p>
          {this.state.error && (
            <details className="mt-4 max-w-md text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show details
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <Button className="mt-8" onClick={this.handleReset} icon={<RefreshCw />}>
            Reload application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
