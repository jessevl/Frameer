import { useState, useCallback, useEffect, RefObject } from 'react';

/**
 * Tracks horizontal scroll state for a container and provides a scrollBy helper.
 * Attaches its own listeners (scroll + ResizeObserver + MutationObserver) so the
 * caller doesn't need to wire up onScroll manually.
 */
export function useHorizontalScrollArrows(ref: RefObject<HTMLDivElement | null>) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, [ref]);

  const handleScrollBy = useCallback((direction: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(120, el.clientWidth * 0.6);
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, [ref]);

  useEffect(() => {
    updateScrollState();
    const el = ref.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });

    // Re-check when the container resizes (e.g. viewport change)
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    // Re-check when children are added/removed (dynamic content)
    const mo = new MutationObserver(updateScrollState);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref, updateScrollState]);

  return { canScrollLeft, canScrollRight, handleScrollBy };
}
