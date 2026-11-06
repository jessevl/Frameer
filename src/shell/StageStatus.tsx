/**
 * @file StageStatus.tsx
 * @description The quiet status line in its own strip at the foot of a stage ("23 events · 6 of 7 dinners planned"): the parts are separated by dots, an optional trailing slot holds key hints, and the parts are one polite live region so a change is heard. The strip is a row of the stage, never an overlay, so it does not cover content. The words, and when to hold back, stay in the app: pass no parts and no children and it renders nothing.
 * @app SHARED - Generic: knows nothing about any app's counts.
 * Used by: the app shells' stages (Drift's StageHints, Harbour's three status lines, Lighthouse's StatusLine).
 */
import React from 'react';
import { cn } from '@frameer/lib/design-system';

export interface StageStatusProps {
  /** The pieces of the line in order, each rendered nowrap and joined by a dot. Falsy parts are skipped. */
  parts?: ReadonlyArray<React.ReactNode>;
  /** More live content after the parts (a "not saved" hint, a button); it sits in the same live region. */
  children?: React.ReactNode;
  /** Right-aligned and outside the live region: key hints that do not change. Hide them on narrow screens with `trailingClassName`. */
  trailing?: React.ReactNode;
  /** Classes for the trailing slot (for example `max-[900px]:hidden`). */
  trailingClassName?: string;
  /** Accessible name of the strip (default "Status"). */
  label?: string;
  /** `data-testid` of the strip. */
  testId?: string;
  className?: string;
}

const Dot: React.FC = () => <span aria-hidden="true" className="h-[3px] w-[3px] flex-none rounded-full bg-[var(--ink-3)]" />;

/**
 * A button that sits among the parts and acts on the line ("1 pick-up without a person"): coral ink, underlined, with a focus ring.
 */
export const StageStatusButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, type = 'button', ...rest }) => (
  <button
    type={type}
    className={cn('rounded text-[var(--coral-ink)] underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]', className)}
    {...rest}
  />
);

/** The strip at the foot of a stage: dot-separated parts in a polite live region, and an optional trailing slot. */
export const StageStatus: React.FC<StageStatusProps> = ({ parts = [], children, trailing, trailingClassName, label = 'Status', testId, className }) => {
  const shown = parts.filter((part) => part !== null && part !== undefined && part !== false && part !== '');
  const hasChildren = React.Children.toArray(children).length > 0;
  if (shown.length === 0 && !hasChildren && !trailing) return null;
  return (
    <div
      data-stage-status
      data-testid={testId}
      className={cn('flex min-h-8 flex-none items-center gap-x-4 px-[22px] text-xs text-[var(--ink-2)]', className)}
    >
      <p role="status" aria-live="polite" aria-label={label} className="m-0 flex min-w-0 flex-wrap items-center gap-x-2">
        {shown.map((part, index) => (
          <span key={typeof part === 'string' ? part : index} className="flex items-center gap-2 whitespace-nowrap">
            {index > 0 ? <Dot /> : null}
            {part}
          </span>
        ))}
        {children}
      </p>
      {trailing ? <span className={cn('ml-auto flex-none', trailingClassName)}>{trailing}</span> : null}
    </div>
  );
};
