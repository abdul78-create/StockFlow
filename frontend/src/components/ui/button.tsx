import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'select-none cursor-pointer',
    // Focus
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
    // Active micro-interaction (overridden per-variant for better control)
    'active:scale-[0.97]',
    // Transition (all states)
    'transition-all duration-200 ease-out-in',
    // Icon handling
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-sm',
          'hover:bg-primary/90 hover:shadow-md',
          'active:bg-primary/80 active:shadow-none',
        ].join(' '),
        secondary: [
          'bg-secondary text-foreground shadow-sm border border-border/60',
          'hover:bg-accent hover:border-border',
          'active:bg-accent/80',
        ].join(' '),
        outline: [
          'border border-border bg-background shadow-xs text-foreground',
          'hover:bg-accent hover:border-border/80',
          'active:bg-accent/80',
        ].join(' '),
        ghost: [
          'text-foreground',
          'hover:bg-accent',
          'active:bg-accent/70',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground shadow-sm',
          'hover:bg-destructive/90 hover:shadow-md',
          'active:bg-destructive/80',
        ].join(' '),
        link: [
          'text-foreground underline-offset-4',
          'hover:underline hover:text-primary',
        ].join(' '),
        success: [
          'bg-emerald-600 text-white shadow-sm',
          'hover:bg-emerald-700 hover:shadow-md',
          'active:bg-emerald-800',
          'dark:bg-emerald-500 dark:hover:bg-emerald-600',
        ].join(' '),
      },
      size: {
        xs: 'h-7 rounded-md px-2.5 text-xs',
        sm: 'h-8 rounded-lg px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-lg px-6',
        xl: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7 rounded-md',
        'icon-lg': 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
