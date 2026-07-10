import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  value?: number | string | null;
  defaultValue?: number | string | null;
  onChange?: (value: number | null) => void;
  onValueChange?: (value: number | null) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Decimal precision (default: 2) */
  precision?: number;
  /** Prefix symbol shown inside left of input (e.g. "$") */
  prefix?: string;
  /** Suffix symbol shown inside right of input (e.g. "%") */
  suffix?: string;
  /** Show thousands separators in display */
  thousands?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Hint text below input */
  hint?: string;
  /** Allow negative values */
  allowNegative?: boolean;
  /** Step value */
  step?: number;
  className?: string;
}

function formatDisplay(
  num: number | null,
  precision: number,
  thousands: boolean
): string {
  if (num === null || isNaN(num)) return '';
  if (thousands) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    });
  }
  return precision > 0 ? num.toFixed(precision) : String(num);
}

function parseValue(str: string): number | null {
  // Remove thousands separators and non-numeric chars except . and -
  const cleaned = str.replace(/,/g, '').replace(/[^\d.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      min,
      max,
      precision = 2,
      prefix,
      suffix,
      thousands = false,
      error,
      label,
      hint,
      allowNegative = false,
      step,
      className,
      id,
      placeholder,
      disabled,
      readOnly,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    // Controlled vs uncontrolled
    const isControlled = value !== undefined;

    const numericValue: number | null = React.useMemo(() => {
      const raw = isControlled ? value : defaultValue;
      if (raw === null || raw === undefined || raw === '') return null;
      const n = Number(raw);
      return isNaN(n) ? null : n;
    }, [isControlled, value, defaultValue]);

    // Internal display string
    const [displayValue, setDisplayValue] = React.useState<string>(
      () => (numericValue !== null ? formatDisplay(numericValue, precision, false) : '')
    );
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync display when controlled value changes externally (not while typing)
    React.useEffect(() => {
      if (isControlled && !isFocused) {
        setDisplayValue(
          numericValue !== null ? formatDisplay(numericValue, precision, false) : ''
        );
      }
    }, [numericValue, isControlled, isFocused, precision]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Select all on focus — user starts typing immediately
      e.target.select();
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      let parsed = parseValue(displayValue);

      // Clamp to min/max
      if (parsed !== null) {
        if (!allowNegative && parsed < 0) parsed = 0;
        if (min !== undefined && parsed < min) parsed = min;
        if (max !== undefined && parsed > max) parsed = max;
      }

      const formatted =
        parsed !== null ? formatDisplay(parsed, precision, thousands) : '';
      setDisplayValue(formatted);

      onChange?.(parsed);
      onValueChange?.(parsed);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow typing freely (partial input like "1.", "-", "")
      // Only reject clearly invalid characters
      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw.replace(/,/g, ''))) return;

      setDisplayValue(raw);

      // Fire live change with parsed value
      const parsed = parseValue(raw);
      if (!isControlled) {
        // uncontrolled: just keep display in sync
      }
      onChange?.(parsed);
      onValueChange?.(parsed);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Arrow up/down to increment/decrement
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const parsed = parseValue(displayValue) ?? 0;
        const next = parsed + (step ?? 1);
        const clamped = max !== undefined ? Math.min(next, max) : next;
        setDisplayValue(formatDisplay(clamped, precision, false));
        onChange?.(clamped);
        onValueChange?.(clamped);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const parsed = parseValue(displayValue) ?? 0;
        const next = parsed - (step ?? 1);
        const clamped = min !== undefined ? Math.max(next, min) : next;
        if (!allowNegative && clamped < 0) return;
        setDisplayValue(formatDisplay(clamped, precision, false));
        onChange?.(clamped);
        onValueChange?.(clamped);
      }
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="pointer-events-none absolute left-3 select-none text-sm text-muted-foreground">
              {prefix}
            </span>
          )}
          <input
            {...props}
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={displayValue}
            placeholder={placeholder ?? (precision > 0 ? '0.00' : '0')}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete="off"
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-background text-sm shadow-xs',
              'transition-all duration-150',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              prefix ? 'pl-7' : 'px-3',
              suffix ? 'pr-8' : 'pr-3',
              'py-1',
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 select-none text-sm text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
NumericInput.displayName = 'NumericInput';

export { NumericInput };
