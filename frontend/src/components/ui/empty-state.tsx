import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-gradient-to-b from-card/30 to-card/10 px-6 py-16 text-center transition-all duration-300 hover:border-border hover:bg-card/40',
        className
      )}
      role="status"
    >
      {Icon && (
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5">
          <Icon className="size-6 text-primary/80" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button
          className="mt-6"
          onClick={action.onClick}
          icon={action.icon ? <action.icon /> : undefined}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
