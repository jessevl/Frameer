/**
 * @file AppFrame.tsx
 * @description The suite's desktop frame: the rail standing on the canvas, then one card. The card holds the section's pane as its first column while it docks, then the stage: the app's `main`, its SidePanel and its DockedBar, which therefore spans the stage and the panel but not the pane (the pane keeps its own heading). When the pane does not dock (768 to 1100 px windows, collapsed with ⌘\, or forced by the app) it floats over the stage from the card's left edge (`FloatingPane`), and the card is the stage alone. A screen without a pane leaves out `pane`.
 * The frame sets `--rail-surface` to the canvas, so the rail's icons occlude with the colour they stand on. Phones have their own shell (PhoneHeader, PhoneTabBar): this is the desktop frame only.
 * Why one part: Drift, Harbour, Lido and Yard each built this by hand from the same lines, and a Frameer default (the floating pane's left edge) had to follow them.
 * Used by: the suite apps' desktop shells.
 */
import type { ReactNode } from 'react';
import { FloatingPane, type FloatingPaneProps } from './FloatingPane';
import type { PaneState } from './usePane';

/** The card's border, radius and shadow: the stage card, and any card the app draws in the same frame. */
export const FRAME_CARD = 'rounded-[var(--radius-card)] border border-[var(--line)] shadow-[var(--shadow-card)]';

/** The docked pane's width. */
export const FRAME_PANE_WIDTH = 230;

export interface AppFrameProps {
  /** The rail (`Rail`), standing on the canvas at the left. */
  rail: ReactNode;
  /** The section's pane; left out on a screen without one. */
  pane?: ReactNode;
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

export function AppFrame({ rail, pane, paneState, paneLabel = 'Sidebar', floating, children, className = '', testId = 'app-frame' }: AppFrameProps) {
  const docked = pane !== undefined && paneState?.docked === true;
  return (
    <div data-testid={testId} className={`flex h-dvh bg-[var(--canvas)] py-[10px] pr-[10px] [--rail-surface:var(--canvas)] ${className}`}>
      {rail}
      {pane !== undefined && paneState ? (
        <FloatingPane pane={paneState} {...floating}>
          {pane}
        </FloatingPane>
      ) : null}
      <div data-frame-card="" className={`${FRAME_CARD} paper-surface flex min-w-0 flex-1 overflow-hidden bg-[var(--paper)]`}>
        {docked ? (
          <aside aria-label={paneLabel} data-frame-pane="" className="flex-shrink-0 border-r border-[var(--line)]" style={{ width: FRAME_PANE_WIDTH }}>
            {pane}
          </aside>
        ) : null}
        <div data-frame-stage="" className="relative flex min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
