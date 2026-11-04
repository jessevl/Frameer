/**
 * @file TimeField.tsx
 * @description A labelled field for a time of day that takes what people type ("830", "8:30", "8.30", "8pm") and settles on blur to `HH:MM`, with a list of steps below it scrolled to the value. With `from` (the start of a range) each step shows its length ("09:30 · 1 h 30"). A value it cannot read says so under the field and is not saved.
 * Based on drift@d91d6950:frontend/src/features/tasks/properties/TimePanel.tsx (behaviour; rewritten without a native time input)
 *
 * The input is an ARIA combobox: the list is its listbox, Arrow keys move through it, Enter takes the step or the typed
 * text, Escape closes the list (and only the list). A press in the list keeps the focus in the input.
 * Used by: TimeRangeFields, DateTimeField; apps' forms.
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@frameer/lib/design-system';
import { FloatingSurface } from '../FloatingSurface';
import { formatLength, fromMinutes, parseTime, toMinutes, type WallTime } from './dates';
import { FIELD_BOX, FIELD_ERROR, FIELD_LABEL } from './fieldStyles';

export interface TimeFieldProps {
  value: WallTime | null;
  onChange: (time: WallTime | null) => void;
  label: string;
  hideLabel?: boolean;
  /** Minutes between the steps of the list (default 15). */
  step?: 5 | 10 | 15 | 30;
  /** The start of a range: the list begins there and shows each step's length from it. */
  from?: WallTime | null;
  /** The earliest time; earlier steps are left out and an earlier typed time settles on it. */
  min?: WallTime | null;
  /** An empty field sets the value to null; without it, emptying the field brings the value back. */
  clearable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** What an unreadable value says under the field. */
  invalidText?: string;
  id?: string;
  className?: string;
  labelClassName?: string;
}

const DAY = 24 * 60;

export const TimeField: React.FC<TimeFieldProps> = ({
  value, onChange, label, hideLabel = false, step = 15, from = null, min = null, clearable = false, disabled = false,
  placeholder = '--:--', invalidText = 'Type a time such as 8:30 or 8pm.', id, className, labelClassName,
}) => {
  const uid = useId();
  const inputId = id ?? `${uid}-input`;
  const listId = `${uid}-list`;
  const errorId = `${uid}-error`;
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(value ?? '');
  const [editing, setEditing] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Outside editing the field shows the value; a change from outside (moving the start of a range) shows at once.
  useEffect(() => {
    if (!editing) {
      setText(value ?? '');
      setInvalid(false);
    }
  }, [value, editing]);

  const floor = Math.max(from ? toMinutes(from) : 0, min ? toMinutes(min) : 0);
  const steps = useMemo(() => {
    const out: WallTime[] = [];
    const first = from ? toMinutes(from) : Math.ceil(floor / step) * step;
    for (let m = Math.max(first, floor); m < DAY; m += step) out.push(fromMinutes(m));
    return out;
  }, [from, floor, step]);

  const nearest = (time: WallTime | null) => {
    if (!time) return 0;
    const at = steps.findIndex((s) => s >= time);
    return at >= 0 ? at : steps.length - 1;
  };

  const openList = () => {
    if (disabled) return;
    setActive(nearest(parseTime(text) ?? value));
    setOpen(true);
  };

  useEffect(() => {
    if (open && active >= 0) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'center' });
  }, [open, active]);

  const commit = (time: WallTime | null) => {
    setEditing(false);
    setInvalid(false);
    setText(time ?? '');
    if (time !== value) onChange(time);
  };

  /** Reads the typed text: a time is held at `min`, an empty field clears or reverts, anything else is flagged. */
  const settle = () => {
    const typed = text.trim();
    if (typed === '') {
      if (clearable) commit(null);
      else commit(value);
      return;
    }
    const time = parseTime(typed);
    if (!time) {
      setInvalid(true);
      return;
    }
    commit(min && time < min ? min : time);
  };

  const pick = (time: WallTime) => {
    setOpen(false);
    commit(time);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openList();
      // Moving through the list writes the step into the field, so Enter, Tab and a click elsewhere all keep it.
      const next = Math.max(0, Math.min(steps.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
      const time = steps[next];
      if (!time) return;
      setActive(next);
      setEditing(true);
      setInvalid(false);
      setText(time);
    } else if (e.key === 'Enter') {
      if (!open && !editing) return;
      e.preventDefault();
      setOpen(false);
      settle();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const length = (time: WallTime) => (from ? ` · ${formatLength(toMinutes(time) - toMinutes(from))}` : '');

  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <label htmlFor={inputId} className={hideLabel ? 'sr-only' : cn(FIELD_LABEL, labelClassName)}>
        {label}
      </label>
      <input
        ref={input}
        id={inputId}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="none"
        aria-activedescendant={open && active >= 0 ? `${uid}-o${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setEditing(true);
          setInvalid(false);
          setText(e.target.value);
          const typed = parseTime(e.target.value);
          if (open && typed) setActive(nearest(typed));
        }}
        onClick={() => !open && openList()}
        onBlur={() => {
          setOpen(false);
          if (editing) settle();
        }}
        onKeyDown={onKeyDown}
        className={cn(FIELD_BOX, 'w-full font-mono tabular-nums placeholder:text-[var(--ink-2)]', invalid && 'border-[var(--color-danger-fg)]')}
      />
      {invalid ? (
        <p id={errorId} role="alert" className={FIELD_ERROR}>
          {invalidText}
        </p>
      ) : null}
      {open && input.current ? (
        <FloatingSurface anchor={input.current} label={label} role="listbox" id={listId} onClose={() => setOpen(false)} sheetOnPhone={false} keepFocus className="max-h-60 p-1">
          <div ref={list}>
            {steps.map((s, i) => (
              <div
                key={s}
                id={`${uid}-o${i}`}
                data-index={i}
                role="option"
                aria-selected={s === value}
                onMouseMove={() => active !== i && setActive(i)}
                onClick={() => pick(s)}
                className={cn(
                  'cursor-pointer whitespace-nowrap rounded-[var(--radius-tree)] px-2.5 py-1.5 font-mono text-[13px] tabular-nums text-[var(--ink)] max-md:py-2.5 max-md:text-base',
                  active === i && 'bg-[var(--hover)]',
                  s === value && 'font-semibold text-[var(--coral-ink)]',
                )}
              >
                {s}
                {from ? <span className="font-sans text-[var(--ink-2)]">{length(s)}</span> : null}
              </div>
            ))}
          </div>
        </FloatingSurface>
      ) : null}
    </div>
  );
};
