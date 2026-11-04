/**
 * @file DateRangeFields.tsx
 * @description From and To date fields that share one month grid showing the range. Picking From moves To by the same number of days, so a three-day stay stays three days, and then goes on to To; To cannot be set before From.
 * Used by: apps' forms for spans of days (care absences, holidays, multi-day events).
 */
import React, { useId, useRef, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { ChromeIcon } from '../ChromeIcons';
import { DatePopover } from './DatePopover';
import { addDays, daysBetween, formatDayShort, type IsoDate } from './dates';
import { FIELD_BOX, FIELD_LABEL } from './fieldStyles';

export interface DateRange {
  from: IsoDate | null;
  to: IsoDate | null;
}

export interface DateRangeFieldsProps extends DateRange {
  onChange: (range: DateRange) => void;
  /** Today in the app's time zone. */
  today: IsoDate;
  labels?: { from: string; to: string };
  hideLabels?: boolean;
  min?: IsoDate;
  max?: IsoDate;
  disabled?: boolean;
  placeholder?: string;
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
  labelClassName?: string;
}

/** The range after From moved: To keeps its distance from From (and is never before it). */
export function moveDateRangeStart(range: DateRange, nextFrom: IsoDate): DateRange {
  if (!range.to) return { from: nextFrom, to: null };
  if (!range.from) return { from: nextFrom, to: range.to < nextFrom ? nextFrom : range.to };
  return { from: nextFrom, to: addDays(nextFrom, Math.max(0, daysBetween(range.from, range.to))) };
}

type End = 'from' | 'to';

export const DateRangeFields: React.FC<DateRangeFieldsProps> = ({
  from, to, onChange, today, labels = { from: 'From', to: 'To' }, hideLabels = false, min, max, disabled = false,
  placeholder = 'Choose a day', weekStartsOn, locale, className, labelClassName,
}) => {
  const uid = useId();
  const buttons = { from: useRef<HTMLButtonElement>(null), to: useRef<HTMLButtonElement>(null) };
  const [editing, setEditing] = useState<End | null>(null);

  const pick = (end: End, day: IsoDate) => {
    if (end === 'from') {
      onChange(moveDateRangeStart({ from, to }, day));
      // Go on to the end of the range, as a person picking a span expects.
      setEditing('to');
      return;
    }
    setEditing(null);
    buttons.to.current?.focus({ preventScroll: true });
    onChange({ from, to: from && day < from ? from : day });
  };

  const field = (end: End) => {
    const value = end === 'from' ? from : to;
    const labelId = `${uid}-${end}-label`;
    const buttonId = `${uid}-${end}`;
    return (
      <div className="flex min-w-0 flex-col">
        <span id={labelId} className={hideLabels ? 'sr-only' : cn(FIELD_LABEL, labelClassName)}>
          {labels[end]}
        </span>
        <button
          ref={buttons[end]}
          id={buttonId}
          type="button"
          disabled={disabled}
          aria-labelledby={`${labelId} ${buttonId}`}
          aria-haspopup="dialog"
          aria-expanded={editing === end}
          onClick={() => setEditing(editing === end ? null : end)}
          className={cn(FIELD_BOX, 'w-[9.5rem] text-left', editing === end && 'border-[var(--coral-line)]')}
        >
          <ChromeIcon name="calendarDays" size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-[var(--ink-2)]" />
          <span className={cn('min-w-0 flex-1 truncate', !value && 'text-[var(--ink-2)]')}>{value ? formatDayShort(value, today, locale) : placeholder}</span>
        </button>
      </div>
    );
  };

  const anchor = editing ? buttons[editing].current : null;

  return (
    <div className={cn('flex flex-wrap items-end gap-2', className)}>
      {field('from')}
      <span aria-hidden="true" className="flex h-9 items-center text-[var(--ink-3)] max-md:h-11">
        –
      </span>
      {field('to')}
      {editing && anchor ? (
        <DatePopover
          key={editing}
          anchor={anchor}
          label={labels[editing]}
          value={editing === 'from' ? from : to}
          onPick={(day) => pick(editing, day)}
          onClose={() => setEditing(null)}
          today={today}
          min={editing === 'to' && from ? from : min}
          max={max}
          range={{ from, to }}
          weekStartsOn={weekStartsOn}
          locale={locale}
        />
      ) : null}
    </div>
  );
};
