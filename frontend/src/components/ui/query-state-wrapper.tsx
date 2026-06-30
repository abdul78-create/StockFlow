import { ReactNode } from 'react';
import { ErrorState } from './error-state';
import { AccessDeniedState } from './access-denied-state';
import { EmptyState } from './empty-state';
import { Spinner } from './spinner';

export interface QueryStateWrapperProps<T> {
  isLoading: boolean;
  error: any | null;
  data: T | undefined;
  isEmpty: (data: T) => boolean;
  emptyProps?: {
    title?: string;
    description?: string;
    action?: any;
  };
  children: (data: T) => ReactNode;
}

export function QueryStateWrapper<T>({
  isLoading,
  error,
  data,
  isEmpty,
  emptyProps,
  children,
}: QueryStateWrapperProps<T>) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      return <AccessDeniedState />;
    }
    
    // Check if network error (server down)
    if (!status || status >= 500) {
      return (
        <ErrorState
          title="Unable to connect"
          message="The server is currently unavailable. Please check your connection or try again later."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return (
      <ErrorState
        title="An error occurred"
        message={error?.response?.data?.message || error.message || 'Something went wrong while fetching data.'}
      />
    );
  }

  if (!data || isEmpty(data)) {
    return (
      <EmptyState
        title={emptyProps?.title || 'No data found'}
        description={emptyProps?.description || 'There is no data to display at this time.'}
        action={emptyProps?.action}
      />
    );
  }

  return <>{children(data)}</>;
}
