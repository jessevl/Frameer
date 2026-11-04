/**
 * @file CalendarGrid.tsx
 * @description A month grid for picking a day: a header whose month and year open a list of years, previous and next month buttons, and six weeks of days. Today is ringed, the chosen day is filled coral, a range is tinted and a marked day has a dot. Arrows move a day, Page Up and Page Down a month (with Shift a year), Home and End go to the ends of the week, Enter and Space choose.
 * Based on drift@d91d6950:frontend/src/features/tasks/ui/CalendarPicker.tsx (rewritten on ISO strings and Intl, without dayjs)
 *
 * The grid follows the ARIA grid pattern with one roving tab stop, so Tab leaves the month in one step. It draws the
 * grid only; DateField and DateRangeFields put it in a popover or a sheet, and an app can place it in a pane as a mini month.
 * Used by: DateField, DateRangeFields; apps (a mini month in a calendar pane).
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { ChromeIcon } from '../ChromeIcons';
import { addDays, addMonths, clampDate, formatDate, formatDayLong, monthDays, startOfMonth, startOfWeek, type IsoDate } from './dates';

export interface CalendarGridProps {
  /** The chosen day, or null. */
  value: IsoDate | null;
  onChange: (day: IsoDate) => void;
  /** Today in the app's time zone; the grid never reads the clock. */
  today: IsoDate;
  /** The month shown (any day in it); leave out to let the grid keep its own, starting at the value or today. */
  month?: IsoDate;
  onMonthChange?: (month: IsoDate) => void;
  min?: IsoDate;
  max?: IsoDate;
  /** 0 for Sunday, 1 for Monday (the default). */
  weekStartsOn?: 0 | 1;
  /** A span drawn tinted, its ends filled. */
  range?: { from: IsoDate | null; to: IsoDate | null };
  /** Days that get a dot (days with events, for example). */
  marked?: (day: IsoDate) => boolean;
  locale?: string;
  /** Move the focus to the chosen day (or today) when the grid appears, as a picker does when it opens. */
  autoFocus?: boolean;
  className?: string;
}

