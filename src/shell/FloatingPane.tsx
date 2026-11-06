/**
 * @file FloatingPane.tsx
 * @description The pane as a card floating over the stage, for compact windows (768 to 1100 px) and for a collapsed pane on a wide one. It slides in while the pointer rests on the rail or after ⌘\, stays while the pointer is on it, and slides away on leaving, on Escape, on a click outside it, and when a link in it is followed. The stage keeps its width the whole time.
 * Why: a narrow desktop window must never squeeze the stage; the pane is there when asked for and gone when not.
 * It stays mounted for the length of the slide-out so the exit is seen, and not at all while closed (a closed pane watches no folders). The app passes its `usePane()` result and the pane's content.
 * Differences between the apps are props: `testId` (Drift, Harbour and Yard `compact-pane`, Lighthouse `floating-pane`), `ignore` (what a press may land on without closing: the rail, and Lighthouse's menus), `stopEscape` (Lighthouse keeps its open story open), `followSelector` (what a click closes the pane on; an empty string never).
 * Used by: the app shell.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PaneState } from './usePane';

/** The slide takes this long both ways (the Gentle motion step). */
const SLIDE_MS = 320;

export interface FloatingPaneProps {
  pane: PaneState;
  children: ReactNode;
  testId?: string;
  /** A press on an element that matches this selector does not close the pane. */
  ignore?: string;
  stopEscape?: boolean;
  followSelector?: string;
  className?: string;
}

export function FloatingPane({ pane, children, testId = 'compact-pane', ignore = '[data-testid="rail"]', stopEscape = false, followSelector = 'a', className = '' }: FloatingPaneProps) {
  const element = useRef<HTMLDivElement>(null);
  // The card stays in the tree through the slide-out (`lingering`) so the exit is seen; `entered` is the slid-in state the transition runs toward.
  const [prevOpen, setPrevOpen] = useState(false);
  const [lingering, setLingering] = useState(false);
  const [entered, setEntered] = useState(false);
  if (prevOpen !== pane.open) {
    setPrevOpen(pane.open);
    setLingering(!pane.open);
  }

  useEffect(() => {
    if (pane.open) {
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }
    const timer = setTimeout(() => {
      setLingering(false);
      setEntered(false);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [pane.open]);
  const mounted = pane.open || lingering;
  const shown = pane.open && entered;

  // Escape and a click anywhere outside the pane and what `ignore` names send it away.
  const { open, close } = pane;
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (stopEscape) event.stopPropagation();
      close();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target && !element.current?.contains(target) && !(ignore && target.closest(ignore))) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close, ignore, stopEscape]);

  if (!pane.floating || !mounted) return null;
  return (
    <div
      ref={element}
      data-testid={testId}
      data-shown={shown}
      aria-hidden={!shown}
      inert={!shown || undefined}
      onPointerEnter={pane.hover.onPointerEnter}
      onPointerLeave={pane.hover.onPointerLeave}
      onClick={(event) => followSelector && (event.target as HTMLElement).closest(followSelector) && pane.close()}
      className={`fixed bottom-[10px] left-[82px] top-[10px] z-30 w-[230px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--paper-2)] shadow-[var(--shadow-float)] transition-[transform,opacity] duration-[var(--dur-gentle)] ease-[var(--spring)] motion-reduce:transition-none ${
        shown ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-3 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
