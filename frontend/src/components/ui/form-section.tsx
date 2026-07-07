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
    <div className={cn('space-y-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 shadow-sm', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Separator className="bg-border/50" />
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Span full width inside a FormSection grid */
export function FormSectionFullWidth({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('sm:col-span-2', className)}>{children}</div>;
}
