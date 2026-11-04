/**
 * @file DateField.tsx
 * @description A labelled field for one day: a button that reads "Tue 10 Nov" (with the year when it is not this year) and opens the month grid in a popover, or a sheet on a phone. With `quick` the popover offers Today, Tomorrow and Next Monday; with `clearable` it can be emptied.
 * Why a button and not `<input type="date">`: the native input looks different in every browser, cannot be themed and shows the locale's numeric format; this reads like the rest of the suite.
 * Used by: apps' forms and panels; DateTimeField.
 */
import React, { useId, useRef, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { ChromeIcon } from '../ChromeIcons';
import { DatePopover } from './DatePopover';
import { formatDayShort, type IsoDate } from './dates';
import { FIELD_BOX, FIELD_LABEL } from './fieldStyles';

export interface DateFieldProps {
  value: IsoDate | null;
  onChange: (day: IsoDate | null) => void;
  label: string;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  /** Today in the app's time zone. */
  today: IsoDate;
  min?: IsoDate;
  max?: IsoDate;
  /** Offer Today, Tomorrow and Next Monday above the grid. */
  quick?: boolean;
  /** Offer Clear, which sets the value to null. */
  clearable?: boolean;
  disabled?: boolean;
  /** The text of an empty field (default "Choose a day"). */
  placeholder?: string;
  weekStartsOn?: 0 | 1;
  locale?: string;
  id?: string;
  className?: string;
  labelClassName?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  value, onChange, label, hideLabel = false, today, min, max, quick = false, clearable = false, disabled = false,
  placeholder = 'Choose a day', weekStartsOn, locale, id, className, labelClassName,
}) => {
  const uid = useId();
  const buttonId = id ?? `${uid}-field`;
  const labelId = `${uid}-label`;
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const pick = (day: IsoDate | null) => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
    if (day !== value) onChange(day);
  };

  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      {/* A span, not a label element: a label would replace the day in the button's name ("Day Tue 10 Nov"). */}
      <span id={labelId} className={hideLabel ? 'sr-only' : cn(FIELD_LABEL, labelClassName)}>
        {label}
      </span>
      <button
        ref={button}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-labelledby={`${labelId} ${buttonId}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(FIELD_BOX, 'w-full text-left')}
      >
        <ChromeIcon name="calendarDays" size={15} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-[var(--ink-2)]" />
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-[var(--ink-3)]')}>
          {value ? formatDayShort(value, today, locale) : placeholder}
        </span>
      </button>
      {open && button.current ? (
        <DatePopover
          anchor={button.current}
          label={label}
          value={value}
          onPick={pick}
          onClose={close}
          today={today}
          min={min}
          max={max}
          quick={quick}
          onClear={clearable ? () => pick(null) : undefined}
          weekStartsOn={weekStartsOn}
          locale={locale}
        />
      ) : null}
    </div>
  );
};
