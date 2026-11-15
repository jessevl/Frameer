/**
 * @file AppFrame.tsx
 * @description The suite's desktop frame: the rail standing on the canvas, then one card. The card holds the section's pane as its first column while it docks, then the stage: the app's `main`, its SidePanel and its DockedBar, which spans the stage and the panel. When the pane does not dock (768 to 1100 px windows, collapsed with ⌘\, or forced by the app) it floats over the stage from the card's left edge (`FloatingPane`), and the card is the stage alone. A screen without a pane leaves out `pane`.
 * The pane's heading (`paneHeading`, usually a `PaneHeading`: the section's name and the pane's actions) is a row of the bar's height, colour and hairline at the top of the pane, docked or floating, so the bar reads as one line across the whole card: the pane's half carries the section, the stage's half the breadcrumb below it. The app therefore leaves the section out of its breadcrumb while the pane docks (`paneState.docked`) and keeps it while the pane floats or is collapsed. The pane's content draws no heading of its own.
 * The frame sets `--rail-surface` to the canvas, so the rail's icons occlude with the colour they stand on. Phones have their own shell (PhoneHeader, PhoneTabBar): this is the desktop frame only.
 * Why one part: Drift, Harbour, Lido and Yard each built this by hand from the same lines, and a Frameer default (the floating pane's left edge) had to follow them. Why the heading in the frame: with the pane inside the card, a heading in the pane and the section as the bar's first crumb said the same thing side by side.
 * Used by: the suite apps' desktop shells.
 */
import type { ReactNode } from 'react';
import { FloatingPane, type FloatingPaneProps } from './FloatingPane';
import type { PaneState } from './usePane';

/** The card's border, radius and shadow: the stage card, and any card the app draws in the same frame. */
export const FRAME_CARD = 'rounded-[var(--radius-card)] border border-[var(--line)] shadow-[var(--shadow-card)]';

/** The docked pane's width. */
export const FRAME_PANE_WIDTH = 230;

/** The pane's heading row: the docked bar's height, colour and hairline, with the title aligned to the pane's rows (18 px). Lighthouse, which draws its own grid, uses the same class. */
export const FRAME_PANE_HEAD = 'flex h-[var(--bar-height)] flex-shrink-0 items-center gap-1 border-b border-[var(--line)] bg-[var(--bar)] pl-[18px] pr-3.5';

export interface PaneHeadingProps {
  /** The section's name. */
  title: ReactNode;
  /** The pane's actions after it (a coral + for Write mail, New page, Upload). */
  actions?: ReactNode;
}

/** The pane's heading: the section's name as the pane's `h2`, then its actions. Pass it as AppFrame's `paneHeading`. */
export function PaneHeading({ title, actions }: PaneHeadingProps) {
  return (
    <>
      <h2 className="min-w-0 flex-1 truncate text-base font-[650] tracking-[-0.01em] text-[var(--ink)]">{title}</h2>
      {actions}
    </>
  );
}

export interface AppFrameProps {
  /** The rail (`Rail`), standing on the canvas at the left. */
  rail: ReactNode;
  /** The section's pane; left out on a screen without one. It draws no heading: that is `paneHeading`. */
  pane?: ReactNode;
  /** The pane's heading row (usually `PaneHeading`), at the top of the pane in line with the docked bar, docked or floating. */
  paneHeading?: ReactNode;
  /** `usePane()`'s state: whether the pane docks in the card or floats over it. Needed with `pane`. */
  paneState?: PaneState;
  /** The docked pane's landmark (an `aside`). */
  paneLabel?: string;
  /** The floating pane's options (`testId`, `ignore`, `stopEscape`, `followSelector`, `className`). */
  floating?: Omit<FloatingPaneProps, 'pane' | 'children'>;
  /** The stage: the app's `main`, then its SidePanel and DockedBar. They lay out in a row in a positioned box, so the bar and the panel place themselves against the stage, not the pane. */
  children: ReactNode;
  /** Extra classes on the frame (the app's own hooks into it). */
  className?: string;
  testId?: string;
}

export function AppFrame({ rail, pane, paneHeading, paneState, paneLabel = 'Sidebar', floating, children, className = '', testId = 'app-frame' }: AppFrameProps) {
  const docked = pane !== undefined && paneState?.docked === true;
  // The heading and the content below it, the same in the docked column and the floating card (both start at the card's top edge, so the row lines up with the bar either way).
  const column = (
    <div className="flex h-full min-h-0 flex-col">
      {paneHeading ? (
        <div data-frame-pane-head="" className={FRAME_PANE_HEAD}>
          {paneHeading}
        </div>
      ) : null}
      <div className="relative min-h-0 flex-1">{pane}</div>
    </div>
  );
  return (
    <div data-testid={testId} className={`flex h-dvh bg-[var(--canvas)] py-[10px] pr-[10px] [--rail-surface:var(--canvas)] ${className}`}>
      {rail}
      {pane !== undefined && paneState ? (
        <FloatingPane pane={paneState} {...floating}>
          {column}
        </FloatingPane>
      ) : null}
      <div data-frame-card="" className={`${FRAME_CARD} paper-surface flex min-w-0 flex-1 overflow-hidden bg-[var(--paper)]`}>
        {docked ? (
          <aside aria-label={paneLabel} data-frame-pane="" className="flex-shrink-0 border-r border-[var(--line)]" style={{ width: FRAME_PANE_WIDTH }}>
            {column}
          </aside>
        ) : null}
        <div data-frame-stage="" className="relative flex min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
