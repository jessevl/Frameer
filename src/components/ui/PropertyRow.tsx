/**
 * @file PropertyRow.tsx
 * @description The side panel's property row and its grid. A row is a 40 px tile on paper-2 with an icon (a Drift line icon by `line`, or any node by `icon`), a quiet label and the value on the right. `tone` colors the icon: `accent` (coral, Drift and Yard) or `grey` (Harbour, where coral marks actions only). Inside a `PropertyGrid` the row lays its label in an 88 px column and its value across the two value columns, or two values side by side when `second` is given. With `onClick` the whole row is one button, so its children must not be interactive.
 * Replaces the planneer `PropertyRow` (label, icon, value, active), which had no users in Harbour, Drift, Lighthouse or Yard.
 * Ported from drift@d91d6950:frontend/src/app/shell/panels/infoParts.tsx (`Property`) and yard@0b9f18f:frontend/src/ui/Property.tsx.
 * Used by: the apps' side panels (event, care, info, app detail).
 */
import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { LineIcon, type LineName } from '@frameer/icons/LineIcon';
import { cn } from '@frameer/lib/design-system';

export type PropertyTone = 'accent' | 'grey';

export interface PropertyRowProps {
  /** Any icon node; use `line` for a Drift line icon. */
  icon?: ReactNode;
  /** A Drift line icon, drawn static at 18 px. */
  line?: LineName;
  label: string;
  /** The value. Across both value columns in a grid unless `second` is given. */
  children?: ReactNode;
  /** A second value in the grid's last column (a date and its time). */
  second?: ReactNode;
  /** Makes the whole row a button. */
  onClick?: () => void;
  /** The icon's color: coral (default) or grey. */
  tone?: PropertyTone;
  testId?: string;
  className?: string;
}

const InGrid = createContext(false);

/** The row's surface, so a line icon's occluding fill matches it. */
const ICON_BG = { '--icon-bg': 'var(--paper-2)' } as CSSProperties;

const ROW =
  'min-h-10 min-w-0 items-center gap-2.5 rounded-[13px] border border-[var(--line)] bg-[var(--paper-2)] px-3 py-1.5 text-left text-[13px] text-[var(--ink)]';
const CLICKABLE = 'cursor-pointer hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]';

export function PropertyRow({ icon, line, label, children, second, onClick, tone = 'accent', testId, className }: PropertyRowProps) {
  const grid = useContext(InGrid);
  const color = tone === 'accent' ? 'var(--coral)' : 'var(--ink-2)';
  const mark = line ? (
    <LineIcon name={line} size={18} className="gi-static" style={{ color, ...ICON_BG }} />
  ) : icon ? (
    <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center" style={{ color }} aria-hidden="true">
      {icon}
    </span>
  ) : null;
  const id = testId ?? `prop-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const valueClass = 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[var(--ink)]';
  const body = grid ? (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        {mark}
        <span className="truncate text-[var(--ink-2)]">{label}</span>
      </span>
      <span className={cn(valueClass, second === undefined && 'col-span-2')}>{children}</span>
      {second !== undefined ? <span className={valueClass}>{second}</span> : null}
    </>
  ) : (
    <>
      {mark}
      <span className="flex-shrink-0 text-[var(--ink-2)]">{label}</span>
      <span className={cn(valueClass, 'ml-auto justify-end text-right')}>{children}</span>
    </>
  );
  const layout = grid ? 'grid grid-cols-subgrid col-span-3 gap-x-2' : 'flex';
  const classes = cn(layout, ROW, onClick && CLICKABLE, className);
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(classes, 'w-full')} data-testid={id}>
      {body}
    </button>
  ) : (
    <div className={classes} data-testid={id}>
      {body}
    </div>
  );
}

/** A label column of 88 px and two value columns; rows lay themselves across it. */
export function PropertyGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <InGrid.Provider value>
      <div className={cn('grid gap-y-1.5', className)} style={{ gridTemplateColumns: '88px 1fr 1fr' }}>
        {children}
      </div>
    </InGrid.Provider>
  );
}

export default PropertyRow;
