/**
 * @file DateTimeField.tsx
 * @description A day and a time as one labelled control (a date field and a time field side by side, in one group), for moments such as Send later or the end of a shared link. It reports a value only once both halves are set; with `min` the days before it are closed and, on its day, the earlier times.
 * Used by: apps' forms for one moment in time.
 */
import React, { useId, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { DateField } from './DateField';
import type { IsoDate, WallTime } from './dates';
import { FIELD_LABEL } from './fieldStyles';
import { TimeField } from './TimeField';

export interface DateTimeValue {
  date: IsoDate;
  time: WallTime;
}

export interface DateTimeFieldProps {
  value: DateTimeValue | null;
  onChange: (value: DateTimeValue | null) => void;
  label: string;
  hideLabel?: boolean;
  /** Today in the app's time zone. */
  today: IsoDate;
  /** The earliest moment (now, for Send later). */
  min?: DateTimeValue;
  step?: 5 | 10 | 15 | 30;
  /** Offer Clear in the day's popover, which sets the value to null. */
  clearable?: boolean;
  disabled?: boolean;
  /** The names of the two halves for screen readers (default "Day" and "Time"). */
  partLabels?: { date: string; time: string };
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
  labelClassName?: string;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  value, onChange, label, hideLabel = false, today, min, step, clearable = false, disabled = false,
  partLabels = { date: 'Day', time: 'Time' }, weekStartsOn, locale, className, labelClassName,
}) => {
  const labelId = useId();
  // A half set before the other one is kept here until the value is whole.
  const [draft, setDraft] = useState<{ date: IsoDate | null; time: WallTime | null }>({ date: value?.date ?? null, time: value?.time ?? null });

  const shown = value ? { date: value.date, time: value.time } : draft;

  const update = (next: { date: IsoDate | null; time: WallTime | null }) => {
    let time = next.time;
    // A day equal to the earliest one pulls an earlier time up to it.
    if (min && next.date === min.date && time && time < min.time) time = min.time;
    setDraft({ date: next.date, time });
    if (next.date && time) {
      if (next.date !== value?.date || time !== value?.time) onChange({ date: next.date, time });
    } else if (value) {
      onChange(null);
    }
  };

  return (
    <div role="group" aria-labelledby={labelId} className={cn('flex min-w-0 flex-col', className)}>
      <span id={labelId} className={hideLabel ? 'sr-only' : cn(FIELD_LABEL, labelClassName)}>
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <DateField
          className="w-[10rem]"
          label={partLabels.date}
          hideLabel
          value={shown.date}
          today={today}
          min={min?.date}
          clearable={clearable}
          disabled={disabled}
          weekStartsOn={weekStartsOn}
          locale={locale}
          onChange={(date) => update({ ...shown, date })}
        />
        <TimeField
          className="w-[6.5rem] max-md:w-[7.5rem]"
          label={partLabels.time}
          hideLabel
          value={shown.time}
          step={step}
          min={min && shown.date === min.date ? min.time : null}
          disabled={disabled}
          onChange={(time) => update({ ...shown, time })}
        />
      </div>
    </div>
  );
};
