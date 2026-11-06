/**
 * @file usePanelStack.ts
 * @description The side panel's stack, held in the address: `push(id)` opens a sub-view (a history entry, so the browser's Back leaves it too), `pop()` goes Back (Back arrow, Done, Cancel), and `stack` lists the open sub-views outermost first, empty at the page's root view. The page shows the view of the last id and passes `onBack={pop}` to `PanelContent` while the stack is not empty. A route keeps the parameter by running its search through `panelSearch` (panelStack.ts).
 * Needs `@tanstack/react-router`.
 * Used by: pages whose panel has sub-views.
 */
import { useCallback, useMemo } from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { PANEL_PARAM, parsePanelStack, poppedSearch, pushedSearch } from './panelStack';

export interface PanelStack {
  /** The sub-views open above the page's root view, outermost first; empty at the root. */
  stack: readonly string[];
  /** Open a sub-view: a history entry, so the browser's Back leaves it too. */
  push: (id: string) => void;
  /** Leave the last sub-view (the Back arrow, Done and Cancel). */
  pop: () => void;
}

/** The panel's stack, read from and written to the address. `param` names the query parameter. */
export function usePanelStack(param = PANEL_PARAM): PanelStack {
  const { pathname, searchStr } = useLocation();
  const router = useRouter();
  const key = parsePanelStack(new URLSearchParams(searchStr).get(param)).join(',');
  const stack = useMemo(() => (key ? key.split(',') : []), [key]);
  const go = useCallback(
    (next: (search: string) => string, replace: boolean) => {
      const search = next(router.state.location.searchStr);
      const href = search ? `${pathname}?${search}` : pathname;
      if (replace) router.history.replace(href);
      else router.history.push(href);
    },
    [router, pathname],
  );
  const push = useCallback((id: string) => go((s) => pushedSearch(s, id, param), false), [go, param]);
  const pop = useCallback(() => go((s) => poppedSearch(s, param), true), [go, param]);
  return { stack, push, pop };
}
