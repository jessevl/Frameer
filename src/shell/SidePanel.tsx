/**
 * @file SidePanel.tsx
 * @description The right-hand panel, without tabs: one scroll under a heading (a Back arrow while a sub-view shows, the title, a close button) that lives in the docked bar above it on desktop and at the top of the sheet on a phone. On desktop it is docked to the stage's card, on paper, 340 px wide and 480 px while a form is open (`wide` on PanelContent). A page fills it with `PanelContent`, portalled into the body; `children` are drawn in the body too, for an app that picks its panel by route (Drift's registry, Lighthouse's `openSidePanel`).
 * Per-app differences are props: `phone="full"` (a full-screen sheet, shown only while a page has filled it: Harbour, Yard) or `"sheet"` (a bottom sheet: Drift); `requireContent`; `heading` (replaces the heading, in the sheet and, through `PanelHeading`, the docked bar); `slide` (the width opens and shuts: Drift); `floating` (a card that closes on Escape and on a press outside it: Lighthouse); `overlayBelow` (below this window width, default 1024 px, a docked panel opens over the stage with a scrim and closes on Escape and on the scrim; 0 keeps it docked); `paper`; `wide`; `empty`.
 * `PanelSlide` is the sliding column, used for the panel and for its half of the docked bar so the two move together.
 * Used by: the app shell and DockedBar.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MobileSheet } from '@frameer/components';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { useMediaQuery } from '@frameer/hooks/useMobileDetection';
import { useIsMobile } from './useShellMode';
import { STAGE_SCROLL, stageScroll } from './stageScroll';
import { useStageStore } from './stageStore';

export const PANEL_WIDTH = 340;
export const PANEL_WIDTH_WIDE = 480;
/** Below this window width (px) the panel opens over the stage instead of docking beside it. */
export const PANEL_OVERLAY_BELOW = 1024;
const DEFAULT_TITLE = 'Details';
const ROUND =
  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--ink-2)] outline-none hover:bg-[var(--hover)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]';

/** The panel's width in px: 340, or 480 while a form is open. The docked bar's panel half uses it too, so the two line up. */
export function usePanelWidth(wide = false): number {
  const formOpen = useStageStore((s) => s.panelWide);
  return wide || formOpen ? PANEL_WIDTH_WIDE : PANEL_WIDTH;
}

/** True while the panel should float over the stage: the window is narrower than `below` px (0 turns it off). The phone shell has its own sheet, so callers check `useIsMobile` first. The docked bar uses it too, so it draws no panel half then. */
export function usePanelOverlay(below: number = PANEL_OVERLAY_BELOW): boolean {
  return useMediaQuery(below > 0 ? `(max-width: ${below - 1}px)` : 'not all');
}

export interface PanelHeadingProps {
  title: string;
  onBack?: (() => void) | null;
  onClose?: (() => void) | null;
}

/** The heading drawn: Back arrow, title, close button. */
export function PanelHeading({ title, onBack, onClose }: PanelHeadingProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-0.5">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" className={ROUND}>
          <ChromeIcon name="chevronLeft" className="h-4 w-4" />
        </button>
      ) : null}
      <h2 className="min-w-0 flex-1 truncate pl-1 text-[14.5px] font-semibold text-[var(--ink)]">{title}</h2>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Close" className={`${ROUND} ml-auto`}>
          <ChromeIcon name="close" className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

/** The heading of whatever fills the panel (the stage store's title, Back and close). */
export function SidePanelHeading({ fallback = DEFAULT_TITLE }: { fallback?: string }) {
  const title = useStageStore((s) => s.panelTitle);
  const back = useStageStore((s) => s.panelBack);
  const close = useStageStore((s) => s.panelClose);
  return <PanelHeading title={title ?? fallback} onBack={back} onClose={close} />;
}

