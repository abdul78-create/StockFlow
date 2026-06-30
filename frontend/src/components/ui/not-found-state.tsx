import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function NotFoundState({
  title = 'Page not found',
  description = 'The page you are looking for does not exist or has been moved.',
  action,
  className,
}: NotFoundStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-24 text-center',
        className
      )}
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button className="mt-8" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
