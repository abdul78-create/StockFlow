import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center min-h-[250px] border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5', className)} role="alert">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-8 ring-destructive/5">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2 rounded-full shadow-sm">
          <RefreshCw className="size-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
