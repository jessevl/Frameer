/**
 * @file SelectionPill.tsx
 * @description The floating pill at the bottom centre of a stage while items are selected: a coral count with "selected" and a round clear button, then a row of icon actions (a name for the screen reader and a tooltip each), a rule where an action asks for one (the destructive one, in the coral ink, goes last). Presentational: the app owns the selection and what each action does. An action is a button, or a `node` of the app's own (a menu trigger with its popover) that sits in the same row. On a phone the pill is fixed above the tab bar and every target is 44 px.
 * Ported from drift@d91d6950:frontend/src/items/SelectionPill.tsx (the markup and its look, without Drift's items and commands).
 * Used by: Harbour's mail page.
 */
import type { ReactNode } from 'react';
import { ChromeIcon } from './ChromeIcons';

export interface SelectionPillAction {
  id: string;
  /** The accessible name; also the visible word beside the icon unless `iconOnly`. */
  label: string;
  icon?: ReactNode;
  onClick?: (element: HTMLButtonElement) => void;
  /** A toggle that is on (aria-pressed). */
  pressed?: boolean;
  /** The destructive action, in the coral ink. */
  danger?: boolean;
  disabled?: boolean;
  title?: string;
  iconOnly?: boolean;
  /** Draws a rule before this action. */
  ruleBefore?: boolean;
  /** The app's own control (a menu trigger and its popover) in place of a button; `label` is then only a key. */
  node?: ReactNode;
}

export interface SelectionPillProps {
  count: number;
  onClear: () => void;
  actions: readonly SelectionPillAction[];
  /** Name of the toolbar. */
  label?: string;
  clearLabel?: string;
  testId?: string;
  /** Extra classes for the toolbar (an app can restyle the menus its nodes open). */
  className?: string;
}

const BUTTON = 'flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium outline-none hover:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] disabled:opacity-45 disabled:hover:bg-transparent aria-pressed:bg-[var(--paper-3)] aria-pressed:shadow-[inset_0_0_0_1px_var(--line-2)] max-md:h-11 max-md:min-w-11';

function Rule() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--line-2)]" />;
}

export function SelectionPill({ count, onClear, actions, label = 'Selection actions', clearLabel = 'Clear selection', testId = 'selection-pill', className = '' }: SelectionPillProps) {
  if (count <= 0) return null;
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-testid={testId}
      className={`absolute bottom-[18px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[var(--line-2)] bg-[var(--paper)] p-1 shadow-[var(--shadow-float)] max-md:fixed max-md:bottom-[calc(100px+var(--safe-area-bottom,0px))] ${className}`}
    >
      <span role="status" aria-label={`${count} selected`} className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--coral-strong)] px-2.5 text-sm font-semibold tabular-nums text-[var(--color-button-primary-text)]">
        {count}
      </span>
      <span aria-hidden="true" className="pl-1.5 pr-0.5 text-sm font-medium text-[var(--ink)] max-sm:hidden">
        selected
      </span>
      <button
        type="button"
        aria-label={clearLabel}
        title={`${clearLabel} (Esc)`}
        onClick={onClear}
        className="mr-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-2)] outline-none hover:bg-[var(--hover)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] max-md:h-11 max-md:w-11"
      >
        <ChromeIcon name="close" size={16} aria-hidden="true" />
      </button>
      <Rule />
      {actions.map((action) => (
        <span key={action.id} className="contents">
          {action.ruleBefore ? <Rule /> : null}
          {action.node ?? (
            <button
              type="button"
              aria-label={action.label}
              title={action.title ?? action.label}
              aria-pressed={action.pressed}
              disabled={action.disabled}
              onClick={(event) => action.onClick?.(event.currentTarget)}
              className={`${BUTTON} ${action.danger ? 'text-[var(--coral-ink)]' : 'text-[var(--ink)]'}`}
            >
              {action.icon}
              {action.iconOnly ? null : <span className="max-sm:hidden">{action.label}</span>}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

export default SelectionPill;
