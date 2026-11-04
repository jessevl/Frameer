/**
 * @file FloatingSurface.tsx
 * @description The floating shell of menus and pickers: a portalled panel placed under an element (or at a point), flipped above it and kept inside the window, that becomes a sheet from the bottom on a phone. An outside press or Escape closes it; Escape returns the focus to where the person was.
 * Why: the context menu and the date and time pickers need the same placement, the same phone sheet and the same rule that Escape closes only the topmost floating thing (not the panel or dialog that hosts the field). The surface is marked `data-floating-panel` so a host panel does not treat a press inside it as a press outside.
 * Used by: ContextMenu and useContextMenu, DateField, DateRangeFields, TimeField.
 */
import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@frameer/lib/design-system';

/** Where a surface opens: under an element, or at a point (a right click or a long press). */
export type FloatingAnchor = { x: number; y: number } | Element;

const PHONE_QUERY = '(max-width: 767px)';

/** True below 768 px, whatever the device: there menus and pickers open as a sheet. */
export function usePhoneWidth(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia?.(PHONE_QUERY);
      mq?.addEventListener?.('change', notify);
      return () => mq?.removeEventListener?.('change', notify);
    },
    () => window.matchMedia?.(PHONE_QUERY)?.matches ?? false,
    () => false,
  );
}

// The open surfaces, oldest first: Escape belongs to the last one only.
const stack: object[] = [];

const MARGIN = 8;

interface FloatingSurfaceProps {
  anchor: FloatingAnchor;
  onClose: () => void;
  /** The accessible name of the panel. */
  label: string;
  role?: 'menu' | 'dialog' | 'listbox';
  id?: string;
  children: React.ReactNode;
  /** Classes for the panel on a desktop (its width, its padding). */
  className?: string;
  /** Where the focus goes when Escape closes the surface; nothing moves when this is null. */
  returnFocus?: HTMLElement | null;
  /** Open as a sheet from the bottom on a phone (default true). */
  sheetOnPhone?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Keep the focus where it is on a press inside the surface (a list under a text field). */
  keepFocus?: boolean;
}

function isElement(anchor: FloatingAnchor): anchor is Element {
  return typeof (anchor as Element).getBoundingClientRect === 'function';
}

export const FloatingSurface: React.FC<FloatingSurfaceProps> = ({
  anchor, onClose, label, role = 'dialog', id, children, className, returnFocus = null, sheetOnPhone = true, onKeyDown, keepFocus = false,
}) => {
  const phone = usePhoneWidth();
  const sheet = phone && sheetOnPhone;
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const returnRef = useRef(returnFocus);
  returnRef.current = returnFocus;

  // Place under the anchor (or at the point), above it when there is more room there, and inside the window. Until it
  // is placed the panel is transparent rather than hidden, so the focus can already move into it.
  useLayoutEffect(() => {
    if (sheet) return;
    const place = () => {
      const el = panel.current;
      if (!el) return;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const rect = isElement(anchor) ? anchor.getBoundingClientRect() : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y };
      const gap = isElement(anchor) ? 4 : 0;
      const below = window.innerHeight - rect.bottom - gap - MARGIN;
      const above = rect.top - gap - MARGIN;
      const up = height > below && above > below;
      const maxHeight = Math.max(120, up ? above : below);
      const shown = Math.min(height, maxHeight);
      const top = up ? Math.max(MARGIN, rect.top - gap - shown) : rect.bottom + gap;
      const left = Math.max(MARGIN, Math.min(rect.left, window.innerWidth - width - MARGIN));
      setPos({ left, top, maxHeight });
    };
    place();
    if (!isElement(anchor)) return;
    const onScroll = (e: Event) => {
      if (!panel.current?.contains(e.target as Node)) place();
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [anchor, sheet]);

  useEffect(() => {
    const me = {};
    stack.push(me);
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panel.current?.contains(target)) return;
      if (isElement(anchor) && anchor.contains(target)) return;
      closeRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || stack[stack.length - 1] !== me) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeRef.current();
      returnRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      const at = stack.indexOf(me);
      if (at >= 0) stack.splice(at, 1);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [anchor]);

  const common = {
    ref: panel,
    id,
    role,
    'aria-label': label,
    'data-floating-panel': '',
    onKeyDown,
    onMouseDown: keepFocus ? (e: React.MouseEvent) => e.preventDefault() : undefined,
  };

  if (sheet) {
    return createPortal(
      <div data-floating-panel className="fixed inset-0 z-[400]">
        <div className="absolute inset-0 bg-[var(--scrim)]" onClick={onClose} aria-hidden="true" />
        <div
          {...common}
          className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-[var(--radius-card)] border-t border-[var(--line-2)] bg-[var(--paper)] p-2 pb-[max(env(safe-area-inset-bottom),8px)] text-[var(--ink)] shadow-[var(--shadow-float)]"
        >
          <div className="mx-auto mb-2 mt-0.5 h-1 w-9 rounded-full bg-[var(--line-2)]" aria-hidden="true" />
          {children}
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      {...common}
      className={cn(
        'z-[400] overflow-y-auto overscroll-contain rounded-[var(--radius-thumb)] border border-[var(--line-2)] bg-[var(--paper)] text-[var(--ink)] shadow-[var(--shadow-float)]',
        className,
      )}
      style={{ position: 'fixed', left: pos?.left ?? 0, top: pos?.top ?? 0, maxHeight: pos?.maxHeight, maxWidth: 'calc(100vw - 16px)', opacity: pos ? 1 : 0 }}
    >
      {children}
    </div>,
    document.body,
  );
};
