/**
 * @file MobileDrawer.tsx
 * @description The phone's drawer: the current view's pane (folders, pages, task lists) slides in from the left over a dimmed backdrop. Closes on the backdrop, Escape, the close button or a swipe to the left; locks the page scroll and returns focus to what opened it.
 * Ported from planneer@a73f6b2:frontend/src/components/layout/MobileDrawer.tsx
 *
 * Differences: it slides from the left (the old drawer came from the bottom; the side panel is the bottom sheet now), it
 * has its own close button, and it is built from Frameer tokens.
 * Used by: the app shell.
 */
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChromeIcon } from '@frameer/components/ui/ChromeIcons';
import { usePrefersReducedMotion } from '@frameer/hooks/useMobileDetection';

/** Swipe distance (px) that closes the drawer. */
const SWIPE_CLOSE = 80;
const ANIMATION_MS = 200;

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** The close button's icon; the app passes its own drawing so the button matches its other tools (default: Frameer's chrome close icon). */
  closeIcon?: ReactNode;
}

export function MobileDrawer({ isOpen, onClose, title, children, closeIcon }: MobileDrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const startX = useRef<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [render, setRender] = useState(isOpen);
  const [shown, setShown] = useState(false);
  const [drag, setDrag] = useState(0);

  // Mounts before it slides in, and stays mounted until it has slid out.
  useEffect(() => {
    if (isOpen) {
      opener.current = document.activeElement;
      const mount = setTimeout(() => setRender(true), 0);
      const show = setTimeout(() => setShown(true), 20);
      return () => {
        clearTimeout(mount);
        clearTimeout(show);
      };
    }
    const hide = setTimeout(() => setShown(false), 0);
    const unmount = setTimeout(() => setRender(false), reducedMotion ? 0 : ANIMATION_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(unmount);
    };
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-drawer-close]')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const returnTo = opener.current;
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
      if (returnTo instanceof HTMLElement) returnTo.focus();
    };
  }, [isOpen, onClose]);

  if (!render) return null;

  const onTouchStart = (event: TouchEvent) => {
    startX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchMove = (event: TouchEvent) => {
    const x = event.touches[0]?.clientX;
    if (startX.current === null || x === undefined) return;
    setDrag(Math.min(0, x - startX.current));
  };
  const onTouchEnd = () => {
    if (drag <= -SWIPE_CLOSE) onClose();
    startX.current = null;
    setDrag(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[300]">
      <div aria-hidden="true" onClick={onClose} className={`absolute inset-0 bg-black/40 ${reducedMotion ? '' : 'transition-opacity duration-200'} ${shown ? 'opacity-100' : 'opacity-0'}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: shown ? `translateX(${drag}px)` : 'translateX(-100%)', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        className={`absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col bg-[var(--paper-2)] shadow-[var(--shadow-float)] ${reducedMotion || drag !== 0 ? '' : 'transition-transform duration-200'}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--line)] py-1.5 pl-4 pr-2">
          <h2 className="text-[15px] font-semibold text-[var(--ink)]">{title}</h2>
          <button
            type="button"
            data-drawer-close
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink-2)] hover:bg-[var(--hover)] focus-visible:ring-2 focus-visible:ring-[var(--coral-line)] focus-visible:outline-none"
          >
            {closeIcon ?? <ChromeIcon name="close" className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
