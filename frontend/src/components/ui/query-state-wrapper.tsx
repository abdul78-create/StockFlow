import { ReactNode, isValidElement } from 'react';
import { ErrorState } from './error-state';
import { AccessDeniedState } from './access-denied-state';
import { EmptyState } from './empty-state';
import { Skeleton } from './skeleton';

export interface QueryStateWrapperProps<T> {
  isLoading: boolean;
  error: any | null;
  data: T | undefined;
  isEmpty: (data: T) => boolean;
  emptyProps?: {
    title?: string;
    description?: string;
    action?: ReactNode | { label: string; onClick: () => void; icon?: any };
  };
  loadingComponent?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryStateWrapper<T>({
  isLoading,
  error,
  data,
  isEmpty,
  emptyProps,
  loadingComponent,
  children,
}: QueryStateWrapperProps<T>) {
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="space-y-4 py-4 w-full">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
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
    const action = emptyProps?.action;
    // If the action is a raw React element (JSX), render it via a wrapper
    const emptyAction = action && isValidElement(action)
      ? undefined
      : action as ({ label: string; onClick: () => void; icon?: any } | undefined);

    return (
      <>
        <EmptyState
          title={emptyProps?.title || 'No data found'}
          description={emptyProps?.description || 'There is no data to display at this time.'}
          action={emptyAction}
        />
        {action && isValidElement(action) && (
          <div className="flex justify-center mt-4">{action}</div>
        )}
      </>
    );
  }

  return <>{children(data)}</>;
}
