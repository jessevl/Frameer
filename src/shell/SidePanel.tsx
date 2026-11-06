/**
 * @file SidePanel.tsx
 * @description The right-hand panel, without tabs: one scroll under a heading (a Back arrow while a sub-view shows, the title, a close button) that lives in the docked bar above it on desktop and at the top of the sheet on a phone. On desktop it is docked to the stage's card, on paper, 340 px wide and 480 px while a form is open (`wide` on PanelContent). A page fills it with `PanelContent`, portalled into the body; `children` are drawn in the body too, for an app that picks its panel by route (Drift's registry, Lighthouse's `openSidePanel`).
 * Per-app differences are props: `phone="full"` (a full-screen sheet, shown only while a page has filled it: Harbour, Yard) or `"sheet"` (a bottom sheet: Drift); `requireContent`; `heading` (replaces the heading, in the sheet and, through `PanelHeading`, the docked bar); `slide` (the width opens and shuts: Drift); `floating` (a card that closes on Escape and on a press outside it: Lighthouse); `paper`; `wide`; `empty`.
 * `PanelSlide` is the sliding column, used for the panel and for its half of the docked bar so the two move together.
 * Used by: the app shell and DockedBar.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MobileSheet } from '@frameer/components';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { useIsMobile } from './useShellMode';
import { STAGE_SCROLL, stageScroll } from './stageScroll';
import { useStageStore } from './stageStore';

export const PANEL_WIDTH = 340;
export const PANEL_WIDTH_WIDE = 480;
const DEFAULT_TITLE = 'Details';
const ROUND =
  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--ink-2)] outline-none hover:bg-[var(--hover)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)]';

/** The panel's width in px: 340, or 480 while a form is open. The docked bar's panel half uses it too, so the two line up. */
export function usePanelWidth(wide = false): number {
  const formOpen = useStageStore((s) => s.panelWide);
  return wide || formOpen ? PANEL_WIDTH_WIDE : PANEL_WIDTH;
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
function SidePanelBody({ empty, label, children }: { empty?: string; label: string; children?: ReactNode }) {
  const filled = useStageStore((s) => s.panelTitle !== null);
  const setTarget = useStageStore((s) => s.setPanelTarget);
  return (
    <div id="side-panel-body" role="region" aria-label={label} {...stageScroll} className={`min-h-0 flex-1 overflow-y-auto ${STAGE_SCROLL}`}>
      {/* The page's content fills the panel's height, so its footer can sit at the bottom. */}
      <div ref={setTarget} className="flex min-h-full flex-col" />
      {children}
      {filled || children || !empty ? null : <p className="px-5 py-4 text-[13.5px] text-[var(--ink-2)]">{empty}</p>}
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
  /** A press on an element matching this selector does not dismiss a floating card (the docked bar's toggle, menus). */
  ignore?: string;
  paper?: boolean;
  /** Keeps the panel wide whatever the page asks. */
  wide?: boolean;
  className?: string;
}

export function SidePanel({ open, onClose, enabled = true, empty, label = DEFAULT_TITLE, children, heading, phone = 'full', requireContent = true, slide = false, floating = false, ignore, paper = true, wide = false, className = '' }: SidePanelProps) {
  const isMobile = useIsMobile();
  const filled = useStageStore((s) => s.panelTitle !== null);
  const width = usePanelWidth(wide);
  const ref = useRef<HTMLElement>(null);
  const shown = open && enabled;
  const dismissing = shown && floating && !isMobile;

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
          <SidePanelBody empty={empty} label={label}>
            {children}
          </SidePanelBody>
        </div>
      </MobileSheet>
    );
  }

  const aside = (
    <aside
      ref={ref}
      aria-label="Side panel"
      role={floating ? 'dialog' : undefined}
      className={`${paper ? 'paper-surface ' : ''}flex ${slide ? 'h-full' : 'flex-shrink-0 transition-[width] duration-150 motion-reduce:transition-none'} flex-col border-l border-[var(--line)] bg-[var(--paper)] [--stage-top:var(--bar-height)] ${className}`}
      style={slide ? undefined : { width }}
      data-testid="side-panel"
    >
      <SidePanelBody empty={empty} label={label}>
        {children}
      </SidePanelBody>
    </aside>
  );
  if (slide) {
    return (
      <PanelSlide shown={shown} width={width}>
        {aside}
      </PanelSlide>
    );
  }
  return shown ? aside : null;
}
