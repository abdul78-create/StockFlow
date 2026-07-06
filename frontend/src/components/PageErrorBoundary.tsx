import * as React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

/**
 * Lightweight per-page error boundary used inside the DashboardLayout.
 * Shows an inline error card instead of replacing the entire screen.
 */
export class PageErrorBoundary extends React.Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[PageErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const pageName = this.props.pageName ?? 'this page';
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Couldn't load {pageName}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            An error occurred while rendering this page. Try reloading it.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={this.handleReset} icon={<RefreshCw />}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
