import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 text-xs',
  md: 'h-9 text-sm',
  lg: 'h-10 text-sm',
} as const;

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  size = 'md',
  className,
  ...props
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useKeyboardShortcut('/', (e) => {
    inputRef.current?.focus();
  });

  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 shadow-sm transition-colors duration-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          sizeClasses[size]
        )}
        aria-label={placeholder}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors duration-normal hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          /
        </div>
      )}
    </div>
  );
}
