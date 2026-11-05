/**
 * @file Segmented.tsx
 * @description A short row of exclusive choices drawn as one pill: a radio group of real buttons, the chosen one on a quiet fill. Choosing saves at once, so there is no form around it. The arrow keys move the choice (the group is one tab stop), Home and End jump. With `iconOnly` each option is a square icon button whose label is its accessible name and its tooltip, so an icon is never anonymous.
 * Based on harbour@feat/m5.5:frontend/src/ui/Segmented.tsx and yard@36ea4be:frontend/src/shell/ThemeChoice.tsx (the look)
 * Used by: ThemeChoice; settings rows and toolbars with two to five exclusive choices.
 */
import React, { useRef } from 'react';
import { cn } from '@frameer/lib/design-system';
import { LineIcon, type LineName } from '@frameer/icons/LineIcon';

export interface SegmentedOption<T extends string = string> {
  id: T;
  label: string;
  /** One of the suite's line icons. */
  line?: LineName;
  /** Any other icon node; `line` wins when both are set. */
  icon?: React.ReactNode;
}

export interface SegmentedProps<T extends string = string> {
  /** The group's accessible name ("Theme"). */
  label: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (id: T) => void;
  /** Show only the icons; the label stays as the accessible name and the tooltip. Needs `line` or `icon` on every option. */
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Segmented<T extends string = string>({ label, options, value, onChange, iconOnly = false, disabled = false, className }: SegmentedProps<T>) {
  const group = useRef<HTMLDivElement>(null);

  const choose = (index: number) => {
    const option = options[(index + options.length) % options.length];
    if (!option) return;
    group.current?.querySelectorAll<HTMLElement>('[role="radio"]')[(index + options.length) % options.length]?.focus();
    if (option.id !== value) onChange(option.id);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const at = options.findIndex((o) => o.id === value);
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (step !== 0) choose(at + step);
    else if (e.key === 'Home') choose(0);
    else if (e.key === 'End') choose(options.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={disabled ? undefined : onKeyDown}
      className={cn('inline-flex h-[var(--toolbar-btn,2rem)] items-center gap-0.5 rounded-full border border-[var(--line-2)] p-0.5', className)}
    >
      {options.map((option) => {
        const on = option.id === value;
        const glyph = option.line ? <LineIcon name={option.line} size={14} inherit /> : option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            disabled={disabled}
            tabIndex={on || !options.some((o) => o.id === value) ? 0 : -1}
            onClick={() => !on && onChange(option.id)}
            className={cn(
              'flex h-full flex-1 items-center justify-center gap-1.5 rounded-full text-[12.5px] font-medium outline-none disabled:opacity-60',
              'focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]',
              iconOnly ? 'aspect-square flex-none px-0 pointer-coarse:min-w-9' : 'px-2.5',
              on ? 'bg-[var(--paper-3)] font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)] enabled:hover:bg-[var(--hover)] enabled:hover:text-[var(--ink)]',
            )}
          >
            {glyph ? (
              <span aria-hidden="true" className="flex h-3.5 w-3.5 items-center justify-center">
                {glyph}
              </span>
            ) : null}
            {iconOnly ? null : option.label}
          </button>
        );
      })}
    </div>
  );
}
