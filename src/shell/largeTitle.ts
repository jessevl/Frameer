/**
 * @file largeTitle.ts
 * @description The phone large title's scroll part: how far a scroll has collapsed it (`collapseProgress`, 0 to 1), and `useLargeTitleScroll`, which writes that to the stage as `--title-p` straight to the DOM (so scrolling never re-renders) and marks the stage `data-large-title`. `phone.css` reads the variable: the large title shrinks away and the header's compact title fades in. Which paths get a title and what it says is the app's.
 * Used by: PhoneHeader.
 */
import { useEffect, type RefObject } from 'react';

/** How far the list scrolls before the large title is gone. */
export const COLLAPSE_PX = 56;

/** 0 while the list is at the top, 1 once it scrolled `COLLAPSE_PX`. */
export function collapseProgress(scrollTop: number): number {
  return Math.min(1, Math.max(0, scrollTop / COLLAPSE_PX));
}

/**
 * Tracks the scroll of the stage that holds `ref` (its closest `root`, `main` by default). Scroll events do not bubble, so a capturing listener catches the list's own scroller or the stage's. `key` restarts it (the route). `scrollers` says which scrollers count: a selector they match or a predicate (every scroller when left out), so a horizontal strip does not reset the collapse; pass a stable value.
 */
export function useLargeTitleScroll(ref: RefObject<HTMLElement | null>, enabled: boolean, key: string, root = 'main', scrollers?: string | ((element: HTMLElement) => boolean)): void {
  useEffect(() => {
    const stage = ref.current?.closest<HTMLElement>(root);
    if (!stage || !enabled) return;
    stage.dataset.largeTitle = '';
    stage.style.setProperty('--title-p', '0');
    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (typeof scrollers === 'string' ? !target.matches(scrollers) : scrollers && !scrollers(target)) return;
      stage.style.setProperty('--title-p', String(collapseProgress(target.scrollTop)));
    };
    stage.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      stage.removeEventListener('scroll', onScroll, { capture: true });
      delete stage.dataset.largeTitle;
      stage.style.removeProperty('--title-p');
    };
  }, [ref, enabled, key, root, scrollers]);
}