const NAV = 'flex h-7 w-7 items-center justify-center rounded-[var(--radius-glyph)] text-[var(--ink-2)] outline-none hover:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] disabled:opacity-40 disabled:hover:bg-transparent max-md:h-11 max-md:w-11';

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  value, onChange, today, month: monthProp, onMonthChange, min, max, weekStartsOn = 1, range, marked, locale = 'en-GB', autoFocus = false, className,
}) => {
  const titleId = useId();
  const [ownMonth, setOwnMonth] = useState(() => startOfMonth(clampDate(value ?? today, min, max)));
  const shown = startOfMonth(monthProp ?? ownMonth);
  const [focusDay, setFocusDay] = useState<IsoDate>(() => clampDate(value ?? today, min, max));
  const [years, setYears] = useState(false);
  const wantFocus = useRef(autoFocus);
  const grid = useRef<HTMLDivElement>(null);
  const yearList = useRef<HTMLDivElement>(null);

  const days = useMemo(() => monthDays(shown, weekStartsOn), [shown, weekStartsOn]);
  // The roving tab stop stays on a day of the month shown: the remembered day, else the value, today or the 1st.
  const active = [focusDay, value, today].find((d): d is IsoDate => !!d && startOfMonth(d) === shown) ?? clampDate(shown, min, max);

  const setMonth = (next: IsoDate) => {
    const m = startOfMonth(next);
    if (monthProp === undefined) setOwnMonth(m);
    if (m !== shown) onMonthChange?.(m);
  };

  const moveTo = (day: IsoDate) => {
    const d = clampDate(day, min, max);
    setFocusDay(d);
    if (startOfMonth(d) !== shown) setMonth(d);
    wantFocus.current = true;
  };

  useEffect(() => {
    if (!wantFocus.current || years) return;
    wantFocus.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-day="${active}"]`)?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (!years) return;
    const current = yearList.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    current?.scrollIntoView?.({ block: 'center' });
    current?.focus({ preventScroll: true });
  }, [years]);

  const outside = (d: IsoDate) => (!!min && d < min) || (!!max && d > max);
  const choose = (d: IsoDate) => {
    if (outside(d)) return;
    setFocusDay(d);
    onChange(d);
  };

  const onDayKey = (e: React.KeyboardEvent, d: IsoDate) => {
    const moves: Record<string, () => IsoDate> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      PageUp: () => addMonths(d, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, e.shiftKey ? 12 : 1),
      Home: () => startOfWeek(d, weekStartsOn),
      End: () => addDays(startOfWeek(d, weekStartsOn), 6),
    };
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      moveTo(move());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(d);
    }
  };

  const weekdays = useMemo(
    // 7 January 2024 was a Sunday.
    () => Array.from({ length: 7 }, (_, i) => addDays('2024-01-07', weekStartsOn + i)).map((d) => ({
      short: formatDate(d, { weekday: 'narrow' }, locale),
      long: formatDate(d, { weekday: 'long' }, locale),
    })),
    [weekStartsOn, locale],
  );

  const prev = addMonths(shown, -1);
  const next = addMonths(shown, 1);
  const prevDisabled = !!min && addDays(shown, -1) < min;
  const nextDisabled = !!max && next > max;
  const title = formatDate(shown, { month: 'long', year: 'numeric' }, locale);
  const thisYear = Number(today.slice(0, 4));
  const firstYear = Math.max(min ? Number(min.slice(0, 4)) : thisYear - 100, 1);
  const lastYear = max ? Number(max.slice(0, 4)) : thisYear + 10;
  const shownYear = Number(shown.slice(0, 4));

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  const inRange = (d: IsoDate) => !!range?.from && !!range.to && d >= range.from && d <= range.to;
  const isEnd = (d: IsoDate) => d === range?.from || d === range?.to;

  return (
    <div className={cn('w-[248px] max-md:w-full', className)}>
      <div className="mb-1 flex items-center justify-between gap-1 px-0.5">
        <button
          type="button"
          id={titleId}
          aria-expanded={years}
          onClick={() => {
            if (years) wantFocus.current = true;
            setYears(!years);
          }}
          className="flex h-7 items-center gap-1 rounded-[var(--radius-glyph)] px-1.5 text-[13px] font-semibold text-[var(--ink)] outline-none hover:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] max-md:h-11 max-md:text-base"
        >
          {title}
          <ChromeIcon name="chevronDown" size={12} strokeWidth={2} aria-hidden="true" className={cn('text-[var(--ink-3)] transition-transform', years && 'rotate-180')} />
        </button>
        {years ? null : (
          <span className="flex items-center gap-0.5">
            <button type="button" aria-label="Previous month" disabled={prevDisabled} onClick={() => setMonth(prev)} className={NAV}>
              <ChromeIcon name="chevronLeft" size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next month" disabled={nextDisabled} onClick={() => setMonth(next)} className={NAV}>
              <ChromeIcon name="chevronRight" size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </span>
        )}
      </div>

      {years ? (
        <div ref={yearList} role="group" aria-label="Years" className="grid max-h-[232px] grid-cols-4 gap-1 overflow-y-auto p-0.5">
          {Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i).map((y) => (
            <button
              key={y}
              type="button"
              aria-pressed={y === shownYear}
              onClick={() => {
                const day = clampDate(addMonths(active, (y - shownYear) * 12), min, max);
                setFocusDay(day);
                setMonth(day);
                setYears(false);
                wantFocus.current = true;
              }}
              className={cn(
                'h-8 rounded-[var(--radius-glyph)] text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] max-md:h-11',
                y === shownYear ? 'bg-[var(--coral-strong)] text-white' : 'text-[var(--ink)] hover:bg-[var(--hover)]',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      ) : (
        <div ref={grid} role="grid" aria-labelledby={titleId} className="flex flex-col gap-0.5">
          <div role="row" className="grid grid-cols-7">
            {weekdays.map((d) => (
              <div key={d.long} role="columnheader" className="py-0.5 text-center text-[10px] font-semibold uppercase text-[var(--ink-2)] max-md:text-xs">
                <span aria-hidden="true">{d.short}</span>
                <span className="sr-only">{d.long}</span>
              </div>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week[0]} role="row" className="grid grid-cols-7 gap-0.5">
              {week.map((d) => {
                const inMonth = startOfMonth(d) === shown;
                const chosen = d === value || (inRange(d) && isEnd(d));
                const tinted = !chosen && inRange(d);
                const off = outside(d);
                return (
                  <div key={d} role="gridcell" aria-selected={chosen} className="flex justify-center">
                    <button
                      type="button"
                      data-day={d}
                      tabIndex={d === active ? 0 : -1}
                      disabled={off}
                      aria-label={formatDayLong(d, locale)}
                      aria-current={d === today ? 'date' : undefined}
                      onClick={() => choose(d)}
                      onKeyDown={(e) => onDayKey(e, d)}
                      onFocus={() => d !== focusDay && setFocusDay(d)}
                      className={cn(
                        'relative flex aspect-square w-full items-center justify-center rounded-[var(--radius-glyph)] text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] max-md:min-h-11 max-md:text-sm',
                        chosen
                          ? 'bg-[var(--coral-strong)] text-white'
                          : cn(
                              tinted ? 'bg-[var(--coral-soft)]' : 'enabled:hover:bg-[var(--hover)]',
                              d === today && 'shadow-[inset_0_0_0_1px_var(--line-2)]',
                              inMonth ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]',
                            ),
                        off && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      {Number(d.slice(8))}
                      {marked?.(d) ? (
                        <span aria-hidden="true" className={cn('absolute bottom-[3px] h-1 w-1 rounded-full', chosen ? 'bg-white' : 'bg-[var(--ink-3)]')} />
                      ) : null}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
