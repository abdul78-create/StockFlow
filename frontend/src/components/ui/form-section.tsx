import * as React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups related form fields into a named section with a title, optional
 * description, and a visual separator. Use this to break long forms into
 * scannable chunks: General, Pricing, Inventory, Advanced, etc.
 */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Span full width inside a FormSection grid */
export function FormSectionFullWidth({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('sm:col-span-2', className)}>{children}</div>;
}
