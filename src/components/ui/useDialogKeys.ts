/**
 * @file useDialogKeys.ts
 * @description The keyboard rules of a modal dialog: Escape closes the top dialog only, focus moves in when it opens (to the element marked `data-autofocus`, else the first control, else the dialog itself), Tab and Shift+Tab stay inside, and focus returns to what had it before. Only the topmost open dialog answers, so a confirmation over a form does not close both.
 * Ported from yard@0b9f18f:frontend/src/ui/Dialog.tsx.
 * Used by: Modal, MobileSheet's callers through AdaptiveDialog.
 */
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, oldest first; the last one owns the keys. */
const open: symbol[] = [];

export function useDialogKeys(ref: RefObject<HTMLElement | null>, active: boolean, onClose: () => void): void {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    const me = Symbol('dialog');
    open.push(me);
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!root.contains(document.activeElement)) {
      const target = root.querySelector<HTMLElement>('[data-autofocus]') ?? root.querySelector<HTMLElement>(FOCUSABLE);
      if (target) target.focus();
      else {
        root.tabIndex = -1;
        root.focus();
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (open[open.length - 1] !== me) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const at = document.activeElement;
      if (!root.contains(at)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && at === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && at === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      const at = open.indexOf(me);
      if (at >= 0) open.splice(at, 1);
      before?.focus();
    };
  }, [ref, active]);
}
