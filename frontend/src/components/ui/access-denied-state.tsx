import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AccessDeniedState({
  title = 'Access denied',
  description = 'You do not have permission to view this resource.',
  action,
  className,
}: AccessDeniedStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-24 text-center',
        className
      )}
      role="alert"
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button className="mt-8" variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
