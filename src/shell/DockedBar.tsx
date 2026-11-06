/**
 * @file DockedBar.tsx
 * @description The desktop top bar, docked to the top of the stage's card and spanning the stage and the side panel: the breadcrumb at the left (`crumbs`, usually a PillHeader with `bar`), a `middle` slot (Drift's save indicator and who is here), and the view's tools at the right (`trailing`, usually BarTools). Above an open side panel sits the panel's half: its heading and the hide toggle (`panel`). Translucent (`--bar` with a backdrop blur), so what scrolls under it shows through (shell.css has the solid fallback). The tools are a container (`@container/bar`), so a tool can show more when the bar is wide.
 * Below the SidePanel's overlay width (`panel.overlayBelow`, default 1024 px) the panel floats over the stage, so the bar spans the window and draws no half. The tools shrink and scroll sideways instead of running over the panel half; the crumbs keep 9 rem.
 * The panel's half follows the panel's width (340 px, 480 px while a form is open) so the two line up; `panel.slide` moves it with a sliding SidePanel.
 * Used by: the app shell.
 */
import type { ReactNode } from 'react';
import { PanelSlide, PANEL_OVERLAY_BELOW, SidePanelHeading, usePanelOverlay, usePanelWidth } from './SidePanel';
import { useIsMobile } from './useShellMode';

export interface DockedBarPanel {
  /** The panel is open (and this screen has one). */
  open: boolean;
  /** The hide toggle, drawn after the heading. */
  toggle: ReactNode;
  /** The heading; the stage store's (`SidePanelHeading`) when left out. */
  heading?: ReactNode;
  /** The half slides with the panel. */
  slide?: boolean;
  /** Keeps the half wide whatever the page asks. */
  wide?: boolean;
  /** Must equal the SidePanel's `overlayBelow` (default 1024): below it the panel floats over the stage, so the bar spans the window and draws no half. */
  overlayBelow?: number;
}

export interface DockedBarProps {
  crumbs: ReactNode;
  middle?: ReactNode;
  trailing?: ReactNode;
  panel?: DockedBarPanel;
  /** `data-testid` of the bar. */
  testId?: string;
  /** The bar stops at the docked panel's edge instead of spanning it; the panel then draws its own heading (`panel.heading` and `panel.toggle` are not drawn). */
  stopAtPanel?: boolean;
  /** `data-*` attributes (`data-story`, `data-panel`) pass through to the bar. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export function DockedBar({ crumbs, middle, trailing, panel, testId, stopAtPanel = false, ...rest }: DockedBarProps) {
  const width = usePanelWidth(panel?.wide);
  const narrow = usePanelOverlay(panel?.overlayBelow ?? PANEL_OVERLAY_BELOW);
  const phone = useIsMobile();
  const overlaid = narrow && !phone;
  const half = panel && !overlaid ? (
    <>
      {panel.heading ?? <SidePanelHeading />}
      {panel.toggle}
    </>
  ) : null;
  const data = Object.fromEntries(Object.entries(rest).filter(([key]) => key.startsWith('data-')));
  const halfClass = 'flex h-full items-center gap-2 border-l border-[var(--line)] pl-3 pr-3.5';
  return (
    <div
      {...data}
      data-docked-bar=""
      data-testid={testId}
      style={stopAtPanel ? { right: panel?.open && !overlaid ? width : 0 } : undefined}
      className="absolute inset-x-0 top-0 z-20 flex h-[var(--bar-height)] items-center border-b border-[var(--line)] bg-[var(--bar)] backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="@container/bar flex h-full min-w-0 flex-1 items-center gap-2 pl-2.5 pr-3.5">
        {/* The crumbs keep 9 rem and elide inside it (overflow hidden); the tools give way before them (BarTools shrinks and scrolls), so nothing paints over the panel half. */}
        <div data-bar-crumbs="" className="flex min-w-[9rem] flex-1 overflow-hidden">{crumbs}</div>
        {middle}
        {trailing}
      </div>
      {stopAtPanel || overlaid ? null : panel?.slide ? (
        <PanelSlide shown={panel.open} width={width} className={halfClass}>
          {half}
        </PanelSlide>
      ) : panel?.open ? (
        <div className={`${halfClass} flex-shrink-0`} style={{ width }}>
          {half}
        </div>
      ) : null}
    </div>
  );
}