/** The panel's column, sliding its width open and shut; the content stays until it has slid shut. */
export function PanelSlide({ shown, width = PANEL_WIDTH, className = '', children }: { shown: boolean; width?: number; className?: string; children: ReactNode }) {
  const [mounted, setMounted] = useState(shown);
  if (shown && !mounted) setMounted(true);
  return (
    <div
      className="flex flex-shrink-0 justify-end overflow-hidden transition-[width] duration-[var(--dur-gentle)] ease-[var(--ease-out)] motion-reduce:transition-none"
      style={{ width: shown ? width : 0 }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !shown) setMounted(false);
      }}
    >
      {mounted ? (
        <div className={`flex-none ${className}`} style={{ width }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** The page's content is portalled into the slot; without a page panel the slot shows what the panel is for. */
function SidePanelBody({ empty, label, children, ownHeader = false, padded = true, scrollContainer = true }: { empty?: string; label: string; children?: ReactNode; ownHeader?: boolean; padded?: boolean; scrollContainer?: boolean }) {
  const filled = useStageStore((s) => s.panelTitle !== null);
  const setTarget = useStageStore((s) => s.setPanelTarget);
  // The inset keeps content under the docked bar; content with its own sticky header, or an unpadded body, takes none (the scroll padding stays so a row scrolled into view clears a sticky header).
  const inset = padded && !ownHeader ? STAGE_SCROLL : '[scroll-padding-top:var(--stage-top)]';
  return (
    <div id="side-panel-body" role="region" aria-label={label} {...(scrollContainer ? stageScroll : {})} className={`min-h-0 flex-1 overflow-y-auto ${inset}`}>
      {/* A page's content fills the panel's height, so its footer can sit at the bottom; an empty target takes no height, so `children` start right at the top. */}
      <div ref={setTarget} className={filled ? 'flex min-h-full flex-col' : 'flex flex-col'} />
      {children}
      {filled || children || !empty ? null : <p className={`${padded ? 'px-5 py-4 ' : ''}text-[13.5px] text-[var(--ink-2)]`}>{empty}</p>}
    </div>
  );
}

export interface SidePanelProps {
  /** Whether the person has the panel open (the app's store). */
  open: boolean;
  /** Closes it: the phone sheet's dismiss, and a floating card's Escape and outside press. */
  onClose: () => void;
  /** False on screens where the panel does nothing: it is then never drawn, whatever was left open. */
  enabled?: boolean;
  /** What it says before a page fills it. */
  empty?: string;
  /** The body's accessible name. */
  label?: string;
  /** The panel's accessible name on desktop (the title of what fills it, say). Default "Side panel". */
  ariaLabel?: string;
  /** `data-testid` of the panel. Default `side-panel`. */
  testId?: string;
  /** `data-testid` of the panel while it slides shut (`slide`); `testId` when left out. */
  leavingTestId?: string;
  /** The content brings its own sticky header: the body adds no `--stage-top` inset. */
  ownHeader?: boolean;
  /** False: the body adds no inset and no padding (content that lays itself out). Default true. */
  padded?: boolean;
  /** False: the body is not marked as a stage-scroll container (`data-stage-scroll`). Default true. */
  scrollContainer?: boolean;
  children?: ReactNode;
  /** Replaces the heading on a phone (the docked bar's half is the app's, drawn through DockedBar's `panel.heading`). */
  heading?: ReactNode;
  phone?: 'full' | 'sheet';
  /** On a phone, open only while a page has filled the panel. */
  requireContent?: boolean;
  /** The width opens and shuts. */
  slide?: boolean;
  /** A card over the stage: a dialog that closes on Escape and on a press outside it. */
  floating?: boolean;
  /** Window width (px) below which a docked panel overlays the stage instead (floating, with a scrim, closing on Escape and on the scrim). Default 1024; 0 keeps it docked at every width. `DockedBar`'s `panel.overlayBelow` must match. */
  overlayBelow?: number;
  /** A press on an element matching this selector does not dismiss a floating card (the docked bar's toggle, menus). */
  ignore?: string;
  paper?: boolean;
  /** Keeps the panel wide whatever the page asks. */
  wide?: boolean;
  className?: string;
}

export function SidePanel({ open, onClose, enabled = true, empty, label = DEFAULT_TITLE, ariaLabel = 'Side panel', testId = 'side-panel', leavingTestId, ownHeader = false, padded = true, scrollContainer = true, children, heading, phone = 'full', requireContent = true, slide = false, floating = false, overlayBelow = PANEL_OVERLAY_BELOW, ignore, paper = true, wide = false, className = '' }: SidePanelProps) {
  const isMobile = useIsMobile();
  const filled = useStageStore((s) => s.panelTitle !== null);
  const width = usePanelWidth(wide);
  const ref = useRef<HTMLElement>(null);
  const shown = open && enabled;
  const narrow = usePanelOverlay(overlayBelow);
  const overlay = !isMobile && !floating && narrow;
  const dismissing = shown && (floating || overlay) && !isMobile;
  const title = useStageStore((st) => st.panelTitle);
  const back = useStageStore((st) => st.panelBack);
  const closeFromStore = useStageStore((st) => st.panelClose);

  // Floating over the stage, a panel whose page has gone (the page closed its content through its own route, not the panel's close button) closes with it, instead of staying as an empty card until the next press.
  const wasFilled = useRef(false);
  useEffect(() => {
    if (!overlay || !shown) {
      wasFilled.current = false;
      return;
    }
    if (filled) wasFilled.current = true;
    else if (wasFilled.current) {
      wasFilled.current = false;
      onClose();
    }
  }, [overlay, shown, filled, onClose]);

  useEffect(() => {
    if (!dismissing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && !ref.current?.contains(target) && !(ignore && target.closest(ignore))) onClose();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown, true);
    };
  }, [dismissing, onClose, ignore]);

  if (isMobile) {
    const full = phone === 'full';
    return (
      <MobileSheet isOpen={open && (filled || !requireContent)} onClose={onClose} title={label} maxHeight={full ? '100dvh' : undefined} className={full ? 'h-[100dvh] !rounded-none' : undefined}>
        <div className={full ? 'flex h-full flex-col' : 'flex max-h-[70vh] flex-col'}>
          <div className="flex flex-shrink-0 border-b border-[var(--line)] px-3.5 pb-3 pt-1">{heading ?? <SidePanelHeading />}</div>
          <SidePanelBody empty={empty} label={label} ownHeader={ownHeader} padded={padded} scrollContainer={scrollContainer}>
            {children}
          </SidePanelBody>
        </div>
      </MobileSheet>
    );
  }

  const aside = (
    <aside
      ref={ref}
      aria-label={ariaLabel}
      role={floating ? 'dialog' : undefined}
      className={
        overlay
          ? `absolute inset-y-0 right-0 flex max-w-full flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-float)] [--stage-top:0px] ${className}`
          : `${paper ? 'paper-surface ' : ''}flex ${slide ? 'h-full' : 'flex-shrink-0 transition-[width] duration-150 motion-reduce:transition-none'} flex-col border-l border-[var(--line)] bg-[var(--paper)] [--stage-top:var(--bar-height)] ${className}`
      }
      style={overlay || !slide ? { width } : undefined}
      data-testid={slide && !shown && leavingTestId ? leavingTestId : testId}
      data-overlay={overlay ? '' : undefined}
    >
      {/* Overlaid, the bar draws no panel half, so the heading sits in the panel itself. */}
      {overlay ? <div className="flex h-[var(--bar-height)] flex-shrink-0 items-center border-b border-[var(--line)] px-3">{heading ?? <PanelHeading title={title ?? label} onBack={back} onClose={closeFromStore ?? onClose} />}</div> : null}
      <SidePanelBody empty={empty} label={label} ownHeader={ownHeader} padded={padded} scrollContainer={scrollContainer}>
        {children}
      </SidePanelBody>
    </aside>
  );
  if (overlay) {
    // A scrim over the window (the panel carries no `paper-surface` here: its `position: relative` beats the `absolute` utility and left the card at the scrim's left edge, as tall as its content, so it neither sat at the right nor scrolled) with the panel at its right edge. The window-level press handler closes it, so the scrim only has to be there to be pressed.
    return shown ? (
      <div role="dialog" aria-modal="true" aria-label={ariaLabel} className="fixed inset-0 z-[60]" data-testid={`${testId}-overlay`}>
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" data-testid={`${testId}-scrim`} />
        {aside}
      </div>
    ) : null;
  }
  if (slide) {
    return (
      <PanelSlide shown={shown} width={width}>
        {aside}
      </PanelSlide>
    );
  }
  return shown ? aside : null;
}
