import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';

export interface DatePickerProps {
  value?: string | null; // Format: YYYY-MM-DD
  onChange?: (value: string) => void;
  onClear?: () => void;
  error?: string;
  label?: string;
  hint?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ className, value, onChange, onClear, error, label, hint, min, max, disabled }, ref) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    // Sync input string when value changes externally
    React.useEffect(() => {
      if (value) {
        const date = parse(value, 'yyyy-MM-dd', new Date());
        if (isValid(date)) {
          setInputValue(format(date, 'yyyy-MM-dd'));
          return;
        }
      }
      setInputValue('');
    }, [value]);

    const selectedDate = React.useMemo(() => {
      if (!value) return undefined;
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(parsed) ? parsed : undefined;
    }, [value]);

    const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : undefined;
    const maxDate = max ? parse(max, 'yyyy-MM-dd', new Date()) : undefined;

    const handleSelectDay = (day: Date | undefined) => {
      if (!day) return;
      const formatted = format(day, 'yyyy-MM-dd');
      setInputValue(formatted);
      onChange?.(formatted);
      setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      // Try parsing if complete date is typed
      if (val.length === 10) {
        const parsed = parse(val, 'yyyy-MM-dd', new Date());
        if (isValid(parsed)) {
          // Check limits
          if (minDate && parsed < minDate) return;
          if (maxDate && parsed > maxDate) return;
          onChange?.(val);
        }
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setInputValue('');
      if (onClear) onClear();
      else onChange?.('');
    };

    return (
      <div ref={ref} className={cn('w-full space-y-1.5', className)}>
        {label && (
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {label}
          </label>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="YYYY-MM-DD"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              className={cn(
                'pl-9 pr-8 h-9 border-white/10 bg-slate-950/50 text-white placeholder:text-slate-655',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className="absolute left-3 text-slate-400 hover:text-white transition-colors"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </PopoverTrigger>

            {inputValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <PopoverContent className="w-auto p-3 bg-slate-900 border-white/5 shadow-2xl rounded-xl z-50">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDay}
              disabled={
                (date) => (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)
              }
              className="text-white text-xs font-sans"
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-between pt-1 items-center relative px-2',
                caption_label: 'text-xs font-semibold text-white',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-6 w-6 bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center justify-center transition-colors',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex justify-between',
                head_cell: 'text-slate-400 rounded-md w-8 font-normal text-[10px] uppercase tracking-wider text-center',
                row: 'flex w-full mt-1 justify-between',
                cell: 'text-center text-xs relative p-0 focus-within:relative focus-within:z-20',
                day: 'h-8 w-8 p-0 font-medium text-slate-300 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center',
                day_selected: 'bg-white text-slate-950 hover:bg-slate-200 focus:bg-white focus:text-slate-950 font-bold',
                day_today: 'border border-white/20 text-white',
                day_outside: 'text-slate-600 opacity-50',
                day_disabled: 'text-slate-600 opacity-30 cursor-not-allowed hover:bg-transparent',
              } as any}
            />
          </PopoverContent>
        </Popover>

        {hint && !error && (
          <p className="text-[11px] text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
