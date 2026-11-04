/**
 * @file TimeRangeFields.tsx
 * @description From and To time fields side by side. Moving From moves To by the same length, so an hour-long event stays an hour long; To never ends before From (its list starts at From and shows each step's length, and an earlier time settles on From). A length that would run past midnight stops at 23:59: wall times stay inside one day, and the app decides about events that cross it.
 * Used by: apps' event panels and drag popovers.
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';
import { fromMinutes, toMinutes, type WallTime } from './dates';
import { TimeField } from './TimeField';

export interface TimeRange {
  from: WallTime | null;
  to: WallTime | null;
}

export interface TimeRangeFieldsProps extends TimeRange {
  onChange: (range: TimeRange) => void;
  step?: 5 | 10 | 15 | 30;
  labels?: { from: string; to: string };
  hideLabels?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

/** The range after From moved: To keeps its distance from From, held inside the day and never before From. */
export function moveRangeStart(range: TimeRange, nextFrom: WallTime | null): TimeRange {
  if (!nextFrom) return { from: null, to: range.to };
  if (!range.to) return { from: nextFrom, to: null };
  if (!range.from) return { from: nextFrom, to: range.to < nextFrom ? nextFrom : range.to };
  const length = Math.max(0, toMinutes(range.to) - toMinutes(range.from));
  return { from: nextFrom, to: fromMinutes(toMinutes(nextFrom) + length) };
}

/** The range after To moved: an end before the start settles on the start. */
export function moveRangeEnd(range: TimeRange, nextTo: WallTime | null): TimeRange {
  if (!nextTo || !range.from) return { from: range.from, to: nextTo };
  return { from: range.from, to: nextTo < range.from ? range.from : nextTo };
}

export const TimeRangeFields: React.FC<TimeRangeFieldsProps> = ({
  from, to, onChange, step, labels = { from: 'From', to: 'To' }, hideLabels = false, disabled = false, className, labelClassName,
}) => (
  <div className={cn('flex flex-wrap items-end gap-2', className)}>
    <TimeField
      className="w-[7.5rem] max-md:w-[8.5rem]"
      label={labels.from}
      hideLabel={hideLabels}
      labelClassName={labelClassName}
      value={from}
      step={step}
      disabled={disabled}
      onChange={(next) => onChange(moveRangeStart({ from, to }, next))}
    />
    <span aria-hidden="true" className="flex h-9 items-center text-[var(--ink-3)] max-md:h-11">
      –
    </span>
    <TimeField
      className="w-[7.5rem] max-md:w-[8.5rem]"
      label={labels.to}
      hideLabel={hideLabels}
      labelClassName={labelClassName}
      value={to}
      step={step}
      from={from}
      min={from}
      disabled={disabled}
      onChange={(next) => onChange(moveRangeEnd({ from, to }, next))}
    />
  </div>
);
