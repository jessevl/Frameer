/**
 * @file DatePopover.tsx
 * @description The floating part of a date field: the month grid, with Today, Tomorrow and Next Monday above it when asked and a Clear button under it when the field can be emptied. A popover on a desktop, a sheet on a phone.
 * Used by: DateField, DateRangeFields.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { FloatingSurface } from '../FloatingSurface';
import { CalendarGrid } from './CalendarGrid';
import { addDays, nextMonday, type IsoDate } from './dates';
import { QUICK_BUTTON } from './fieldStyles';

interface DatePopoverProps {
  anchor: HTMLElement;
  label: string;
  value: IsoDate | null;
  onPick: (day: IsoDate) => void;
  onClose: () => void;
  today: IsoDate;
  min?: IsoDate;
  max?: IsoDate;
  quick?: boolean;
  onClear?: () => void;
  range?: { from: IsoDate | null; to: IsoDate | null };
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Shown above the grid (which end of a range is being picked). */
  children?: React.ReactNode;
}

export const DatePopover: React.FC<DatePopoverProps> = ({
  anchor, label, value, onPick, onClose, today, min, max, quick, onClear, range, weekStartsOn, locale, children,
}) => {
  const shortcuts = quick
    ? [
        { label: 'Today', day: today },
        { label: 'Tomorrow', day: addDays(today, 1) },
        { label: 'Next Monday', day: nextMonday(today) },
      ]
    : [];
  return (
    <FloatingSurface anchor={anchor} label={label} role="dialog" onClose={onClose} returnFocus={anchor} className="p-2">
      {children}
      {shortcuts.length > 0 ? (
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={(!!min && s.day < min) || (!!max && s.day > max)}
              onClick={() => onPick(s.day)}
              className={cn(
                QUICK_BUTTON,
                value === s.day
                  ? 'bg-[var(--coral-soft)] text-[var(--coral-ink)] shadow-[inset_0_0_0_1px_var(--coral-line)]'
                  : 'bg-[var(--paper-3)] text-[var(--ink)] enabled:hover:bg-[var(--active)]',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}
      <CalendarGrid
        value={value}
        onChange={onPick}
        today={today}
        min={min}
        max={max}
        range={range}
        weekStartsOn={weekStartsOn}
        locale={locale}
        autoFocus
      />
      {onClear && value ? (
        <button type="button" onClick={onClear} className={cn(QUICK_BUTTON, 'mt-2 w-full text-[var(--coral-ink)] hover:bg-[var(--hover)]')}>
          Clear
        </button>
      ) : null}
    </FloatingSurface>
  );
};
